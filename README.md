# Qareeb (قريب) — Local Services Marketplace

A bilingual, responsive local-services marketplace prototype with an ASP.NET Core /
SQL Server development backend. Account state and public provider discovery are
connected to the API; booking actions and platform dashboards still use mock data.
There is no production, payment, or notification integration.

## Run locally

For the mock-only experience (no account or discovery API): double-click `run.bat`,
run `node server.js`, or open `index.html` directly. The account bar reports that the
API is unavailable, and the prototype falls back to its bundled mock catalog.

For the connected experience, run the API over HTTPS and open it in a browser:

```powershell
dotnet tool restore
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
. .\scripts\Use-LocalDatabase.ps1 -DatabaseName Qareeb_Development_MyDemo
dotnet run --project backend/Qareeb.Api --no-launch-profile --urls https://localhost:7080
```

Open `https://localhost:7080`. The demo role switcher is still a UI-only preview and
is separate from the real account panel. Booking and dashboard actions remain mock.

Displayed prices use Egyptian pounds (EGP / ج.م) and are illustrative demo values.
They are not verified market prices. Public category counts and provider cards come
from the database when the API is available; the mock catalog is only a fallback for
offline preview.

See [QAREEB_UPDATE.md](docs/QAREEB_UPDATE.md) for the complete change summary,
setup steps, migration notes, checks, and remaining mock/external dependencies.

## Documentation

- [Qareeb update notes](docs/QAREEB_UPDATE.md)
- [Authentication and account API](docs/AUTHENTICATION.md)
- [Backend setup and schema](docs/BACKEND_SETUP.md)
- [Architecture plan](docs/BACKEND_PLAN.md)
- [Prototype handoff](PROTOTYPE_PROGRESS.md)

The API requires .NET SDK 9 and SQL Server LocalDB. To create a fresh development
database the first time, add `-- --initialize-dev` to the `dotnet run` command.
Initialization refuses an existing database; afterwards configure the same name and
run the API without `--initialize-dev`. The seeded fixture provider owner is
intentionally inactive; create a local provider application and approve it via the
admin account panel to see database-backed discovery data.

The API base URL lives in `js/api-config.js` (`window.QareebConfig.apiBaseUrl`,
default `/api`). It must resolve to the same HTTPS origin as the page, because the
session cookie is `__Host-`, `Secure` and `SameSite=Strict` and no CORS policy is
enabled. Public discovery endpoints are anonymous; account and admin endpoints use
the same cookie session with CSRF protection on mutations.
