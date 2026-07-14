# UAT Next.js deployment

The UAT workflow builds and deploys a complete Next.js production Node.js server
to the existing Windows Azure App Service. IIS terminates HTTPS and uses
`web.config`/iisnode to forward dynamic requests to `server.js`. The root URL
comes from `app/page.tsx`, API routes execute in Node.js, and the deployment
check remains available from `public/deployment-check.html`.

## Target

- Custom domain: `https://stglineminiapp.sony.co.th/`
- Azure App Service: `mysonybadgestg`
- Smoke-test path: `https://stglineminiapp.sony.co.th/deployment-check.html`
- Server health path: `https://stglineminiapp.sony.co.th/api/health`
- Source branch: `main`
- GitHub environment: `uat`

DNS already maps the custom domain to
`mysonybadgestg.azurewebsites.net`. The current IIS `403` response means the
domain reaches Azure, but no default application or page is available at the
App Service root.

## Deployment credential

Azure Deployment Center generated the repository workflow and publish-profile
secret reference. The workflow uses that existing GitHub secret to deploy to
`mysonybadgestg`; no credential value is stored in source.

The placeholder needs no application secrets. Configure future runtime values
as Azure App Service application settings or Key Vault references; do not
commit `.env` files.

## Azure App Service settings

The App Service owner must confirm these settings in the Azure Portal:

- Operating system: Windows, using the existing IIS/iisnode hosting model.
- Runtime stack: Node.js 24, matching the GitHub Actions build.
- Platform: 64-bit.
- HTTPS Only: enabled.
- Always On: enabled when the App Service plan supports it.
- Health check path: `/api/health`.
- `NODE_ENV=production` (also enforced by `web.config`).
- Do not create or hardcode `PORT`; App Service/iisnode provides it.

Configure these non-secret UAT values when the application starts using them:

- `APP_ENV=uat`
- `APP_BASE_URL=https://stglineminiapp.sony.co.th`
- `ALLOWED_ORIGINS=https://stglineminiapp.sony.co.th`
- `ALLOWED_REFERRERS=https://stglineminiapp.sony.co.th`

Store database credentials, session secrets, LINE secrets, and partner API keys
as App Service secret settings or Key Vault references. Never expose them with
the `NEXT_PUBLIC_` prefix.

## Expected result

A push to `main` runs tests, lint, and the production build before deploying the
production server package. The domain root should return `200` and show the
framework placeholder from `app/page.tsx`. `/api/health` should return a JSON
response identifying the Node.js runtime. `/deployment-check.html` should
continue to return `200` and show `Deployment smoke test passed.`

The App Service must use the Node 24 runtime. Keep `NODE_ENV=production`, enable
Always On for a paid App Service plan, and let Azure provide `PORT`; do not
hardcode it. The custom server accepts both numeric ports and the named pipe
endpoint used by iisnode on Windows.
