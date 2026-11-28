using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using Qareeb.Api.Data;
using Qareeb.Api.Domain;
using Qareeb.Api.Services;
using Qareeb.Api.Auth;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);
var connection = LocalDatabase.Connection();
var repositoryRoot = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", ".."));
if (!File.Exists(Path.Combine(repositoryRoot, "PROTOTYPE_PROGRESS.md")))
    throw new InvalidOperationException("Run from backend/Qareeb.Api using dotnet run --project.");
builder.Services.AddDbContext<QareebDbContext>(o => o.UseSqlServer(connection));
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<BookingService>();
builder.Services.AddScoped<PublicDiscoveryService>();
var protection = builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(repositoryRoot, ".local", "keys")));
if (OperatingSystem.IsWindows()) protection.ProtectKeysWithDpapi();
builder.Services.AddIdentityCore<AppUser>(o =>
{
    o.Password.RequiredLength = 12;
    o.Lockout.MaxFailedAccessAttempts = 5;
    o.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
}).AddRoles<IdentityRole<Guid>>().AddEntityFrameworkStores<QareebDbContext>().AddDefaultTokenProviders();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<DevelopmentSmsSender>();
builder.Services.AddScoped<ISmsSender>(sp => builder.Environment.IsDevelopment()
    ? sp.GetRequiredService<DevelopmentSmsSender>() : new DisabledSmsSender());
builder.Services.AddAntiforgery(o =>
{
    o.HeaderName = "X-CSRF-TOKEN";
    o.Cookie.Name = "__Host-QareebCsrf";
    o.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    o.Cookie.SameSite = SameSiteMode.Strict;
});
builder.Services.AddAuthentication("QareebCookie").AddCookie("QareebCookie", o =>
{
    o.Cookie.Name = "__Host-Qareeb";
    o.Cookie.HttpOnly = true;
    o.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    o.Cookie.SameSite = SameSiteMode.Strict;
    o.ExpireTimeSpan = TimeSpan.FromMinutes(30);
    o.SlidingExpiration = false;
    o.Events.OnRedirectToLogin = c => { c.Response.StatusCode = 401; return Task.CompletedTask; };
    o.Events.OnRedirectToAccessDenied = c => { c.Response.StatusCode = 403; return Task.CompletedTask; };
});
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = 429;
    o.AddPolicy("auth", c => RateLimitPartition.GetFixedWindowLimiter(
        c.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 30, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
});
builder.Services.AddAuthorization(options =>
{
    foreach (var role in new[] { Roles.Customer, Roles.Provider, Roles.Admin })
        options.AddPolicy(role, policy =>
        {
            policy.RequireAuthenticatedUser().RequireRole(role);
            if (role == Roles.Admin) policy.RequireClaim("mfa", "true");
        });
});
builder.Services.AddProblemDetails();
var app = builder.Build();

if (args.Contains("--read-dev-otp"))
{
    if (!app.Environment.IsDevelopment()) throw new InvalidOperationException("Development only.");
    var id = Guid.Parse(args[Array.IndexOf(args, "--read-dev-otp") + 1]);
    using var scope = app.Services.CreateScope();
    // Explicit operator output, never application logging or an HTTP response.
    Console.WriteLine(scope.ServiceProvider.GetRequiredService<DevelopmentSmsSender>().Read(id));
    return;
}
if (args.Contains("--bootstrap-admin"))
{
    if (!app.Environment.IsDevelopment()) throw new InvalidOperationException("Local development operator command only.");
    var id = Guid.Parse(args[Array.IndexOf(args, "--bootstrap-admin") + 1]);
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<QareebDbContext>();
    await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
    var users = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
    if ((await users.GetUsersInRoleAsync(Roles.Admin)).Count != 0) throw new InvalidOperationException("An admin already exists. Use the protected grant endpoint.");
    var user = await users.FindByIdAsync(id.ToString());
    if (user is null || !user.IsActive || !user.PhoneNumberConfirmed) throw new InvalidOperationException("Verified active account required.");
    AuthService.Check(await users.AddToRoleAsync(user, Roles.Admin));
    AuthService.Check(await users.UpdateSecurityStampAsync(user));
    await tx.CommitAsync();
    Console.WriteLine("First administrator assigned. TOTP enrollment is required before sign-in.");
    return;
}

if (args.Contains("--initialize-dev"))
{
    if (!app.Environment.IsDevelopment()) throw new InvalidOperationException("Initialization requires Development environment.");
    await LocalDatabase.CreateNewAsync(connection, repositoryRoot);
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<QareebDbContext>();
    await db.Database.MigrateAsync();
    await DevelopmentSeed.RunAsync(db);
    Console.WriteLine("New local Qareeb development database migrated and seeded. Existing databases were not changed.");
    return;
}

// Serve only public prototype assets, never the repository root or .local secrets.
foreach (var assetFolder in new[] { "js", "css" })
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(Path.Combine(repositoryRoot, assetFolder)),
        RequestPath = "/" + assetFolder
    });
app.MapGet("/", () => Results.File(Path.Combine(repositoryRoot, "index.html"), "text/html"));
app.MapGet("/index.html", () => Results.File(Path.Combine(repositoryRoot, "index.html"), "text/html"));
app.UseExceptionHandler();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
// Revalidate cookie identity. Clear stale cookies so anonymous recovery/login can resume.
app.Use(async (context, next) =>
{
    if (context.User.Identity?.IsAuthenticated == true)
    {
        var users = context.RequestServices.GetRequiredService<UserManager<AppUser>>();
        var user = await users.GetUserAsync(context.User);
        if (user is null || !user.IsActive || !user.PhoneNumberConfirmed ||
            context.User.FindFirstValue("stamp") != user.SecurityStamp)
        { await context.SignOutAsync("QareebCookie"); context.Response.StatusCode = 401; return; }
        var roles = await users.GetRolesAsync(user);
        if (context.User.FindAll(ClaimTypes.Role).Any(c => !roles.Contains(c.Value)))
        { await context.SignOutAsync("QareebCookie"); context.Response.StatusCode = 403; return; }
        if (roles.Contains(Roles.Admin) && (!user.TwoFactorEnabled || context.User.FindFirstValue("mfa") != "true"))
        { await context.SignOutAsync("QareebCookie"); context.Response.StatusCode = 403; return; }
    }
    await next(context);
});
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/api"))
    {
        context.Response.Headers.CacheControl = "no-store";
        if (!HttpMethods.IsGet(context.Request.Method) && !HttpMethods.IsHead(context.Request.Method))
        {
            try { await context.RequestServices.GetRequiredService<IAntiforgery>().ValidateRequestAsync(context); }
            catch (AntiforgeryValidationException) { context.Response.StatusCode = 400; return; }
        }
    }
    await next(context);
});
app.MapGet("/api/auth/csrf", (HttpContext context, IAntiforgery csrf) =>
    Results.Ok(new { token = csrf.GetAndStoreTokens(context).RequestToken }));
app.MapGet("/api/auth/me", async (HttpContext context, UserManager<AppUser> users, QareebDbContext db) =>
{
    var user = await users.GetUserAsync(context.User);
    var userId = user!.Id;
    var application = await db.Providers.AsNoTracking().Where(x => x.OwnerId == userId)
        .Select(x => new { x.Id, x.NameEn, x.NameAr, x.IsApproved, x.ReviewedAt, x.ReviewNote, x.CreatedAt })
        .SingleOrDefaultAsync();
    return Results.Ok(new
    {
        user.Id, user.PhoneNumber, user.Email,
        roles = await users.GetRolesAsync(user),
        totpEnrolled = user.TwoFactorEnabled,
        providerApplication = application is null ? null : new
        {
            application.Id, application.NameEn, application.NameAr,
            status = application.IsApproved ? "Approved" : application.ReviewedAt is null ? "Pending" : "Rejected",
            submittedAt = application.CreatedAt,
            reviewedAt = application.ReviewedAt,
            note = application.ReviewNote
        }
    });
}).RequireAuthorization();
foreach (var action in new[] { "register", "resend", "verify-phone", "login", "logout", "recovery/request", "recovery/confirm",
    "phone-change/request", "phone-change/confirm", "admin/totp/status", "admin/totp/setup", "admin/totp/secret", "admin/totp/verify",
    "provider/apply", "admin/approve-provider", "admin/grant-admin" })
{
    var route = app.MapPost("/api/auth/" + action,
        (AuthInput input, HttpContext context, AuthService service) => service.Execute(action, input, context))
        .RequireRateLimiting("auth");
    if (action.StartsWith("phone-change") || action == "provider/apply" || action == "logout") route.RequireAuthorization();
    if (action is "admin/approve-provider" or "admin/grant-admin") route.RequireAuthorization(Roles.Admin);
}
app.MapGet("/health", () => Results.Ok(new { status = "ok", scope = "local-development-foundation" })).AllowAnonymous();
app.MapGet("/api/public/categories", async (PublicDiscoveryService discovery) =>
    Results.Ok(await discovery.CategoriesAsync())).AllowAnonymous();
app.MapGet("/api/public/providers", async (
    string? query, string? location, string? category, string? priceTier,
    double? minRating, string? availability, string? sortBy, PublicDiscoveryService discovery) =>
    Results.Ok(await discovery.SearchAsync(new PublicSearchQuery(
        query, location, category, priceTier, minRating, availability, sortBy)))).AllowAnonymous();
app.MapGet("/api/public/providers/{id:guid}", async (Guid id, PublicDiscoveryService discovery) =>
{
    var provider = await discovery.GetAsync(id);
    return provider is null ? Results.NotFound() : Results.Ok(provider);
}).AllowAnonymous();
// Legacy catalog shape retained for compatibility, now using the same public gate.
app.MapGet("/api/providers", async (QareebDbContext db) =>
    await db.Providers.AsNoTracking().Where(x => x.IsApproved && !x.VacationMode &&
            db.Users.Any(u => u.Id == x.OwnerId && u.IsActive && u.PhoneNumberConfirmed))
        .Select(x => new { x.Id, x.NameEn, x.NameAr, x.VacationMode }).ToListAsync()).AllowAnonymous();
app.MapPost("/api/appointments", async (CreateAppointment request, ClaimsPrincipal user, BookingService bookings, CancellationToken ct) =>
{
    if (!Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var customerId)) return Results.Forbid();
    try
    {
        var booking = await bookings.CreateAsync(customerId, request, ct);
        return Results.Created($"/api/appointments/{booking.Id}", new { booking.Id, booking.StartsAt, booking.EndsAt, booking.Status, booking.TotalPrice, booking.Currency });
    }
    catch (BookingValidationException ex) { return Results.Problem(ex.Message, statusCode: 400); }
    catch (BookingConflictException ex) { return Results.Problem(ex.Message, statusCode: 409); }
    catch (DbUpdateException ex) when (ex.InnerException is SqlException { Number: 51000 })
    { return Results.Problem("Staff member is unavailable for this interval.", statusCode: 409); }
    catch (SqlException ex) when (ex.Number is 1205 or 51001)
    { return Results.Problem("Booking is busy; retry the request.", statusCode: 503); }
    catch (DbUpdateException ex) when (ex.InnerException is SqlException { Number: 1205 })
    { return Results.Problem("Booking is busy; retry the request.", statusCode: 503); }
}).RequireAuthorization(Roles.Customer);
app.MapGet("/api/appointments/{id:guid}", async (Guid id, ClaimsPrincipal user, QareebDbContext db) =>
{
    if (!Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)) return Results.Forbid();
    var booking = await db.Appointments.AsNoTracking().Where(x => x.Id == id &&
        (user.IsInRole(Roles.Admin)
         || (user.IsInRole(Roles.Customer) && x.CustomerId == userId)
         || (user.IsInRole(Roles.Provider) && db.Providers.Any(p => p.Id == x.ProviderId && p.OwnerId == userId))))
        .Select(x => new { x.Id, x.ProviderId, x.StaffId, x.StartsAt, x.EndsAt, x.Status, x.TotalPrice, x.Currency }).SingleOrDefaultAsync();
    return booking is null ? Results.NotFound() : Results.Ok(booking);
}).RequireAuthorization();
app.MapGet("/api/provider/appointments", async (ClaimsPrincipal user, QareebDbContext db) =>
{
    var ownerId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    return await db.Appointments.AsNoTracking().Where(x => db.Providers.Any(p => p.Id == x.ProviderId && p.OwnerId.ToString() == ownerId))
        .Select(x => new { x.Id, x.StartsAt, x.EndsAt, x.Status }).Take(100).ToListAsync();
}).RequireAuthorization(Roles.Provider);
app.MapGet("/api/admin/reports", async (QareebDbContext db) =>
    await db.Reports.AsNoTracking().Select(x => new { x.Id, x.ReviewId, x.Status, x.Reason }).Take(100).ToListAsync())
    .RequireAuthorization(Roles.Admin);
// Pending provider applications only. Approved/rejected rows are reviewed history.
app.MapGet("/api/admin/provider-applications", async (QareebDbContext db) =>
    await db.Providers.AsNoTracking().Where(x => !x.IsApproved && x.ReviewedAt == null)
        .OrderBy(x => x.CreatedAt)
        .Select(x => new { x.Id, x.OwnerId, x.NameEn, x.NameAr, x.CreatedAt,
            phone = db.Users.Where(u => u.Id == x.OwnerId).Select(u => u.PhoneNumber).FirstOrDefault() })
        .Take(100).ToListAsync())
    .RequireAuthorization(Roles.Admin);
foreach (var decision in new[] { ("approve", true), ("reject", false) })
    app.MapPost($"/api/admin/provider-applications/{{id:guid}}/{decision.Item1}",
        (Guid id, ReviewInput input, HttpContext context, AuthService service) =>
            service.Execute("admin/review-provider",
                new AuthInput(Password: input.Password, Totp: input.Totp, Note: input.Note, ApplicationId: id, Approve: decision.Item2), context))
        .RequireAuthorization(Roles.Admin).RequireRateLimiting("auth");
app.Run();

public partial class Program;
