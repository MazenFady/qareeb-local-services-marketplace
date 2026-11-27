# Qareeb update notes

This is the consolidated handoff for the current Qareeb work: a local ASP.NET Core /
SQL Server development foundation, phone authentication with provider approval,
frontend account integration, and database-backed public provider discovery. It is
intended for reviewers and developers; it contains no credentials, keys, connection
strings, codes or local test data.

## What changed

| Area | Result |
| --- | --- |
| Backend foundation | ASP.NET Core Web API with EF Core and SQL Server LocalDB, domain model, forward-only migrations, repeatable fictional seed, booking conflict protection and protected read endpoints. |
| Authentication | Phone/password signup and login, server-side OTP challenges, secure cookie sessions, CSRF, TOTP enrollment and mandatory admin MFA, recovery and phone change. |
| Provider approval | Customers submit a provider application; only an MFA-authenticated administrator can approve or reject it. Approval grants the Provider role; `IsApproved` is the only public gate. |
| Frontend account | Bilingual account bar and dialog, session restore, signup/verification, login/logout, recovery, phone change, provider application and admin enrollment routing. |
| Public discovery | Anonymous category, search/filter and provider-detail endpoints backed by approved database records; the existing customer UI renders them with an offline mock fallback. |
| Documentation | Setup, schema, authentication and this consolidated summary; the prototype handoff remains in `PROTOTYPE_PROGRESS.md`. |

The demo role switcher is still a UI-only preview. It never grants API permissions.
Bookings, dashboards, reviews, maps and social actions remain mock or presentation
only. There are no payments, real notifications, real SMS, external maps or hosting.

## Database and backend foundation

The solution `Qareeb.sln` contains `backend/Qareeb.Api` (Web API) and
`backend/Qareeb.Api.Tests` (integration tests using fresh LocalDB databases).
The schema covers Identity accounts and roles; bilingual categories, providers,
locations, services and staff; working hours and availability exceptions;
appointments with service snapshots; salted booking verification codes; reviews;
and review reports. Prices are decimal with an explicit currency. Foreign keys are
restricted, and domain rows carry timestamps plus SQL `rowversion` concurrency
tokens. A SQL trigger independently prevents overlapping active appointments for
the same staff member.

Booking writes are server-priced, validated against working hours and active
services, serialized per provider with a transaction application lock, and
authorized by verified claims. Read endpoints are scoped to the booking customer,
provider owner or platform admin.

The API serves the prototype from the same HTTPS origin: `/` and `/index.html`
return the existing page and only the `js/` and `css/` folders are exposed as
static files. Repository root, `.local` and backend source paths are not served.
No CORS policy exists by design.

## Authentication and provider approval

Key behaviors:

- Phone numbers are normalized to E.164 and protected by a filtered unique index.
- OTP challenges are purpose-bound, expire quickly, limit attempts, throttle
  resends and are consumed once; development delivery writes an encrypted local
  outbox that is only revealed by an explicit operator command. No code is returned
  by the API or written to logs.
- Passwords use Identity hashing/lockout. Sessions use `__Host-` HttpOnly, Secure,
  SameSite=Strict cookies; no tokens are stored in browser storage.
- All `/api` mutations require a freshly fetched antiforgery token. Mutations are
  never automatically retried by the frontend.
- Admin accounts require TOTP enrollment before they can hold a session. Enrollment
  state is discoverable through a protected `POST /api/auth/admin/totp/status`
  call because an unenrolled admin cannot sign in.
- Applying for a provider account grants no role. Rejection can be re-applied and
  resets the application to pending; approval grants Provider and rotates the
  applicant's security stamp.
- Existing active phone numbers can only be re-registered after proving ownership;
  verification then reports that the account exists instead of silently taking it
  over. Inactive accounts may reset their password during re-registration.

Full endpoint and behavior details are in [AUTHENTICATION.md](AUTHENTICATION.md).

## Frontend account integration

`js/api-config.js` defines a same-origin `/api` base URL. `js/auth-api.js` enforces
HTTPS same-origin requests, JSON errors, a 20-second timeout, fresh CSRF tokens for
mutations and no mutation retries. `js/components/account.js` and `css/account.css`
provide the bilingual, responsive light/dark account bar and dialog. `js/app.js`
renders the account bar above the marketplace; `index.html` loads the new scripts
and styles.

Confirmed session state (phone, roles, enrollment and application status) comes
from `GET /api/auth/me` on load and on window focus. The amber demo role switcher
is separate and never sends identity or role data.

## Public provider discovery

Anonymous endpoints:

| Route | Purpose |
| --- | --- |
| `GET /api/public/categories` | Bilingual category slugs, names, icons and counts from published services. |
| `GET /api/public/providers` | Searchable provider summaries with filters. |
| `GET /api/public/providers/{id}` | Provider detail or 404 when unavailable. |

Search parameters: `query`, `location`, `category` (slug), `priceTier`, `minRating`,
`availability=today`, `sortBy=rating|price`. Detail responses include bilingual
names and bios, active services with prices/durations/categories, published opening
hours, gallery items, reviews, and explicit phone/WhatsApp/social links from the
provider record. The owner's sign-in phone is never published.

Every record must be approved, owned by an active phone-confirmed user, not in
vacation mode and have at least one active service. Category filters derive from
`ProviderService.CategoryId`, never from prototype text. A legacy
`GET /api/providers` route retains the old compact shape but uses the same gate.

`js/discovery-api.js` caches catalog/detail reads and re-queries when filters
change. `customer-home.js`, `search-results.js` and `provider-profile.js` render
the API catalog when available and fall back to the bundled mock catalog for the
standalone offline prototype. An unavailable or rejected provider now shows an
explicit bilingual not-available state instead of silently displaying another
provider. Booking modal data and all booking actions remain mock.

## Migrations

Migrations are forward-only and additive; destructive rollback/seed reset is not
supported. Existing local databases are migrated explicitly, never dropped.

1. `InitialFoundation` — Identity and domain tables, indexes, checks and keys.
2. `PreventAppointmentOverlap` — insert/update overlap trigger.
3. `PhoneAuthentication` — user columns, normalized-phone index, challenge table.
4. `ProviderApplicationReview` — nullable review columns on providers.
5. `ProviderDiscoveryPresentation` — nullable image, neighborhood, distance,
   next-slot and published-contact columns on providers.

The seed inserts fictional categories, a provider and fixtures once; it never
updates an existing catalog or activates account fixtures. Because the seeded
fixture owner is intentionally inactive, database-backed discovery needs a locally
created and approved provider to show cards.

## Setup

Prerequisites: .NET SDK 9, SQL Server LocalDB and a Windows terminal. From the
repository root:

```powershell
dotnet tool restore
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
. .\scripts\Use-LocalDatabase.ps1 -DatabaseName Qareeb_Development_YourName
dotnet run --project backend/Qareeb.Api --no-launch-profile -- --initialize-dev
dotnet dev-certs https --trust
dotnet run --project backend/Qareeb.Api --no-launch-profile --urls https://localhost:7080
```

`Use-LocalDatabase.ps1` sets a unique local database name and environment in the
current terminal only; it writes no secrets to disk. Initialization refuses an
existing database and creates a fresh file under the ignored `.local/databases/`
folder. Afterwards configure the same name and run the API without
`--initialize-dev`. Production deployment, certificates and key storage are not
included. Operating the development OTP outbox, first-administrator bootstrap and
account flows are described in [AUTHENTICATION.md](AUTHENTICATION.md) and
[BACKEND_SETUP.md](BACKEND_SETUP.md).

## Checks

```powershell
dotnet build Qareeb.sln
dotnet test Qareeb.sln
dotnet ef migrations has-pending-model-changes --project backend/Qareeb.Api
dotnet list Qareeb.sln package --vulnerable --include-transitive
```

The integration suite creates fresh LocalDB databases and covers schema, seeding,
booking races and authorization, account lifecycle, CSRF/OTP replay, admin review,
and public discovery gating, filters and detail payloads. The most recent full run
passed 5/5 tests. Manual browser checks cover the connected account panel, session
restore, provider application review, Arabic RTL and dark theme, public category
and provider rendering, search filters and the unavailable-profile state. The
standalone `index.html` preview remains usable without the API.

## Remaining mock and external dependencies

- Booking wizard, bookings list, provider and admin dashboards, availability editing,
  reviews and moderation writes are prototype data only.
- The profile map is a decorative vector illustration; no geocoding or map service
  is called. Contact actions use provider-published values or demo toasts.
- Photos are illustrative URLs or fixture strings; there is no upload pipeline.
- SMS/OTP delivery is a development-only encrypted local outbox and a disabled
  production sender. Real delivery, monitoring and abuse controls are required.
- First administrator bootstrap, audit trails and lost-credential support need an
  operational procedure. The IP rate limiter is process-local.
- Payments, production hosting, TLS/reverse proxy configuration, distributed
  rate limiting and a .NET 10 LTS upgrade remain out of scope.

## Publishing note

The work is published from a clean clone of the verified project remote on a
`codex/` branch based on the latest fetched `main`, preserving teammate EGP
localization and category changes. Only the intended source, tests, scripts and
documentation are staged; `.local/`, build output, databases, local configuration
and secrets are ignored.
