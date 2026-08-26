# UAT Next.js deployment

The UAT workflow builds and deploys the Sony Badge Next.js application to the
existing Windows Azure App Service. IIS terminates HTTPS and uses
`web.config`/iisnode to forward dynamic requests to `server.js`.

## Target

- Custom domain: `https://stglineminiapp.sony.co.th/`
- Azure App Service: `mysonybadgestg`
- Source branch: `uat`
- GitHub environment: `uat`
- Health endpoint: `https://stglineminiapp.sony.co.th/api/health`
- Static smoke endpoint: `https://stglineminiapp.sony.co.th/deployment-check.html`

The GitHub repository default branch is still `founding`, but UAT deployment is
intentionally triggered by pushes to `uat` through
`.github/workflows/uat_mysonybadgestg.yml`.

## Deployment credentials

The workflow keeps the Azure Deployment Center publish-profile secret:

```text
AZUREAPPSERVICE_PUBLISHPROFILE_65CDA25D8ED242478BC3E40CB7D2134E
```

Do not replace it with credentials from another repository. The publish profile
is stored as a repository Actions secret and is used only by
`azure/webapps-deploy`.

## Application configuration

The App Service owner cannot currently manage App Service application settings,
so UAT configuration is stored as the encrypted GitHub **environment secret**
`UAT_ENV_FILE` under `Settings > Environments > uat`.

The secret contains the complete `.env.production` content. It is materialized:

1. on the Windows build runner before `npm test`, lint, and build;
2. again inside the downloaded deployment directory immediately before deploy.

The environment file is not committed and is not uploaded in the intermediate
build artifact. It is added only to the final App Service package and removed
from the GitHub runner after deployment.

Next.js resolves an already-defined `process.env` value before values from
`.env.production`. App Service environment variables can therefore override the
deployed file later without requiring an application code change. Public
`NEXT_PUBLIC_*` values are build-time values and must be present in
`UAT_ENV_FILE` when the GitHub build runs.

Required keys:

```text
DATABASE_URL
DATABASE_SSL
APP_ENV
APP_BASE_URL
NEXT_PUBLIC_APP_BASE_URL
ALLOWED_ORIGINS
ALLOWED_REFERRERS
NEXT_PUBLIC_LIFF_ID
LINE_CHANNEL_ID
LINE_VERIFY_ID_TOKEN_URL
APP_SESSION_SECRET
LOG_HASH_SECRET
NEXT_PUBLIC_DEBUG_MOCK_JSON
SONY_PRODUCT_API_MODE
SONY_PRODUCT_API_BASE_URL
SONY_PRODUCT_API_SUBSCRIPTION_KEY
SONY_PRODUCT_API_COUNTRY_CODE
SONY_DEMO_LINE_UUID
NEXT_PUBLIC_ACCOUNT_URL
NEXT_PUBLIC_REGISTER_PRODUCT_URL
```

Use `APP_ENV=staging`; the application does not accept `uat` as an `APP_ENV`
value. Set `SONY_PRODUCT_API_MODE=live` only when
`SONY_PRODUCT_API_SUBSCRIPTION_KEY` is configured.

## Azure MySQL

The application and database scripts support TLS when either:

```text
DATABASE_SSL=true
```

or the connection URL contains:

```text
?ssl=true
```

TLS certificate verification remains enabled. The database hostname in
`DATABASE_URL` must not include an `http://` or `https://` prefix.

The deployment workflow does not run migrations. A GitHub-hosted runner is not
assumed to have network access to the private UAT database. Apply migration and
seed changes through an approved host that can reach Azure MySQL, then record
the deployed Git SHA and `app_config.badge_rules_version`.

Database source of truth:

- schema: `scripts/db/migrate.mjs`;
- rule data: `scripts/db/seed-data.mjs`;
- manual import: `scripts/db/seed-all-rules.sql`, generated from `seed-data.mjs`.

Do not edit the generated SQL by hand. The workflow runs
`npm run db:seed:sql:check` and fails when the generated SQL differs from the
authoritative `.mjs` data.

## Workflow behavior

A push to `uat`:

1. checks out the repository on Windows;
2. creates the build `.env.production` from `UAT_ENV_FILE`;
3. installs locked dependencies;
4. verifies the generated DB seed, then runs tests, lint, and the Next.js build;
5. packages `.next`, `public`, the Windows Node runtime files, and production
   dependencies;
6. recreates `.env.production` only in the deployment directory;
7. deploys with the existing publish profile;
8. verifies root, health, and static smoke endpoints when network access allows.

Azure Access Restrictions currently return `403 Ip Forbidden` to unapproved
external source addresses. The verification step reports this specific Azure
header as a warning instead of treating it as an application failure. Other
HTTP failures and unexpected response bodies still fail the workflow.

## Azure App Service settings

The App Service owner should retain:

- Windows App Service with IIS/iisnode.
- Node.js 24 and 64-bit platform.
- HTTPS Only enabled.
- Always On when supported by the plan.
- Health check path `/api/health`.
- `NODE_ENV=production` from `web.config`.
- Azure/iisnode-provided `PORT`; do not hardcode it.

## Verification

Expected behavior when the caller is allowlisted:

- `/` redirects into the localized badge experience.
- `/api/health` returns `{"status":"ok","runtime":"nodejs"}`.
- `/deployment-check.html` contains `Deployment smoke test passed.`.

If the caller is not allowlisted, Azure returns `403 Ip Forbidden` before
Next.js executes; this is an access-restriction result, not a framework error.
