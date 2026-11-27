using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Qareeb.Api.Data;
using Qareeb.Api.Domain;
using Qareeb.Api.Services;
using Qareeb.Api.Auth;
using System.Text.Json;
using OtpNet;

namespace Qareeb.Api.Tests;

// A fresh local database per run; intentionally retained, never dropped or reset.
public class FoundationTests : IAsyncLifetime
{
    private string connection = "";
    private string root = "";
    private WebApplicationFactory<Program>? factory;
    private Guid otherCustomer;
    private Guid admin;
    private Guid otherOwner;
    private QareebDbContext Open() => new(new DbContextOptionsBuilder<QareebDbContext>().UseSqlServer(connection).Options);

    public async Task InitializeAsync()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Qareeb.sln"))) directory = directory.Parent;
        root = directory!.FullName;
        var database = "Qareeb_Development_Test_" + Guid.NewGuid().ToString("N");
        connection = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder
        {
            DataSource = @"(localdb)\MSSQLLocalDB", InitialCatalog = database,
            IntegratedSecurity = true, TrustServerCertificate = true
        }.ConnectionString;
        Environment.SetEnvironmentVariable("QAREEB_DB_CONNECTION", connection);
        await LocalDatabase.CreateNewAsync(LocalDatabase.Connection(), root);
        await using var db = Open();
        await db.Database.MigrateAsync();
        await DevelopmentSeed.RunAsync(db);
        await DevelopmentSeed.RunAsync(db);
        Assert.Equal(1, await db.Providers.CountAsync());
        Assert.Equal(2, await db.Users.CountAsync());
        Assert.All(await db.Users.ToListAsync(), u => { Assert.False(u.IsActive); Assert.Null(u.PasswordHash); });
        foreach (var user in await db.Users.ToListAsync()) { user.IsActive = true; user.PhoneNumberConfirmed = true; user.SecurityStamp = Guid.NewGuid().ToString(); }
        otherCustomer = await AddUser(db, Roles.Customer);
        admin = await AddUser(db, Roles.Admin);
        otherOwner = await AddUser(db, Roles.Provider);
        await db.SaveChangesAsync();
    }

    private static async Task<Guid> AddUser(QareebDbContext db, string role)
    {
        var id = Guid.NewGuid();
        db.Users.Add(new AppUser { Id = id, UserName = id.ToString(), IsActive = true,
            PhoneNumberConfirmed = true, SecurityStamp = Guid.NewGuid().ToString(), TwoFactorEnabled = role == Roles.Admin });
        var roleId = await db.Roles.Where(x => x.Name == role).Select(x => x.Id).SingleAsync();
        db.UserRoles.Add(new IdentityUserRole<Guid> { UserId = id, RoleId = roleId });
        return id;
    }

    private static CreateAppointment Request(int days = 2) => new(
        DevelopmentSeed.ProviderId, DevelopmentSeed.LocationId, DevelopmentSeed.StaffId,
        [DevelopmentSeed.ServiceId], new DateTimeOffset(DateTime.UtcNow.Date.AddDays(days).AddHours(10), TimeSpan.Zero));

    [Fact]
    public async Task Database_and_api_enforce_booking_and_security_invariants()
    {
        // Race the same interval using independent connections.
        async Task<bool> TryBook()
        {
            await using var db = Open();
            try { await new BookingService(db, TimeProvider.System).CreateAsync(DevelopmentSeed.CustomerId, Request()); return true; }
            catch (BookingConflictException) { return false; }
        }
        var race = await Task.WhenAll(TryBook(), TryBook());
        Assert.Single(race, x => x);
        await using var verify = Open();
        var first = await verify.Appointments.Include(x => x.Services).SingleAsync();
        Assert.Equal(200, first.TotalPrice);
        Assert.Equal("قصة الشعر الملكية الخاصة", first.Services.Single().TitleAr);
        Assert.Equal(TimeSpan.FromMinutes(45), first.EndsAt - first.StartsAt);
        Assert.NotEmpty(first.Version);
        var issued = VerificationCodes.Issue(first.Id, DateTimeOffset.UtcNow);
        verify.VerificationCodes.Add(issued.Record);
        await verify.SaveChangesAsync();
        await using (var a = Open())
        await using (var b = Open())
        {
            var codeA = await a.VerificationCodes.SingleAsync();
            var codeB = await b.VerificationCodes.SingleAsync();
            Assert.NotEqual(issued.Plaintext, codeA.CodeHash);
            Assert.True(VerificationCodes.Consume(codeA, issued.Plaintext, DateTimeOffset.UtcNow));
            Assert.True(VerificationCodes.Consume(codeB, issued.Plaintext, DateTimeOffset.UtcNow));
            await a.SaveChangesAsync();
            // A second consumer cannot persist success using stale state.
            await Assert.ThrowsAsync<DbUpdateConcurrencyException>(() => b.SaveChangesAsync());
        }

        // Adjacent intervals are allowed; half-open intervals prevent false overlap.
        await using (var db = Open())
            await new BookingService(db, TimeProvider.System).CreateAsync(DevelopmentSeed.CustomerId, Request() with { StartsAt = first.EndsAt });

        // Direct writes cannot bypass SQL overlap enforcement.
        await using (var db = Open())
        {
            db.Appointments.Add(new Appointment { CustomerId = DevelopmentSeed.CustomerId, ProviderId = first.ProviderId,
                LocationId = first.LocationId, StaffId = first.StaffId, StartsAt = first.StartsAt.AddMinutes(5), EndsAt = first.EndsAt.AddMinutes(5) });
            var error = await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
            Assert.Equal(51000, Assert.IsType<Microsoft.Data.SqlClient.SqlException>(error.InnerException).Number);
        }
        // Other staff can work concurrently.
        Guid secondStaff;
        await using (var db = Open())
        {
            var staff = new ProviderStaff { ProviderId = first.ProviderId, NameEn = "Second test specialist", NameAr = "أخصائي تجريبي ثان" };
            secondStaff = staff.Id;
            db.Staff.Add(staff);
            foreach (var day in Enum.GetValues<DayOfWeek>())
                db.Hours.Add(new WorkingHours { ProviderId = first.ProviderId, StaffId = staff.Id, LocationId = first.LocationId,
                    Day = day, OpensAt = new TimeOnly(9, 0), ClosesAt = new TimeOnly(20, 0) });
            await db.SaveChangesAsync();
            await new BookingService(db, TimeProvider.System).CreateAsync(DevelopmentSeed.CustomerId, Request() with { StaffId = secondStaff });
        }
        await using (var db = Open())
        {
            var provider = await db.Providers.SingleAsync();
            provider.VacationMode = true;
            await db.SaveChangesAsync();
            await Assert.ThrowsAsync<BookingConflictException>(() => new BookingService(db, TimeProvider.System).CreateAsync(DevelopmentSeed.CustomerId, Request(3)));
            provider.VacationMode = false;
            await db.SaveChangesAsync();
            await Assert.ThrowsAsync<BookingValidationException>(() => new BookingService(db, TimeProvider.System).CreateAsync(
                DevelopmentSeed.CustomerId, Request(3) with { ServiceIds = [Guid.NewGuid()] }));
            await Assert.ThrowsAsync<BookingConflictException>(() => new BookingService(db, TimeProvider.System).CreateAsync(
                DevelopmentSeed.CustomerId, Request(3) with { StartsAt = Request(3).StartsAt.Date.AddHours(1) }));
            db.AvailabilityExceptions.Add(new AvailabilityException { ProviderId = first.ProviderId, StaffId = first.StaffId,
                StartsAt = Request(3).StartsAt, EndsAt = Request(3).StartsAt.AddHours(1) });
            await db.SaveChangesAsync();
            await Assert.ThrowsAsync<BookingConflictException>(() => new BookingService(db, TimeProvider.System).CreateAsync(DevelopmentSeed.CustomerId, Request(3)));
        }
        // Foreign keys reject services/staff belonging to another provider.
        await using (var db = Open())
        {
            db.Appointments.Add(new Appointment { CustomerId = DevelopmentSeed.CustomerId, ProviderId = Guid.NewGuid(),
                LocationId = first.LocationId, StaffId = first.StaffId, StartsAt = Request(4).StartsAt, EndsAt = Request(4).StartsAt.AddHours(1) });
            await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
        }
        // Reviews are tied to the booking customer.
        await using (var db = Open())
        {
            db.Reviews.Add(new Review { AppointmentId = first.Id, AuthorId = otherCustomer, Rating = 5, Body = "Not the appointment owner" });
            await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
        }
        await Assert.ThrowsAsync<InvalidOperationException>(() => LocalDatabase.CreateNewAsync(connection, root));
        Assert.Equal(3, await verify.Appointments.CountAsync());
        await CheckHttpPermissions(first.Id);
    }

    private async Task CheckHttpPermissions(Guid appointmentId)
    {
        factory = new WebApplicationFactory<Program>().WithWebHostBuilder(b =>
            b.UseContentRoot(Path.Combine(root, "backend", "Qareeb.Api")).UseEnvironment("Development"));
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });
        Assert.Contains("js/auth-api.js", await client.GetStringAsync("/"));
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/js/components/account.js")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/css/account.css")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/.local/keys")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/backend/Qareeb.Api/appsettings.json")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/health")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/providers")).StatusCode);
        client.DefaultRequestHeaders.Add("X-Demo-Role", "PlatformAdmin");
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/admin/reports")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/appointments", Request(5))).StatusCode);
        SetToken(client, otherCustomer, Roles.Customer);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/admin/reports")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/appointments/{appointmentId}")).StatusCode);
        SetToken(client, DevelopmentSeed.CustomerId, Roles.Customer);
        var csrf = await client.GetFromJsonAsync<System.Text.Json.JsonElement>("/api/auth/csrf");
        client.DefaultRequestHeaders.Add("X-CSRF-TOKEN", csrf.GetProperty("token").GetString());
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync($"/api/appointments/{appointmentId}")).StatusCode);
        Assert.Equal(HttpStatusCode.Created, (await client.PostAsJsonAsync("/api/appointments", Request(5))).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync("/api/appointments", Request(5))).StatusCode);
        SetToken(client, DevelopmentSeed.OwnerId, Roles.Provider);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync($"/api/appointments/{appointmentId}")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/provider/appointments")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync("/api/appointments", Request(6))).StatusCode);
        SetToken(client, otherOwner, Roles.Provider);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/appointments/{appointmentId}")).StatusCode);
        SetToken(client, admin, Roles.Admin);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/admin/reports")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync($"/api/appointments/{appointmentId}")).StatusCode);
        // Even cryptographically valid stale/incorrect role claims are rejected.
        SetToken(client, otherCustomer, Roles.Admin);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/admin/reports")).StatusCode);
    }

    private void SetToken(HttpClient client, Guid id, string role)
    {
        // In-process test-only token minting. No application endpoint issues tokens.
        using var db = Open();
        var stamp = db.Users.Single(x => x.Id == id).SecurityStamp!;
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
            [new Claim(ClaimTypes.NameIdentifier, id.ToString()), new Claim(ClaimTypes.Role, role),
             new Claim("stamp", stamp), new Claim("mfa", role == Roles.Admin ? "true" : "false")], "QareebCookie"));
        var options = factory!.Services.GetRequiredService<IOptionsMonitor<CookieAuthenticationOptions>>().Get("QareebCookie");
        var ticket = new AuthenticationTicket(principal, new AuthenticationProperties { ExpiresUtc = DateTimeOffset.UtcNow.AddMinutes(5) }, "QareebCookie");
        client.DefaultRequestHeaders.Remove("Cookie");
        client.DefaultRequestHeaders.Add("Cookie", "__Host-Qareeb=" + options.TicketDataFormat.Protect(ticket));
    }

    [Fact]
    public async Task Public_discovery_exposes_only_approved_active_providers_and_honors_filters()
    {
        factory = new WebApplicationFactory<Program>().WithWebHostBuilder(b =>
            b.UseContentRoot(Path.Combine(root, "backend", "Qareeb.Api")).UseEnvironment("Development"));
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });

        var categories = await client.GetFromJsonAsync<JsonElement>("/api/public/categories");
        var barber = categories.EnumerateArray().Single(x => x.GetProperty("id").GetString() == "barber");
        Assert.Equal(1, barber.GetProperty("count").GetInt32());
        Assert.Contains(categories.EnumerateArray(), x => x.GetProperty("id").GetString() == "facial");

        var all = await client.GetFromJsonAsync<JsonElement>("/api/public/providers");
        var allList = all.EnumerateArray().ToList();
        Assert.Single(allList);
        var publicId = allList[0].GetProperty("id").GetString();

        var byService = await client.GetFromJsonAsync<JsonElement>("/api/public/providers?query=Signature");
        Assert.Single(byService.EnumerateArray());
        Assert.Empty((await client.GetFromJsonAsync<JsonElement>("/api/public/providers?category=nails")).EnumerateArray());
        Assert.Empty((await client.GetFromJsonAsync<JsonElement>("/api/public/providers?minRating=5")).EnumerateArray());
        Assert.Single((await client.GetFromJsonAsync<JsonElement>("/api/public/providers?priceTier=standard")).EnumerateArray());
        Assert.Single((await client.GetFromJsonAsync<JsonElement>("/api/public/providers?availability=today")).EnumerateArray());

        var detail = await client.GetFromJsonAsync<JsonElement>($"/api/public/providers/{publicId}");
        Assert.Equal("Royal Fade — fictional development venue", detail.GetProperty("nameEn").GetString());
        Assert.Single(detail.GetProperty("services").EnumerateArray());
        Assert.Equal(7, detail.GetProperty("hours").EnumerateArray().Count());
        var gallery = Assert.Single(detail.GetProperty("gallery").EnumerateArray());
        Assert.False(string.IsNullOrWhiteSpace(gallery.GetProperty("url").GetString()));
        Assert.Equal("Studio interior", gallery.GetProperty("captionEn").GetString());
        Assert.False(string.IsNullOrWhiteSpace(detail.GetProperty("phone").GetString()));
        Assert.False(string.IsNullOrWhiteSpace(detail.GetProperty("addressEn").GetString()));

        // A pending application and a vacation-mode provider are never public.
        await using (var db = Open())
        {
            db.Providers.Add(new ProviderProfile { OwnerId = otherOwner, NameEn = "Pending Shop", NameAr = "متجر قيد المراجعة", IsApproved = false });
            var approved = await db.Providers.SingleAsync(x => x.Id == DevelopmentSeed.ProviderId);
            approved.VacationMode = true;
            await db.SaveChangesAsync();
        }
        Assert.Empty((await client.GetFromJsonAsync<JsonElement>("/api/public/providers")).EnumerateArray());
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/public/providers/{publicId}")).StatusCode);
    }

    [Fact]
    public async Task Phone_authentication_cookie_otp_recovery_and_admin_enrollment()
    {
        factory = new WebApplicationFactory<Program>().WithWebHostBuilder(b =>
            b.UseContentRoot(Path.Combine(root, "backend", "Qareeb.Api")).UseEnvironment("Development"));
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });
        async Task Csrf()
        {
            var token = await client.GetFromJsonAsync<JsonElement>("/api/auth/csrf");
            client.DefaultRequestHeaders.Remove("X-CSRF-TOKEN");
            client.DefaultRequestHeaders.Add("X-CSRF-TOKEN", token.GetProperty("token").GetString());
        }
        async Task<HttpResponseMessage> Post(string route, AuthInput input) => await client.PostAsJsonAsync("/api/auth/" + route, input);
        async Task<(Guid Id, string Code)> Challenge(HttpResponseMessage response)
        {
            Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            var id = json.GetProperty("challengeId").GetGuid();
            using var scope = factory.Services.CreateScope();
            var code = scope.ServiceProvider.GetRequiredService<DevelopmentSmsSender>().Read(id);
            await using var db = Open();
            var row = await db.AuthenticationChallenges.SingleAsync(x => x.Id == id);
            Assert.DoesNotContain(code, row.CodeHash);
            return (id, code);
        }
        const string phone = "+1 202-555-0123";
        const string password = "Local-Test-Password42!";
        Assert.Equal("+20223456789", Phones.Normalize("+20 2 2345 6789"));
        Assert.Throws<AuthFailure>(() => Phones.Normalize("2025550123"));
        Assert.Equal(HttpStatusCode.BadRequest, (await Post("register", new(Phone: phone, Password: password))).StatusCode);
        await Csrf();
        var signup = await Challenge(await Post("register", new(Phone: phone, Password: password)));
        Assert.Equal(HttpStatusCode.TooManyRequests, (await Post("resend", new(Phone: phone))).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await Post("login", new(Phone: phone, Password: password))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await Post("verify-phone", new(ChallengeId: signup.Id, Code: "xxxxxx", Password: password))).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Post("verify-phone", new(ChallengeId: signup.Id, Code: signup.Code, Password: password))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await Post("verify-phone", new(ChallengeId: signup.Id, Code: signup.Code, Password: password))).StatusCode);
        var login = await Post("login", new(Phone: "+12025550123", Password: password));
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        var cookie = login.Headers.GetValues("Set-Cookie").Single(x => x.StartsWith("__Host-Qareeb="));
        Assert.Contains("secure", cookie.ToLowerInvariant());
        Assert.Contains("httponly", cookie.ToLowerInvariant());
        Assert.Contains("samesite=strict", cookie.ToLowerInvariant());
        await Csrf();
        var me = await client.GetFromJsonAsync<JsonElement>("/api/auth/me");
        var id = me.GetProperty("id").GetGuid();
        Assert.Equal("Customer", me.GetProperty("roles")[0].GetString());
        Assert.Equal(HttpStatusCode.Accepted, (await Post("provider/apply", new(NameEn: "Test provider", NameAr: "مزود تجريبي"))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/provider/appointments")).StatusCode);
        var change = await Challenge(await Post("phone-change/request", new(Password: password, NewPhone: "+442079460123")));
        Assert.Equal(HttpStatusCode.OK, (await Post("phone-change/confirm", new(Password: password, ChallengeId: change.Id, Code: change.Code))).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/auth/me")).StatusCode);
        await Csrf();
        var recovery = await Challenge(await Post("recovery/request", new(Phone: "+442079460123")));
        const string newPassword = "Replacement-Password42!";
        Assert.Equal(HttpStatusCode.OK, (await Post("recovery/confirm", new(ChallengeId: recovery.Id, Code: recovery.Code, NewPassword: newPassword))).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Post("login", new(Phone: "+442079460123", Password: newPassword))).StatusCode);
        await Csrf();
        Assert.Equal(HttpStatusCode.NoContent, (await Post("logout", new())).StatusCode);
        await Csrf();
        // Simulate the protected local-operator bootstrap in this isolated test DB.
        using (var scope = factory.Services.CreateScope())
        {
            var users = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
            var user = (await users.FindByIdAsync(id.ToString()))!;
            AuthService.Check(await users.AddToRoleAsync(user, Roles.Admin));
            AuthService.Check(await users.UpdateSecurityStampAsync(user));
        }
        Assert.Equal(HttpStatusCode.Forbidden, (await Post("login", new(Phone: "+442079460123", Password: newPassword))).StatusCode);
        var enrollment = await Challenge(await Post("admin/totp/setup", new(Phone: "+442079460123", Password: newPassword)));
        var secretResponse = await Post("admin/totp/secret", new(ChallengeId: enrollment.Id, Code: enrollment.Code, Password: newPassword));
        Assert.Equal(HttpStatusCode.OK, secretResponse.StatusCode);
        var secret = (await secretResponse.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("secret").GetString()!;
        var totp = new Totp(Base32Encoding.ToBytes(secret)).ComputeTotp();
        Assert.Equal(HttpStatusCode.OK, (await Post("admin/totp/verify", new(Phone: "+442079460123", Password: newPassword, Totp: totp))).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/admin/reports")).StatusCode);
        await Csrf();
        Assert.Equal(HttpStatusCode.Unauthorized, (await Post("admin/totp/verify", new(Phone: "+442079460123", Password: newPassword, Totp: totp))).StatusCode);
        await using var final = Open();
        Assert.False((await final.Providers.SingleAsync(p => p.OwnerId == id)).IsApproved);
        Assert.NotEqual(secret, (await final.Users.SingleAsync(u => u.Id == id)).TotpSecretProtected);
    }

    [Fact]
    public async Task Provider_review_admin_status_and_existing_phone_signup_outcome()
    {
        factory = new WebApplicationFactory<Program>().WithWebHostBuilder(b =>
            b.UseContentRoot(Path.Combine(root, "backend", "Qareeb.Api")).UseEnvironment("Development"));
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });
        async Task Csrf()
        {
            var token = await client.GetFromJsonAsync<JsonElement>("/api/auth/csrf");
            client.DefaultRequestHeaders.Remove("X-CSRF-TOKEN");
            client.DefaultRequestHeaders.Add("X-CSRF-TOKEN", token.GetProperty("token").GetString());
        }
        async Task<HttpResponseMessage> Post(string route, AuthInput input) => await client.PostAsJsonAsync("/api/auth/" + route, input);
        async Task<(Guid Id, string Code)> Challenge(HttpResponseMessage response)
        {
            Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            var id = json.GetProperty("challengeId").GetGuid();
            using var scope = factory.Services.CreateScope();
            var code = scope.ServiceProvider.GetRequiredService<DevelopmentSmsSender>().Read(id);
            await using var db = Open();
            var row = await db.AuthenticationChallenges.SingleAsync(x => x.Id == id);
            Assert.DoesNotContain(code, row.CodeHash);
            return (id, code);
        }

        // Administrator enrollment state: the local operator pre-enrolled with a TOTP secret.
        const string adminPhone = "+12025550997";
        const string adminPassword = "Admin-Password42!";
        Guid adminId;
        string adminTotpSecret;
        using (var scope = factory.Services.CreateScope())
        {
            var users = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
            var adminUser = new AppUser { Id = Guid.NewGuid(), UserName = Guid.NewGuid().ToString("N"), PhoneNumber = adminPhone, NormalizedPhone = adminPhone, IsActive = true, LockoutEnabled = true, PhoneNumberConfirmed = true };
            AuthService.Check(await users.CreateAsync(adminUser, adminPassword));
            AuthService.Check(await users.AddToRoleAsync(adminUser, Roles.Admin));
            adminTotpSecret = Base32Encoding.ToString(RandomNumberGenerator.GetBytes(20));
            adminUser.TotpSecretProtected = scope.ServiceProvider.GetRequiredService<IDataProtectionProvider>().CreateProtector("Qareeb.Totp.v1").Protect(adminTotpSecret);
            adminUser.TwoFactorEnabled = true;
            AuthService.Check(await users.UpdateSecurityStampAsync(adminUser));
            adminId = adminUser.Id;
        }
        await Csrf();
        var enrolledStatus = await Post("admin/totp/status", new AuthInput(Phone: adminPhone, Password: adminPassword));
        Assert.True(enrolledStatus.IsSuccessStatusCode, "enrolled status failed: " + enrolledStatus.StatusCode + " " + await enrolledStatus.Content.ReadAsStringAsync());
        var enrolledJson = await enrolledStatus.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(enrolledJson.GetProperty("admin").GetBoolean());
        Assert.True(enrolledJson.GetProperty("enrolled").GetBoolean());
        var adminTotp = new Totp(Base32Encoding.ToBytes(adminTotpSecret)).ComputeTotp(DateTime.UtcNow.AddSeconds(30));
        var adminLogin = await Post("admin/totp/verify", new AuthInput(Phone: adminPhone, Password: adminPassword, Totp: adminTotp));
        Assert.Equal(HttpStatusCode.OK, adminLogin.StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/admin/reports")).StatusCode);
        // Sign-in changes the antiforgery username claim, so refresh the token before the next POST.
        await Csrf();

        // Only administrators receive admin state; an existing customer is not one.
        var customerUser = new AppUser { Id = Guid.NewGuid(), UserName = Guid.NewGuid().ToString("N"), PhoneNumber = "+12025550199", NormalizedPhone = "+12025550199", IsActive = true, LockoutEnabled = true, PhoneNumberConfirmed = true };
        using (var customerScope = factory.Services.CreateScope())
        {
            var customerUsers = customerScope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
            AuthService.Check(await customerUsers.CreateAsync(customerUser, "Customer-Password42!"));
            AuthService.Check(await customerUsers.AddToRoleAsync(customerUser, Roles.Customer));
        }
        var customerStatus = await Post("admin/totp/status", new AuthInput(Phone: "+12025550199", Password: "Customer-Password42!"));
        Assert.Equal(HttpStatusCode.OK, customerStatus.StatusCode);
        var customerStatusJson = await customerStatus.Content.ReadFromJsonAsync<JsonElement>();
        Assert.False(customerStatusJson.GetProperty("admin").GetBoolean());

        // Re-registration on an existing verified phone keeps the password and reveals accountExists after OTP.
        const string phone = "+12025550198";
        const string password = "Existing-Password42!";
        var signup = await Challenge(await Post("register", new AuthInput(Phone: phone, Password: password)));
        Assert.Equal(HttpStatusCode.OK, (await Post("verify-phone", new AuthInput(ChallengeId: signup.Id, Code: signup.Code, Password: password))).StatusCode);
        await using (var db = Open()) { foreach (var c in db.AuthenticationChallenges) c.CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-10); await db.SaveChangesAsync(); }
        var again = await Challenge(await Post("register", new AuthInput(Phone: phone, Password: "Different-Password42!")));
        var verifyAgain = await Post("verify-phone", new AuthInput(ChallengeId: again.Id, Code: again.Code, Password: "Different-Password42!"));
        var verifyJson = await verifyAgain.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(verifyJson.GetProperty("accountExists").GetBoolean());
        // NOTE: customer logins are intentionally deferred until after the admin workflow;
        // a real login stores an auth cookie in the client container that can shadow minted tokens.

        // Pending provider application listing and approval path.
        Guid applicantId;
        using (var userScope = factory.Services.CreateScope())
        {
            var users = userScope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
            var applicant = new AppUser { Id = Guid.NewGuid(), UserName = Guid.NewGuid().ToString("N"), PhoneNumber = "+12025550197", NormalizedPhone = "+12025550197", IsActive = true, LockoutEnabled = true, PhoneNumberConfirmed = true };
            AuthService.Check(await users.CreateAsync(applicant, "Applicant-Password42!"));
            AuthService.Check(await users.AddToRoleAsync(applicant, Roles.Customer));
            applicantId = applicant.Id;
        }
        await using (var db = Open())
        {
            await db.Providers.AddAsync(new ProviderProfile { OwnerId = applicantId, NameEn = "Test Business", NameAr = "نشاط تجريبي", IsApproved = false });
            await db.SaveChangesAsync();
        }
        var pending = await client.GetFromJsonAsync<JsonElement>("/api/admin/provider-applications");
        var pendingArray = pending.EnumerateArray().ToList();
        var pendingItem = pendingArray.Single(x => x.GetProperty("ownerId").GetGuid() == applicantId);
        var applicationId = pendingItem.GetProperty("id").GetGuid();
        // Admin login consumed a code at the next step; reset the replay guard before the review MFA check.
        using (var adminScope = factory.Services.CreateScope())
        {
            var adminUsers = adminScope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
            var adminRecord = await adminUsers.FindByIdAsync(adminId.ToString());
            adminRecord!.LastTotpStep = -2;
            AuthService.Check(await adminUsers.UpdateAsync(adminRecord));
        }
        await Csrf();
        var approve = await client.PostAsJsonAsync<ReviewInput>($"/api/admin/provider-applications/{applicationId}/approve", new ReviewInput(Password: adminPassword, Totp: new Totp(Base32Encoding.ToBytes(adminTotpSecret)).ComputeTotp(DateTime.UtcNow.AddSeconds(30))));
        Assert.Equal(HttpStatusCode.OK, approve.StatusCode);
        await using (var db = Open())
        {
            using var ownerScope = factory.Services.CreateScope();
            var ownerManager = ownerScope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
            var owner = await db.Users.FindAsync(applicantId);
            Assert.True(await ownerManager.IsInRoleAsync(owner!, Roles.Provider));
            var provider = await db.Providers.SingleAsync(x => x.OwnerId == applicantId);
            Assert.True(provider.IsApproved);
            Assert.NotNull(provider.ReviewedAt);
        }
        await Csrf();
        Assert.Equal(HttpStatusCode.NoContent, (await Post("logout", new AuthInput())).StatusCode);
        SetToken(client, applicantId, Roles.Customer);
        var approvedMe = await client.GetFromJsonAsync<JsonElement>("/api/auth/me");
        Assert.Equal("Approved", approvedMe.GetProperty("providerApplication").GetProperty("status").GetString());

        // Customer login (real cookie sign-in) now runs last so it cannot shadow minted admin tokens.
        await Csrf();
        Assert.Equal(HttpStatusCode.OK, (await Post("login", new AuthInput(Phone: phone, Password: password))).StatusCode);
        await Csrf();
        Assert.Equal(HttpStatusCode.Unauthorized, (await Post("login", new AuthInput(Phone: phone, Password: "Different-Password42!"))).StatusCode);
    }

    [Fact]
    public void Verification_codes_are_hashed_expiring_single_use_and_attempt_limited()
    {
        var now = DateTimeOffset.UtcNow;
        var (record, plaintext) = VerificationCodes.Issue(Guid.NewGuid(), now);
        Assert.DoesNotContain(plaintext, record.CodeHash);
        Assert.False(VerificationCodes.Consume(record, "wrong", now));
        Assert.Equal(1, record.FailedAttempts);
        Assert.True(VerificationCodes.Consume(record, plaintext, now));
        Assert.False(VerificationCodes.Consume(record, plaintext, now));
        var expired = VerificationCodes.Issue(Guid.NewGuid(), now);
        Assert.False(VerificationCodes.Consume(expired.Record, expired.Plaintext, now.AddMinutes(16)));
        var locked = VerificationCodes.Issue(Guid.NewGuid(), now);
        for (var i = 0; i < 5; i++) Assert.False(VerificationCodes.Consume(locked.Record, "wrong", now));
        Assert.False(VerificationCodes.Consume(locked.Record, locked.Plaintext, now));
    }

    public Task DisposeAsync() { factory?.Dispose(); return Task.CompletedTask; }
}
