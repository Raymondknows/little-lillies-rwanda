This folder holds public tenant manifests and static branding assets.

Usage:
- Place per-tenant JSON manifests here (e.g. `little-lillies.json`).
- Place tenant logos under `/public/schools/<tenant-slug>/logo.png`.
- These files are served statically by Next.js and can be fetched from client-side code at runtime.

Notes:
- Only modify files in `public/` for frontend-only branding changes.
- To apply branding in the app, import or fetch these JSON files from client code and set CSS variables accordingly.
