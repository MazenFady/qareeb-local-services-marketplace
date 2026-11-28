# Phone authentication

Use Identity password hashing/lockout and server-encrypted HttpOnly, Secure,
SameSite=Strict cookies. All unsafe browser requests require an antiforgery header.
No CORS origins are enabled: use a same-origin HTTPS deployment. Marketplace data
in the prototype remains mock; authentication and account state are connected.

Normalize international phone numbers to E.164 using libphonenumber. Add a filtered
unique phone index, a separate authentication-challenge table and protected TOTP
state. Public registration grants Customer only. Provider applications stay pending
until an MFA-authenticated admin approves them. Admin grants require that same
protected path, with a local operator-only first-admin bootstrap command.

Authentication challenges use salted hashes, 5-minute expiration, five attempts,
60-second resend delay and five sends/hour per phone/purpose. SQL application
locks serialize challenge issuance and consumption. Development SMS writes an
encrypted local outbox; plaintext is revealed only by an explicit local CLI command.
Production uses a disabled sender until an actual provider is configured.

Additive migrations will be reviewed before updating the existing local database.
No seed account will be activated. Appointment verification codes stay separate.

## Implemented endpoints

All routes below use `/api/auth`. POST requests accept JSON and require
`X-CSRF-TOKEN`, including anonymous registration and login.

| Method/path | Input / behavior |
| --- | --- |
| GET `/csrf` | Returns `{token}` and sets a secure antiforgery cookie. Fetch again after login/logout or identity changes. |
| GET `/me` | Authenticated account ID, phone, optional email and roles, `totpEnrolled`, and the caller's `providerApplication` (`{id, nameEn, nameAr, status: Pending|Approved|Rejected, submittedAt, reviewedAt, note}` or `null`). |
| POST `/register` | `phone`, `password`, optional `email`. Customer only; returns `challengeId`. Extra role fields grant nothing. |
| POST `/resend` | `phone`; sends a new signup challenge and invalidates the previous one. |
| POST `/verify-phone` | `challengeId`, `code`, `password`; for a pending signup it activates the account; for a challenge on an already-active account it returns `{accountExists: true}`. |
| POST `/login` | `phone`, `password`; admins also provide `totp`. Sets session cookie. |
| POST `/logout` | `{}`; removes this browser's session cookie. |
| POST `/recovery/request` | `phone`; generic accepted response with challenge ID. |
| POST `/recovery/confirm` | `challengeId`, `code`, `newPassword`; admin also supplies `totp`. Resets password and invalidates existing sessions. |
| POST `/phone-change/request` | Authenticated: `newPhone`, `password`; admin also supplies fresh `totp`. Sends OTP to new phone. |
| POST `/phone-change/confirm` | Authenticated: `challengeId`, `code`, `password`; changes phone and invalidates sessions. |
| POST `/admin/totp/setup` | `phone`, `password`; verified admin only; sends enrollment OTP. Does not grant a session. |
| POST `/admin/totp/status` | `phone`, `password`; no session required; returns `{admin, enrolled}`. Unenrolled admins cannot hold a session, so this is the only way to discover enrollment state before login. |
| POST `/admin/totp/secret` | `challengeId`, `code`, `password`; returns enrollment secret and `otpauth` URI once per challenge. |
| POST `/admin/totp/verify` | `phone`, `password`, `totp`; confirms enrollment and issues an MFA session. |
| POST `/provider/apply` | Authenticated: `nameEn`, `nameAr`; creates unapproved provider profile, grants no role. A rejected application may be resubmitted; a pending or approved one is rejected. |
| POST `/admin/approve-provider` | MFA admin: target `userId`, actor `password`, fresh actor `totp`; approves profile and grants Provider. |
| POST `/admin/grant-admin` | MFA admin: target `userId`, actor `password`, fresh actor `totp`; grants PlatformAdmin. Target must enroll TOTP before login. |
| GET `/api/admin/provider-applications` | MFA admin; lists pending applications (`IsApproved = false AND ReviewedAt IS NULL`). |
| POST `/api/admin/provider-applications/{id}/approve` | MFA admin: actor `password`, fresh actor `totp`, optional note; approves profile and grants Provider. |
| POST `/api/admin/provider-applications/{id}/reject` | MFA admin: actor `password`, fresh actor `totp`, optional note; records rejection without changing roles. |

Phone input requires `+` and a country calling code. libphonenumber validates and
canonicalizes to E.164; equivalent formatted inputs resolve to the same account.
The additive `NormalizedPhone` filtered unique index protects new registrations
and phone changes. Legacy phone values are preserved; installations with existing
non-null phones require a reviewed normalization/backfill before rollout. The
verified local database had no existing phone values.

Passwords require 12–128 characters and Identity's default uppercase/lowercase,
digit and non-alphanumeric rules. Email is optional and is not used as a recovery
factor. Five failed password/TOTP attempts lock the account for 15 minutes.
TOTP secrets are encrypted with Data Protection; accepted time steps cannot be
replayed. Admin sessions require MFA even on general authenticated endpoints.
There is no SMS-only administrator recovery or MFA-disable endpoint.

OTP challenges are purpose-bound, user-bound, security-stamp-bound and separately
stored from appointment codes. They use salted PBKDF2 hashes, five-minute expiry,
five verification attempts, 60-second resend spacing and five sends/hour per
phone/purpose **and account/purpose**. Authentication endpoints additionally allow
30 requests/minute per client IP. Invalidated challenges cannot be reused.
Password and phone changes rotate the security stamp; every request checks it.
Cookies expire after 30 minutes without sliding renewal.

## HTTPS browser setup

The API uses `__Host-Qareeb` HttpOnly/Secure/SameSite=Strict cookies. There are no
browser bearer tokens to store in localStorage. All `/api` responses disable
caching. Unsafe `/api` requests require antiforgery validation, including booking.
No CORS policy is enabled. The intended deployment is frontend and API on one HTTPS
origin, potentially behind a reverse proxy.

For local development the API serves the prototype itself: `/` and `/index.html`
return the existing page, and only `/js` and `/css` are exposed as static files.
The repository root, `.local` and backend sources are not served. Opening
`index.html` from disk still renders the marketplace demo, but the account panel
then reports that the account service is unavailable, because secure cookies
require HTTPS.

Configure the known local database using `scripts/Use-LocalDatabase.ps1`, then:

```powershell
dotnet dev-certs https --trust
dotnet run --project backend/Qareeb.Api --no-launch-profile --urls https://localhost:7080
```

Open `https://localhost:7080`. The certificate command is an explicit operator
setup step. HTTP health/catalog checks work, but secure browser cookies require
HTTPS.

## Frontend integration

| File | Purpose |
| --- | --- |
| `js/api-config.js` | `window.QareebConfig.apiBaseUrl`, default `/api`. Must resolve to the same HTTPS origin and contain no query or fragment. |
| `js/auth-api.js` | Same-origin fetch wrapper: `credentials: "same-origin"`, a fresh `X-CSRF-TOKEN` per mutation, JSON errors, 20-second timeout, no automatic mutation retry. |
| `js/components/account.js` | Bilingual account dialog, session restore, loading/error states, signup verification, login/logout, recovery, phone change, provider application, admin TOTP enrollment. |
| `css/account.css` | Dialog, form, focus and dark/light styling using existing theme variables. |
| `index.html`, `js/app.js` | Loads the new scripts and renders the account bar above the marketplace content. |

To point the UI at a reverse-proxied path, set `window.QareebConfig` in a script
that runs before `js/api-config.js` (for example a deployment-generated file), or
edit the default. Cross-origin API URLs are rejected by the client; enabling CORS
would also require `SameSite`/antiforgery redesign and is intentionally not done.

The account bar shows the server-confirmed phone and roles. It is separate from the
amber demo role switcher, which only changes local mock screens and never sends
identity or role data. The marketplace, bookings and dashboards remain mock data.

Client flow: fetch `/api/auth/csrf`, then POST JSON with the `X-CSRF-TOKEN` header
and cookies. Tokens are re-fetched per submission, so identity changes and multiple
tabs stay valid. Session state is restored with `GET /api/auth/me` on page load and
when the window regains focus. No password, OTP or TOTP value is stored in
localStorage or sessionStorage.

Frontend behavior by endpoint: registration shows the challenge ID and switches to
phone verification; recovery and phone-change reuse the same challenge panel;
recovery on an existing account issues a `recovery` challenge and verifies it
without a password reset until the code and new password are checked;
provider application shows a pending-review notice without any role change, and
the confirmed status arrives again through `GET /api/auth/me` after refresh;
administrator access state is checked with `admin/totp/status` and the
enrollment-required login result routes to setup. Errors map 400/401/403/429/503
and network/configuration failures to bilingual messages, with the server detail
behind a disclosure.

## Provider application lifecycle

`POST /provider/apply` stores a provider profile with `IsApproved = false`. It
grants no role, and an authenticated customer can hold at most one application:
submitting while one is pending or approved fails, while a rejected application
can be resubmitted and resets to pending.

`GET /api/admin/provider-applications` lists pending applications for an
authenticated, MFA-enrolled platform administrator. `POST /api/admin/provider-applications/{id}/approve`
and `.../reject` take the admin actor's `password` and a fresh `totp`, and require
the `PlatformAdmin` role plus the MFA claim. Approval sets `IsApproved = true`,
rotates the applicant's security stamp (so the stale session loses Provider
access) and grants the `Provider` role. Rejection records `ReviewedAt` plus the
optional `ReviewNote` and leaves the applicant's role unchanged. Only approval
grants provider access; rejection never demotes or grants.

## Known API contract gaps

- Logout clears only the current browser session; there is no logout-all-devices
  endpoint. Email cannot be changed after signup.
- There is no administrator UI for grants (`/admin/grant-admin` is API/operator
  only), and no list/review endpoint for past application decisions.
- Lost-phone recovery without an existing authenticated session or access to the
  registered phone is intentionally unavailable; lost admin authenticators require
  an operational recovery policy.

## Local OTP and first administrator

In Development only, OTP delivery writes encrypted files to ignored `.local/sms`.
No OTP appears in HTTP responses or application logs. The account dialog shows the
challenge ID after signup, recovery or phone change. To explicitly reveal the code
in your own local terminal, run this with the ID from the dialog:

```powershell
dotnet run --project backend/Qareeb.Api --no-launch-profile -- --read-dev-otp CHALLENGE_GUID
```

This command intentionally displays a secret; do not capture or share its output.
There is no outbox HTTP endpoint. Production selects `DisabledSmsSender` and
returns 503 for delivery attempts. The development sender and read command both
reject non-Development environments. Do not deploy with Development enabled.
Expired encrypted outbox files currently remain until local operator cleanup.

Register and verify a local account, obtain its ID from login or `/me`, then an
operator with local database access may initialize the first administrator:

```powershell
dotnet run --project backend/Qareeb.Api --no-launch-profile -- --bootstrap-admin USER_GUID
```

This Development-only command refuses to run if any administrator exists. It
does not set passwords, activate fixture users or bypass TOTP. All subsequent
grants use the protected MFA admin endpoint. Production first-admin provisioning
requires a separately reviewed operational procedure.

## Migration and validation

`PhoneAuthentication` adds three user columns, a filtered unique normalized-phone
index and the authentication challenge table. It drops no tables or columns.
Applied to `Qareeb_Development_Foundation_20261127`; before/after counts remained
2 users, 1 provider, 0 appointments. Seed accounts remain inactive.

The later `ProviderApplicationReview` migration is additive: it adds nullable
`ReviewedAt`, `ReviewedById` and `ReviewNote` columns to `Providers` only. No
data is dropped or altered; `IsApproved` remains the single access gate.

`ProviderDiscoveryPresentation` is also additive: it adds nullable image,
neighborhood, distance, next-slot and published-contact columns to `Providers`.
Public catalog reads use the same `IsApproved` gate plus an active owner and
active services; see [backend setup](BACKEND_SETUP.md).

For another already reviewed local database:

```powershell
dotnet ef database update --project backend/Qareeb.Api
dotnet test Qareeb.sln
dotnet ef migrations has-pending-model-changes --project backend/Qareeb.Api
```

Integration tests use separate fresh LocalDB databases, secure-cookie test clients
and the encrypted local sender. They cover signup, OTP replay, resend throttling,
CSRF, login, logout, phone change, recovery, pending provider access, admin TOTP
enrollment/replay, provider review, the already-registered-phone signup outcome
and the `/me` provider state, alongside the existing booking/security checks. They
also assert that the API serves the prototype page and `/js`/`/css`, and does not
expose `.local` or backend source paths.

Manual browser verification against LocalDB covered: signup with a development OTP,
login, session restore after refresh, provider application remaining pending with
only the Customer role, Arabic RTL and dark theme, phone change with session
invalidation, password recovery, logout, wrong-password errors, and that the demo
role switcher still receives 401 from admin API routes.

After the latest changes, browser verification added: `GET /api/auth/me` provider
status surviving a refresh, the already-registered-phone signup flow that verifies
ownership and directs the user to sign in or recover, administrator enrollment-state
discovery, and the pending-application approve/reject workflow.

## Before deployment

Implement a real SMS adapter with delivery retry/outbox semantics and operational
monitoring; never log codes. Choose hosting, TLS/reverse proxy configuration,
persistent encrypted Data Protection keys, distributed rate limiting and supported
.NET 10 LTS. The present IP limiter is process-local and does not trust arbitrary
forwarded headers. Split the global auth transaction lock by account when scaling.
Add administrative action audit trails and deployment-specific abuse monitoring.

Lost-phone recovery without an existing authenticated session or access to the
registered phone is intentionally unavailable: define a reviewed identity-proofing
support process. Lost admin authenticators likewise require an operational recovery
policy; SMS alone cannot bypass MFA. These are not implemented recovery shortcuts.
