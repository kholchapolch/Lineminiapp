# UAT Next.js deployment

The UAT workflow statically exports the current Next.js placeholder and deploys
the generated `out/` directory to the existing Windows Azure App Service. The
root URL comes from `app/page.tsx`, while the standalone deployment check from
`public/deployment-check.html` remains available at its existing path.

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

The current static export needs no application environment variables or `.env`
file.

## Expected result

A push to `main` runs tests, lint, and the production build before deploying the
Next.js export. The domain root should return `200` and show the framework
placeholder from `app/page.tsx`. `/deployment-check.html` should continue to
return `200` and show `Deployment smoke test passed.`

This static-export configuration is deliberately temporary. Static exports do
not support server-side API routes or other dynamic Next.js features. Replace it
with the production server package and App Service startup configuration when
the application source is integrated.
