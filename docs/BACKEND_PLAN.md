# First database foundation

## Inspection and scope

The supplied ZIP has no Git metadata. The original HTML/CSS/JavaScript prototype
uses mutable in-memory data; only appearance and demo-role preferences persist.
The handoff's vacation-mode enforcement and shared service-catalog claims do not
match the source. Mock data mixes Cairo/EGP with Saudi addresses and phone numbers.
Do not import those contact details as real people or locations.

## Implementation plan

1. Add a separate ASP.NET Core API and EF Core SQL Server model under `backend/`.
   Use the installed .NET 9 SDK for local verification. Upgrade to supported .NET
   10 LTS before deployment; deployment is outside this change.
2. Model Identity users/roles, provider ownership, locations, bilingual categories
   and services, staff, weekly hours and UTC availability exceptions, appointments
   with service/price snapshots, hashed verification codes, reviews and reports.
3. Use authenticated server policies and resource ownership. No demo-role headers,
   public registration, seed passwords or automatic administrator account.
   Authentication-provider selection remains open; Identity bearer-token validation
   provides a foundation with no login or token-issuance endpoints enabled yet.
4. Use a SQL Server transaction plus provider-scoped application lock to serialize
   appointment creation; reject overlapping active appointments for assigned staff.
   A database trigger also protects against conflicting direct writes. Require an
   explicit staff member initially; automatic staff assignment is deferred.
5. Generate and review migrations. Create only a fresh `Qareeb_Development_*`
   database on `(localdb)\MSSQLLocalDB`, using Windows integrated security.
   Do not automatically migrate on API startup. Seed fictional bilingual catalog
   data, with disabled demo Identity accounts and no credentials.
6. Check compilation, schema constraints, seed repeatability, booking races,
   verification hashing and authorization. Keep the prototype untouched.

## Decisions still required

Database hosting, supported deployment runtime, authentication/account onboarding,
provider membership administration, notification delivery, cancellation policies,
verification-code delivery/attempt limits, staff qualifications and buffer times,
currency/market and time zone are product decisions. No payments, external maps,
external database, SMS or WhatsApp integration is included.
