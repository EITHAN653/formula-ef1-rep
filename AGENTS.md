# Project guide

This is a plain HTML/CSS/JavaScript championship site, served directly from `public`; no framework or build command is needed.

- `public/index.html`: shell, navigation, accessible points dialog, and finished social metadata.
- `public/style.css`: responsive dark racing theme using Montserrat and Orbitron.
- `public/script.js`: hash-based sections, standings calculations, countdown, and administrator forms.
- `public/data.js`: canonical 10-team grid, 12 rounds, and original launch bulletins; also imported by the API for validation.
- `netlify/functions/championship.mts`: same-origin GET/POST endpoint. The server computes points and validates all writes. Login checks the runtime passcode and issues a secure HttpOnly session cookie; only token hashes persist.
- `db/schema.ts` and `drizzle.config.ts`: Drizzle schema and migration generation configuration.

Use Netlify Database for persistent state, never browser localStorage. Escape dynamic text before rendering HTML. Preserve the supplied driver spellings and team names. Constructor points include FIA adjustments. DNF/DSQ/DNS award zero points. Unique database constraints prevent duplicate round positions or driver entries. Generate a named migration whenever the schema changes. Never commit or display secrets. Administrator authentication uses `FIA_ADMIN_PASSCODE`; do not restore a client-side credential. The race countdown uses fixed UTC−6 and compares the full Saturday 14:30 UTC timestamp.
