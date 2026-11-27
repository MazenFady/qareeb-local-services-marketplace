# Local backend foundation

## Status and prerequisites

The API and SQL schema back the existing bilingual frontend when it is served from
the same HTTPS origin. Account state and public provider discovery read from the
database; bookings, dashboards and the demo role switcher remain mock. Opening
`index.html` directly still works as an offline mock preview. See
[authentication setup and endpoints](AUTHENTICATION.md) and
[the consolidated update notes](QAREEB_UPDATE.md). There is no real SMS, payment
or mapping integration.

Verified locally with .NET SDK 9.0.305, ASP.NET Core runtime 9.0.9, EF Core 9.0.11
and SQL Server LocalDB. Node.js was not found on PATH and is not required for the
backend. .NET 9 is out of support as of this work: move to .NET 10 LTS and current
patches before deployment. Production hosting is not included.

Development work is published on a `codex/` branch created from the latest fetched
`main` of the project remote, so teammate localization and category changes are
preserved. The original offline prototype folder has no Git metadata; publishing
is done from a clean clone, never from that folder.

## Setup (PowerShell, repository root)

1. Ensure `dotnet --list-sdks` includes 9.x and `sqllocaldb info` lists
   `MSSQLLocalDB`. `dotnet tool restore` restores the pinned local EF tool.
2. Configure a unique development name in the current terminal:

   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   . .\scripts\Use-LocalDatabase.ps1 -DatabaseName Qareeb_Development_MyDemo
   ```

   This sets `QAREEB_DB_CONNECTION` and `ASPNETCORE_ENVIRONMENT` without writing
   credentials or configuration to disk. Authentication uses the current Windows
   account. Local certificate trust applies only to this LocalDB development setup.
   Do not supply shared or cloud connection information.
   The execution-policy command applies only to this terminal and allows the
   repository helper to run on Windows installations that disable scripts.

3. Create a **new** database, migrate it and seed fictional data:

   ```powershell
   dotnet run --project backend/Qareeb.Api --no-launch-profile -- --initialize-dev
   ```

   The guard only accepts `(localdb)\MSSQLLocalDB`, integrated security and a
   `Qareeb_Development_*` name. Existing databases and existing MDF/LDF files are
   refused. Database files live under `.local/databases/` in this repository.
   Startup never migrates automatically. Failed initialization leaves its database
   intact for inspection; do not reset it. Use another fresh name if necessary.

4. Run:

   ```powershell
   dotnet run --project backend/Qareeb.Api --no-launch-profile --urls https://localhost:7080
   ```

   Open `https://localhost:7080`. The API serves the existing prototype at `/`
   plus only the `js/` and `css/` folders, so browser cookies and API calls share
   one HTTPS origin without CORS. Check `/health`, `/api/public/categories` and `/api/public/providers` too. Health
   is process liveness, not a database-readiness guarantee. Account endpoints and
   frontend configuration are documented in [AUTHENTICATION.md](AUTHENTICATION.md).

In SSMS connect to `(localdb)\MSSQLLocalDB` with Windows Authentication.
The initial verified database is `Qareeb_Development_Foundation_20261127`.
SSMS manages this local database; it does not determine future database hosting.
Generated data-protection keys live in ignored `.local/keys/` and are protected
with Windows DPAPI. Do not share that folder.

## Schema

| Area | Tables and invariants |
| --- | --- |
| Accounts | Identity users, roles, user roles, claims, logins and tokens. Users have active status and timestamps. Roles: Customer, Provider, PlatformAdmin. |
| Providers | Provider profiles owned by a user; bilingual names/bios, approval and vacation flags. Multiple bilingual locations with time zone and optional geographic coordinates. |
| Catalog | Bilingual categories and provider services, decimal prices, currency, positive duration and active state. |
| Staff/availability | Staff belonging to a provider, optional linked account; weekly working intervals per location and UTC blocked intervals. Missing working-hours row means closed. |
| Appointments | Customer, provider, location, assigned staff, UTC start/end, status, currency, total price and service snapshots. Composite foreign keys prevent mixing providers. |
| Verification | One current salted PBKDF2 hash per booking, expiry, consumption timestamp and failed attempts. Random 128-bit code, 15-minute lifetime, five failed attempts maximum. No plaintext storage. |
| Reviews | One review per appointment; composite foreign key binds author to that appointment's customer; rating 1–5, reply and hidden state. Completed-booking publication checks await review-write endpoints. |
| Moderation | Review reports, reporting user, reason, status, resolving admin user reference, resolution and timestamp. Admin-only read endpoint; mutation workflows are deferred. |

Domain records include creation/update timestamps and SQL `rowversion` for
optimistic concurrency. Foreign-key deletes are restricted. Timestamps are
maintained by EF writes, not by ad-hoc SQL. Status history and a complete actor
audit log are future work.

## Booking and permission boundaries

`POST /api/appointments` requires an active Customer identity. Customer ID comes
from verified server claims. Input consists of `providerId`, `locationId`,
`staffId`, `serviceIds` and an ISO-8601 `startsAt` with offset. Prices and durations
come from the database. The first version requires explicit staff selection.
It permits appointments within 180 days, during working hours, with active services
and staff; vacation, unapproved providers and blocked intervals are rejected.

The booking transaction uses Serializable isolation and a transaction-owned
provider application lock. An SQL trigger independently rejects overlapping
Pending/Confirmed appointments for the same provider/staff, including updates and
multi-row writes. Intervals are `[start,end)`, so adjacent appointments and
different staff can coexist. A conflict returns 409; lock contention/deadlock
returns 503 for retry. Cancellations/rescheduling and idempotency keys are not
implemented API flows yet.

`GET /api/appointments/{id}` permits the booking customer, its provider owner, or
a platform admin. Provider listing is scoped to that owner. Admin reports require
PlatformAdmin. Server-side user/role state is rechecked for authenticated requests.
Staff accounts do not automatically receive provider-owner authority.

Identity phone/password authentication uses secure cookies and CSRF protection,
and the prototype's account panel calls it. Seed users remain inactive with no
passwords or contact details. Admins must enroll an authenticator app; the UI
discovers enrollment state through `POST /api/auth/admin/totp/status` and routes
unenrolled administrators to setup before login. The demo role switcher grants no
API access and marketplace data remains mock.

The provider workflow is exposed through protected admin API operations:
pending applications are listed via `GET /api/admin/provider-applications`, and an
MFA-enrolled administrator approves or rejects a specific application via
`POST /api/admin/provider-applications/{id}/approve` or `.../reject`. Approval is
the only path that grants the `Provider` role; rejection records the decision
without changing roles. The approved administrator's action rotates the applicant's
security stamp, so the applicant must sign in again to use provider tools.

## Public provider discovery

Anonymous catalog reads are available at `GET /api/public/categories`,
`GET /api/public/providers` and `GET /api/public/providers/{id}`. Every result is
gated on `IsApproved`, an active phone-confirmed owner, non-vacation mode and at
least one currently published service. Pending, rejected, vacation and inactive
profiles never appear. Service prices and category counts come from active
`ProviderService` rows joined to their `Category`, not from the prototype fixture.

Supported search parameters on `/api/public/providers` are `query`, `location`,
`category` (slug), `priceTier`, `minRating`, `availability=today` and `sortBy`
(`rating` or `price`). Detail responses include bilingual names/bios, active
services with prices and durations, published opening hours, gallery items
(caption/URL pairs from the provider record), review text and explicit contact
links. Owner sign-in phone numbers are never published; only the separately
recorded `ContactPhone`/`WhatsAppNumber` fields are returned. Missing or
unavailable profiles return 404. The frontend keeps the bundled mock catalog only
as an offline fallback and shows an explicit unavailable state for public profiles
that cannot be loaded.

There are no endpoints for photo uploads, map/geocoding, or writing reviews or
gallery items; those remain prototype presentation data or future work. The vector
map and social share actions in the profile are demo-only and do not call external
services.

Verification code generation/consumption is a storage primitive, not a login or
public endpoint. Future delivery flows must authorize the appointment, persist
attempts and consumption, and handle rowversion conflicts before reporting success.
No codes are currently delivered or automatically issued at booking time.

## Migrations and checks

- `InitialFoundation`: Identity and domain tables, foreign keys, indexes and checks.
- `PreventAppointmentOverlap`: insert/update overlap trigger. Destructive rollback
  is disabled for this migration.
- `PhoneAuthentication`: user columns, normalized-phone index and challenge table.
  Destructive rollback is disabled for this migration.
- `ProviderApplicationReview`: additive nullable provider review columns. Destructive
  rollback is disabled for this migration.
- `ProviderDiscoveryPresentation`: additive nullable provider image, neighborhood,
  distance, slot and contact columns. Destructive rollback is disabled for this
  migration.

Future migrations must be reviewed and applied explicitly to known local
development databases. Do not use `database update 0`, database drop, reset scripts
or unreviewed destructive changes. The additive PhoneAuthentication migration was
subsequently applied to the known local foundation database without changing its records.

```powershell
dotnet build Qareeb.sln
dotnet test Qareeb.sln
dotnet ef migrations has-pending-model-changes --project backend/Qareeb.Api
dotnet list Qareeb.sln package --vulnerable --include-transitive
```

Tests require LocalDB and create fresh `Qareeb_Development_Test_*` databases;
they never drop databases or reuse existing data. Test MDF/LDF files stay in
`.local/databases/`. Tests cover migrations, repeatable seeding, races, adjacency,
different staff, direct SQL overlap protection, vacation, unavailable hours,
blocked intervals, provider foreign keys, review ownership, protected API routes,
code hashing/expiry/attempt limits and concurrent consumption, account signup/
recovery/review workflows and public discovery gating, filters and detail payloads.

## Open product decisions

- SQL Server hosting, backups and operational ownership; no external target chosen.
- Production admin provisioning and lost-phone/lost-authenticator support procedures;
  phone/password, signup/recovery OTP and admin TOTP are implemented.
- Notification provider and code delivery UX; a shorter numeric PIN would need a
  revised security design and delivery/abuse controls.
- Market/currency/time zone: fixture uses EGP and Africa/Cairo; historical mock
  addresses mix countries. Confirm these before importing real catalog data.
- Staff qualifications, automatic assignment, split/overnight shifts, holiday
  editing, buffers, capacity, cancellation/reschedule rules and booking idempotency.
- Review publication and moderation write workflows, actor audit history and
  provider approval history.
- Administrator grant UI (`/admin/grant-admin` and target admin listing are
  API/operator only for now; the approved/rejected application decisions are now
  exposed through the protected admin provider application endpoints).
- .NET 10 LTS upgrade before deployment. Payments, maps and production hosting
  remain outside this foundation.
