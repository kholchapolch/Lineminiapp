# UAT deployment smoke test

The temporary UAT workflow deploys a plain HTML page to the existing Windows
Azure App Service. It isolates deployment, DNS, and TLS from the future Next.js
application and its runtime configuration.

## Target

- Custom domain: `https://stglineminiapp.sony.co.th/`
- Azure App Service: `mysonybadgestg`
- Smoke-test path: `https://stglineminiapp.sony.co.th/deployment-check.html`
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

The static smoke page needs no application environment variables or `.env`
file.

## Expected result

A push to `main` runs tests, lint, and the production build before deploying the
static page. Both the domain root and `/deployment-check.html` should then
return `200` and show `Deployment smoke test passed.`

This workflow is deliberately temporary. Replace its static deployment package
with the production Next.js package and App Service startup configuration when
the application source is integrated.
