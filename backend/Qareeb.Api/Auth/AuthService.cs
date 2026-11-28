using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OtpNet;
using Qareeb.Api.Data;
using Qareeb.Api.Domain;

namespace Qareeb.Api.Auth;

public record AuthInput(string? Phone = null, string? Password = null, string? Email = null,
    Guid ChallengeId = default, string? Code = null, string? NewPassword = null, string? NewPhone = null,
    string? Totp = null, Guid UserId = default, string? NameEn = null, string? NameAr = null,
    Guid ApplicationId = default, bool Approve = false, string? Note = null);

// Actor credentials re-entered for a provider review; never stored.
public record ReviewInput(string? Password = null, string? Totp = null, string? Note = null);

public class AuthService(QareebDbContext db, UserManager<AppUser> users, ISmsSender sms,
    IDataProtectionProvider protection, TimeProvider clock)
{
    private readonly PasswordHasher<AuthenticationChallenge> hasher = new();
    private readonly IDataProtector totpProtector = protection.CreateProtector("Qareeb.Totp.v1");
    public static void Check(IdentityResult result)
    {
        if (!result.Succeeded) throw new AuthFailure(string.Join(" ", result.Errors.Select(x => x.Description)));
    }

    // Serialize identity/challenge changes across processes; short local foundation
    // transactions. Partition this lock by account before scaling.
    public async Task<IResult> Execute(string action, AuthInput input, HttpContext http)
    {
        await using var tx = await db.Database.BeginTransactionAsync();
        await db.Database.ExecuteSqlRawAsync("""
            DECLARE @r int;
            EXEC @r=sys.sp_getapplock @Resource='qareeb:auth', @LockMode='Exclusive', @LockOwner='Transaction', @LockTimeout=10000;
            IF @r < 0 THROW 51001, 'Authentication busy.', 1;
            """);
        try
        {
            var result = await Handle(action, input, http);
            await db.SaveChangesAsync();
            await tx.CommitAsync();
            return result;
        }
        catch (AuthFailure ex)
        {
            // Persist failed OTP/password attempts and account lockouts.
            await db.SaveChangesAsync();
            await tx.CommitAsync();
            return Results.Problem(ex.Message, statusCode: ex.Status);
        }
    }

    private async Task<AppUser> Current(HttpContext http)
    {
        var user = await users.GetUserAsync(http.User);
        if (user is null || !user.IsActive || !user.PhoneNumberConfirmed) throw new AuthFailure("Sign in required.", 401);
        return user;
    }
    private async Task Password(AppUser? user, string? password)
    {
        if (user is null || password is null || password.Length > 128)
        {
            // Perform comparable password work for unknown accounts.
            _ = new PasswordHasher<AppUser>().HashPassword(new AppUser(), "dummy-password-work");
            throw new AuthFailure("Invalid credentials.", 401);
        }
        if (await users.IsLockedOutAsync(user)) throw new AuthFailure("Invalid credentials.", 401);
        if (!await users.CheckPasswordAsync(user, password))
        {
            Check(await users.AccessFailedAsync(user));
            throw new AuthFailure("Invalid credentials.", 401);
        }
    }
    private async Task<AppUser?> Find(string? phone) =>
        await db.Users.SingleOrDefaultAsync(x => x.PhoneNumber == Phones.Normalize(phone));

    private async Task<Guid> Issue(AppUser user, string phone, string purpose)
    {
        var now = clock.GetUtcNow();
        var recent = await db.AuthenticationChallenges.Where(x => x.Phone == phone && x.Purpose == purpose && x.CreatedAt > now.AddHours(-1)).ToListAsync();
        var accountRecent = await db.AuthenticationChallenges.Where(x => x.UserId == user.Id && x.Purpose == purpose && x.CreatedAt > now.AddHours(-1)).ToListAsync();
        if (recent.Count >= 5 || accountRecent.Count >= 5)
            throw new AuthFailure("Please wait before requesting another code.", 429);
        // Spacing applies to pending (unconsumed) challenges only; a consumed code must not block a new request.
        var pending = await db.AuthenticationChallenges.Where(x => x.UserId == user.Id && x.Purpose == purpose && x.ConsumedAt == null).ToListAsync();
        var pendingByPhone = await db.AuthenticationChallenges.Where(x => x.Phone == phone && x.Purpose == purpose && x.ConsumedAt == null).ToListAsync();
        if (pending.Any(x => x.CreatedAt > now.AddSeconds(-60)) || pendingByPhone.Any(x => x.CreatedAt > now.AddSeconds(-60)))
            throw new AuthFailure("Please wait before requesting another code.", 429);
        foreach (var old in pending) old.ConsumedAt = now;
        var challenge = new AuthenticationChallenge { UserId = user.Id, Phone = phone, Purpose = purpose,
            SecurityStamp = user.SecurityStamp!, ExpiresAt = now.AddMinutes(5) };
        var code = RandomNumberGenerator.GetInt32(0, 1000000).ToString("D6");
        challenge.CodeHash = hasher.HashPassword(challenge, challenge.Id + ":" + code);
        // A configured delivery adapter must not log code or phone; no real adapter yet.
        await sms.SendAsync(challenge.Id, phone, code);
        db.AuthenticationChallenges.Add(challenge);
        return challenge.Id;
    }
    private async Task<(AuthenticationChallenge Challenge, AppUser User)> Verify(AuthInput input, string purpose)
    {
        var challenge = await db.AuthenticationChallenges.SingleOrDefaultAsync(x => x.Id == input.ChallengeId && x.Purpose == purpose);
        if (challenge is null || challenge.ConsumedAt != null || challenge.ExpiresAt <= clock.GetUtcNow() || challenge.Attempts >= 5)
            throw new AuthFailure("Invalid or expired code.");
        var user = await users.FindByIdAsync(challenge.UserId.ToString());
        if (user is null || user.SecurityStamp != challenge.SecurityStamp) throw new AuthFailure("Invalid or expired code.");
        challenge.Attempts++;
        if (input.Code is null || input.Code.Length != 6 ||
            hasher.VerifyHashedPassword(challenge, challenge.CodeHash, challenge.Id + ":" + input.Code) == PasswordVerificationResult.Failed)
            throw new AuthFailure("Invalid or expired code.");
        return (challenge, user);
    }
    private async Task<bool> Admin(AppUser user) => await users.IsInRoleAsync(user, Roles.Admin);
    private async Task RequireTotp(AppUser user, string? code)
    {
        if (await users.IsLockedOutAsync(user)) throw new AuthFailure("Invalid authenticator code.", 401);
        if (user.TotpSecretProtected is null || code is null || code.Length != 6 ||
            !new Totp(Base32Encoding.ToBytes(totpProtector.Unprotect(user.TotpSecretProtected)))
                .VerifyTotp(clock.GetUtcNow().UtcDateTime, code, out var step, new VerificationWindow(1, 1))
            || step <= user.LastTotpStep)
        {
            Check(await users.AccessFailedAsync(user));
            throw new AuthFailure("Invalid authenticator code.", 401);
        }
        user.LastTotpStep = step;
    }
    private async Task SignIn(AppUser user, HttpContext http, bool mfa)
    {
        Check(await users.ResetAccessFailedCountAsync(user));
        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new("stamp", user.SecurityStamp!), new("mfa", mfa ? "true" : "false") };
        claims.AddRange((await users.GetRolesAsync(user)).Select(r => new Claim(ClaimTypes.Role, r)));
        await http.SignInAsync("QareebCookie", new ClaimsPrincipal(new ClaimsIdentity(claims, "QareebCookie")),
            new AuthenticationProperties { IsPersistent = false, ExpiresUtc = clock.GetUtcNow().AddMinutes(30) });
    }

    private async Task<IResult> Handle(string action, AuthInput i, HttpContext http)
    {
        switch (action)
        {
            case "register":
            {
                var phone = Phones.Normalize(i.Phone);
                if (i.Password is null || i.Password.Length is < 12 or > 128) throw new AuthFailure("Password must be 12–128 characters.");
                if (i.Email is not null && (i.Email.Length > 254 || !System.Net.Mail.MailAddress.TryCreate(i.Email, out _)))
                    throw new AuthFailure("Invalid optional email.");
                var user = await db.Users.SingleOrDefaultAsync(x => x.PhoneNumber == phone);
                if (user is null)
                {
                    user = new AppUser { Id = Guid.NewGuid(), UserName = Guid.NewGuid().ToString("N"),
                        PhoneNumber = phone, NormalizedPhone = phone, Email = i.Email, IsActive = false, LockoutEnabled = true };
                    Check(await users.CreateAsync(user, i.Password));
                    Check(await users.AddToRoleAsync(user, Roles.Customer));
                }
                else if (!user.IsActive)
                {
                    // The pending signup never activated, so the owner may restart it with a
                    // new password. Only the phone holder can finish it with the OTP.
                    Check(await users.ResetPasswordAsync(user, await users.GeneratePasswordResetTokenAsync(user), i.Password));
                }
                // An already-active account keeps its password and gets a real challenge.
                // Ownership is proven by the OTP; the response never reveals existence.
                return Results.Accepted(value: new { challengeId = await Issue(user, phone, "signup") });
            }
            case "resend":
            {
                var user = await Find(i.Phone);
                // Existing accounts get a usable challenge; the outcome is only revealed
                // after the code is entered, so no account-enumeration signal is added.
                var id = user is null ? Guid.NewGuid() : await Issue(user, user.PhoneNumber!, "signup");
                return Results.Accepted(value: new { challengeId = id });
            }
            case "verify-phone":
            {
                var (challenge, user) = await Verify(i, "signup");
                if (user.IsActive && user.PhoneNumberConfirmed)
                {
                    challenge.ConsumedAt = clock.GetUtcNow();
                    return Results.Ok(new { accountExists = true });
                }
                await Password(user, i.Password);
                user.PhoneNumberConfirmed = true;
                user.IsActive = true;
                challenge.ConsumedAt = clock.GetUtcNow();
                Check(await users.UpdateSecurityStampAsync(user));
                return Results.Ok(new { message = "Phone verified. Sign in with phone and password." });
            }
            case "login":
            {
                var user = await Find(i.Phone);
                await Password(user, i.Password);
                if (!user!.IsActive || !user.PhoneNumberConfirmed) throw new AuthFailure("Invalid credentials.", 401);
                var admin = await Admin(user);
                if (admin)
                {
                    if (!user.TwoFactorEnabled) return Results.Problem("Administrator authenticator enrollment required.", statusCode: 403);
                    await RequireTotp(user, i.Totp);
                }
                await SignIn(user, http, admin);
                return Results.Ok(new { user.Id, roles = await users.GetRolesAsync(user) });
            }
            case "logout":
                await http.SignOutAsync("QareebCookie");
                return Results.NoContent();
            case "recovery/request":
            {
                var user = await Find(i.Phone);
                var id = user is { IsActive: true, PhoneNumberConfirmed: true } ? await Issue(user, user.PhoneNumber!, "recovery") : Guid.NewGuid();
                return Results.Accepted(value: new { challengeId = id });
            }
            case "recovery/confirm":
            {
                var (challenge, user) = await Verify(i, "recovery");
                if (!user.IsActive) throw new AuthFailure("Account unavailable.");
                if (await Admin(user)) await RequireTotp(user, i.Totp);
                if (i.NewPassword is null || i.NewPassword.Length is < 12 or > 128) throw new AuthFailure("Password must be 12–128 characters.");
                Check(await users.ResetPasswordAsync(user, await users.GeneratePasswordResetTokenAsync(user), i.NewPassword));
                challenge.ConsumedAt = clock.GetUtcNow();
                return Results.Ok(new { message = "Password reset. Sign in again." });
            }
            case "phone-change/request":
            {
                var user = await Current(http);
                await Password(user, i.Password);
                if (await Admin(user)) await RequireTotp(user, i.Totp);
                var phone = Phones.Normalize(i.NewPhone);
                if (await db.Users.AnyAsync(x => x.PhoneNumber == phone)) throw new AuthFailure("Phone unavailable.");
                return Results.Accepted(value: new { challengeId = await Issue(user, phone, "phone-change") });
            }
            case "phone-change/confirm":
            {
                var current = await Current(http);
                var (challenge, user) = await Verify(i, "phone-change");
                if (current.Id != user.Id) throw new AuthFailure("Invalid challenge.", 403);
                await Password(user, i.Password);
                if (await db.Users.AnyAsync(x => x.PhoneNumber == challenge.Phone)) throw new AuthFailure("Phone unavailable.");
                user.PhoneNumber = challenge.Phone;
                user.NormalizedPhone = challenge.Phone;
                user.PhoneNumberConfirmed = true;
                challenge.ConsumedAt = clock.GetUtcNow();
                Check(await users.UpdateSecurityStampAsync(user));
                await http.SignOutAsync("QareebCookie");
                return Results.Ok();
            }
            case "admin/totp/status":
            {
                // Unenrolled admins cannot hold a session, so enrollment state is
                // discoverable with the account password. No session is issued.
                var user = await Find(i.Phone);
                await Password(user, i.Password);
                if (!user!.IsActive || !user.PhoneNumberConfirmed) throw new AuthFailure("Invalid credentials.", 401);
                var admin = await Admin(user);
                return Results.Ok(new { admin, enrolled = admin && user.TwoFactorEnabled });
            }
            case "admin/totp/setup":
            {
                var user = await Find(i.Phone);
                await Password(user, i.Password);
                if (!user!.IsActive || !user.PhoneNumberConfirmed || !await Admin(user)) throw new AuthFailure("Not permitted.", 403);
                if (user.TwoFactorEnabled) throw new AuthFailure("Authenticator already enrolled.");
                // Initial enrollment also requires possession of the verified phone.
                return Results.Accepted(value: new { challengeId = await Issue(user, user.PhoneNumber!, "totp-enroll") });
            }
            case "admin/totp/secret":
            {
                var (challenge, user) = await Verify(i, "totp-enroll");
                await Password(user, i.Password);
                if (!await Admin(user) || user.TwoFactorEnabled) throw new AuthFailure("Not permitted.", 403);
                var secret = Base32Encoding.ToString(RandomNumberGenerator.GetBytes(20));
                user.TotpSecretProtected = totpProtector.Protect(secret);
                user.LastTotpStep = -1;
                challenge.ConsumedAt = clock.GetUtcNow();
                return Results.Ok(new { secret, uri = $"otpauth://totp/Qareeb:{user.Id}?secret={secret}&issuer=Qareeb&digits=6&period=30" });
            }
            case "admin/totp/verify":
            {
                var user = await Find(i.Phone);
                await Password(user, i.Password);
                if (!user!.IsActive || !user.PhoneNumberConfirmed || !await Admin(user)) throw new AuthFailure("Not permitted.", 403);
                await RequireTotp(user, i.Totp);
                user.TwoFactorEnabled = true;
                Check(await users.UpdateSecurityStampAsync(user));
                await SignIn(user, http, true);
                return Results.Ok();
            }
            case "provider/apply":
            {
                var user = await Current(http);
                if (string.IsNullOrWhiteSpace(i.NameEn) || string.IsNullOrWhiteSpace(i.NameAr) || i.NameEn.Length > 256 || i.NameAr.Length > 256)
                    throw new AuthFailure("English and Arabic provider names are required.");
                var existing = await db.Providers.SingleOrDefaultAsync(x => x.OwnerId == user.Id);
                if (existing is not null)
                {
                    if (existing.IsApproved) throw new AuthFailure("Provider access is already active.");
                    if (existing.ReviewedAt is null) throw new AuthFailure("Application already exists.");
                    // A rejected application may be resubmitted for review.
                    existing.NameEn = i.NameEn;
                    existing.NameAr = i.NameAr;
                    existing.ReviewedAt = null;
                    existing.ReviewedById = null;
                    existing.ReviewNote = null;
                    return Results.Accepted();
                }
                db.Providers.Add(new ProviderProfile { OwnerId = user.Id, NameEn = i.NameEn, NameAr = i.NameAr, IsApproved = false });
                return Results.Accepted();
            }
            case "admin/review-provider":
            {
                var actor = await Current(http);
                if (!await Admin(actor) || http.User.FindFirstValue("mfa") != "true") throw new AuthFailure("Administrator MFA required.", 403);
                await Password(actor, i.Password);
                await RequireTotp(actor, i.Totp);
                var provider = await db.Providers.SingleOrDefaultAsync(x => x.Id == i.ApplicationId);
                if (provider is null) throw new AuthFailure("Application not found.", 404);
                return Results.Ok(await Review(actor, provider, i.Approve, i.Note));
            }
            case "admin/approve-provider":
            case "admin/grant-admin":
            {
                var actor = await Current(http);
                if (!await Admin(actor) || http.User.FindFirstValue("mfa") != "true") throw new AuthFailure("Administrator MFA required.", 403);
                await Password(actor, i.Password);
                await RequireTotp(actor, i.Totp);
                var target = await users.FindByIdAsync(i.UserId.ToString());
                if (target is null || !target.IsActive || !target.PhoneNumberConfirmed) throw new AuthFailure("Verified active account required.");
                if (action == "admin/approve-provider")
                {
                    var provider = await db.Providers.SingleOrDefaultAsync(x => x.OwnerId == target.Id);
                    if (provider is null) throw new AuthFailure("No pending provider application.");
                    return Results.Ok(await Review(actor, provider, true, null));
                }
                Check(await users.AddToRoleAsync(target, Roles.Admin));
                Check(await users.UpdateSecurityStampAsync(target));
                return Results.Ok();
            }
            default: return Results.NotFound();
        }
    }

    // Approval is the only path that grants Provider. Rejection records the decision
    // without touching roles, so the applicant stays a Customer. Approval rotates the
    // applicant's security stamp so an old session cannot keep pre-approval claims.
    private async Task<object> Review(AppUser actor, ProviderProfile provider, bool approve, string? note)
    {
        if (provider.IsApproved) throw new AuthFailure("Application already approved.");
        if (provider.ReviewedAt is not null) throw new AuthFailure("Application already reviewed.");
        var owner = await users.FindByIdAsync(provider.OwnerId.ToString());
        if (owner is null || !owner.IsActive || !owner.PhoneNumberConfirmed) throw new AuthFailure("Verified active account required.");
        provider.ReviewedAt = clock.GetUtcNow();
        provider.ReviewedById = actor.Id;
        if (approve)
        {
            provider.IsApproved = true;
            provider.ReviewNote = null;
            Check(await users.AddToRoleAsync(owner, Roles.Provider));
            Check(await users.UpdateSecurityStampAsync(owner));
        }
        else
        {
            var trimmed = string.IsNullOrWhiteSpace(note) ? null : note.Trim();
            if (trimmed?.Length > 256) throw new AuthFailure("Review note is too long.");
            provider.ReviewNote = trimmed;
        }
        return new { provider.Id, status = provider.IsApproved ? "Approved" : "Rejected" };
    }
}
