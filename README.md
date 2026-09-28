## GitHub-only Studio (current deployment)

The admin can run on free GitHub Pages in the `alhuzali-admin` repository, at `admin.alhuzali.com`. Build its static files with `node scripts/build-admin.mjs`. This replaces the separate paid/account-dependent Worker setup for the initial deployment. All authored source stays here; `studio-dist/` is the deployable admin bundle.

GitHub authenticates API writes using an owner-supplied, expiring fine-grained token scoped only to `alhuzali-portfolio`: Contents read/write and Actions read. The token stays in JavaScript closure memory, is never written to storage or source, and is sent only to `https://api.github.com`. Reload/sign out clears it. The static login screen and editor source are public; security for repository writes is enforced by GitHub, not by hiding client-side code.

Drafts and pending upload bytes are stored in IndexedDB on the owner's device, not a private cloud backend. Use a trusted personal device. Selected files and public content are committed together; unpublished projects stay local. Published files and repository history are public. Changed remote content blocks a stale publication; branch updates never force-push. Export the draft text before clearing local drafts. Keep original copies of pending files. A visual draft preview is local and does not run report interactions.

The Worker implementation below remains an optional alternative and is not required for this deployment.

# Hussam Alhuzali — Professional Portfolio

A light, responsive professional portfolio with dedicated project URLs and a separate, owner-only editing studio.

## What is implemented

- Homepage: introduction, selected work, capabilities, experience, education, credentials, and contact.
- Project library: search, topic/tool/format filters, and shareable filter URLs.
- Individual root-level project routes and redirects for renamed project URLs.
- Project brief, contribution, target audience, key insights, outcomes, documents, and optional Power BI embedding.
- PDF preview and document links; slides and Office files open/download rather than pretending to render natively.
- Optional mobile-specific Power BI report URL, report expansion, and direct report opening.
- Admin forms for all content, projects, uploads, draft preview, publishing, and additional sections.
- Server-enforced GitHub owner authentication, PKCE, expiring server sessions, CSRF checks, revision conflicts, private draft media, and publication locking.
- GitHub Pages deployment workflow. Publication from the admin creates a repository commit and checks the resulting workflow status.

## Current setup status

The source and local tests are complete. Production admin activation requires a Worker host, D1/R2 resources, GitHub OAuth registration, a repository-scoped publishing credential, and DNS. The supplied CV file is omitted pending explicit approval for public download. No credentials are committed. Unconfigured admin APIs refuse access.

Initial project descriptions are grounded in the supplied CV. No internal reports, employer data, invented metrics, fake certificates, or demo dashboards are represented as real deliverables. There are no live Power BI report URLs yet. PL-300 is marked as preparation.

## Architecture

| Surface | Location | Responsibility |
| --- | --- | --- |
| Public portfolio | GitHub Pages, intended `alhuzali.com` | Generated static pages; no visitor sign-in |
| Portfolio Studio | Cloudflare-compatible Worker, intended `admin.alhuzali.com` | GitHub sign-in, editing, preview, uploads, publishing |
| Draft content | D1 | Private drafts and server-side session records |
| Media | R2 | Private until referenced by published content |
| Published content | `content/portfolio.json` in this repository | Versioned source for the public website |

OAuth requests identity only. A separate fine-grained server-side token is limited to this repository. GitHub identity is checked against immutable user ID `94220344`; the username alone is not an authorization boundary. Repository and Worker access still need to be configured in the owner's accounts.

## Local work

Use Node 24 or later:

```sh
npm ci
npm run check
```

`dist/` contains the complete public website. Serve it with any static HTTP server to inspect it. Opening files directly is not a substitute for hosted route testing. Browser UI automation is not included in the test results; the UI interaction tests use a simulated DOM.

Optional GitHub project-site preview prefix:

```sh
SITE_BASE_PATH=/alhuzali-portfolio npm run build
```

The Actions workflow builds at the domain root for alhuzali.com.

## Admin deployment

1. Create a Cloudflare Worker host with D1 and R2. Do not deploy the admin as a static GitHub Pages folder: its APIs must run server-side.
2. Create D1 `portfolio-content` and R2 `alhuzali-portfolio-media`. Set the actual D1 ID in `wrangler.toml` and apply `migrations/0001_content.sql`.
3. Set `ADMIN_ORIGIN` to the exact HTTPS admin origin and `PUBLIC_ORIGIN` to the public site. For initial testing, use the actual worker URL; change it when the custom domain is ready.
4. Register a GitHub OAuth app with homepage = admin origin and callback = `<admin origin>/auth/callback`. No repository OAuth scope is requested.
5. Store `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `GITHUB_CONTENT_TOKEN` as Worker secrets, never in source or browser code. The content token needs only this repository, Contents read/write, and Actions read. Do not grant workflow-write, organization, or account permissions.
6. Build and deploy the Worker with its `admin/` static assets and D1/R2 bindings. Configure `admin.alhuzali.com` on that host.
7. Verify owner sign-in, non-owner denial, upload privacy, draft save/preview, a harmless publication, its successful GitHub Pages deployment, and logout in production.

Before activation, review provider availability/costs and account configuration with the owner. The source does not enroll the owner in any paid service.

### Content workflow

Edit → Save draft → Preview → Publish. A publication queues the GitHub Pages build; it is not proof of a completed deployment. Use **Check latest deployment** in the studio. Draft-only projects and sections are excluded from the repository publication. Uploads remain private until published. Published source and earlier GitHub commits remain publicly readable; unpublishing cannot erase historical copies.

Project URL changes preserve aliases. Deleting a project intentionally removes its route on the next build; historical commits remain available. Direct repository edits to published JSON are detected and block studio publishing until reconciled, preventing silent overwrites.

### Power BI

The initial implementation supports public `app.powerbi.com/view` embeds and Microsoft sign-in `app.powerbi.com/reportEmbed` embeds. It does **not** implement app-owns-data token generation or purchase Embedded/Fabric capacity. Public reports must be deliberately approved for public disclosure. A secure report's Microsoft access requirements still apply.

Microsoft Publish to web does not support Power BI mobile layout views. Use a report designed with a small-screen canvas as the optional mobile URL, or choose a licensed SDK embedding setup in a later deployment if true phone layouts are required. The surrounding website is responsive, but report usability must be verified with each actual report.

## Domain and email

First establish a working GitHub Pages deployment. Then set `alhuzali.com` in repository Pages settings and add the exact GitHub-recommended web DNS records. Verify the domain and enable HTTPS. Set up the admin subdomain separately.

Preserve Microsoft 365 MX, SPF, DKIM, DMARC, Autodiscover, and domain-verification records. Do not change nameservers or replace the DNS zone merely to add the website. Microsoft 365 use does not prove Microsoft is the authoritative DNS host; inspect the actual provider before changes.

## Main files

- `content/portfolio.json`: CV-grounded content.
- `src/render.mjs`: public page templates.
- `src/schema.mjs`: input validation and publication rules.
- `public/`: stylesheet, behavior, favicon, and favicon.
- `admin/`: studio interface and generated shared assets.
- `worker/index.mjs`: authenticated backend.
- `migrations/`: D1 schema.
- `tests/`: access, publication, file privacy, routing, and UI interaction tests.

## References

- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub Pages custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [GitHub OAuth and PKCE](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [Power BI Publish to web limitations](https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-publish-to-web)
