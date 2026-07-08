# GitHub Actions Azure App Service Deployment

This repo deploys the Sony Badge Next.js app to Azure App Service from
`.github/workflows/deploy-azure-app-service.yml`.

## GitHub Secrets

Create these in GitHub repository or environment secrets:

| Secret | Purpose |
| --- | --- |
| `AZURE_CLIENT_ID` | Azure federated identity client ID for GitHub OIDC login |
| `AZURE_TENANT_ID` | Azure tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |
| `DATABASE_URL` | MySQL connection string used by the server |
| `APP_SESSION_SECRET` | Server-only secret for signed LINE session cookies |
| `LOG_HASH_SECRET` | Server-only HMAC secret for log-safe customer identifiers |
| `SONY_PRODUCT_API_SUBSCRIPTION_KEY` | Sony APIM subscription key |

Do not add `LINE_CHANNEL_SECRET` for the current LIFF badge flow. The app
verifies `liff.getIDToken()` using `LINE_CHANNEL_ID`; it does not perform OAuth
code exchange, webhook validation, or Messaging API token issuance.

## GitHub Variables

Create these in GitHub repository or environment variables:

| Variable | Example / note |
| --- | --- |
| `AZURE_RESOURCE_GROUP` | Client-provided resource group name |
| `AZURE_WEBAPP_NAME` | Azure App Service app name |
| `AZURE_SLOT_NAME` | Optional deployment slot name; leave empty if unused |
| `NODE_VERSION` | `22.x` |
| `APP_ENV` | `staging` or `production` |
| `APP_BASE_URL` | Public Azure app URL |
| `ALLOWED_ORIGINS` | Usually same origin as `APP_BASE_URL` |
| `ALLOWED_REFERRERS` | Allowed campaign / LIFF redirect origins |
| `NEXT_PUBLIC_LIFF_ID` | LINE Mini App / LIFF ID |
| `LINE_CHANNEL_ID` | LINE channel ID used to verify ID token audience |
| `NEXT_PUBLIC_DEBUG_MOCK_JSON` | `false` for UAT and production |
| `SONY_PRODUCT_API_MODE` | `live` for real Sony APIM, `mock` only for controlled UAT |
| `SONY_PRODUCT_API_BASE_URL` | Sony APIM endpoint URL |
| `SONY_PRODUCT_API_COUNTRY_CODE` | `th` |

## Azure Requirements

- App Service should be Linux Node.js with Node 22 or compatible.
- GitHub OIDC must be configured in Azure for this repository/environment.
- The federated identity should have the least App Service scope needed,
  normally `Website Contributor` on the target app or resource group.
- App Service must be able to reach the MySQL database.
- If `run_migrations=true` is used in manual workflow dispatch, the GitHub
  runner must also be allowed to reach the MySQL database.

## Deployment Behavior

- Pushes to `main` run install, tests, lint, build, App Service setting update,
  and deploy.
- Manual workflow dispatch can optionally run `npm run db:migrate` before the
  deploy by selecting `run_migrations=true`.
- The workflow deploys source without `.env*`, `.next`, `node_modules`, docs, or
  local machine artifacts. Azure App Service builds with the configured app
  settings, including `NEXT_PUBLIC_LIFF_ID`.

## LINE Endpoint

Configure LINE Developers endpoint to the clean Azure badge URL:

```text
https://<azure-app-host>/badge
```

Do not configure LINE with `lineuuid` or `debug` query parameters.
