# EF1 Motorsport

Official Season 1 championship hub for the Brookhaven electric racing league, with 20 drivers, 10 constructors, 12 rounds, standings, points inspections, news, and protected FIA publishing controls.

The frontend uses plain HTML, CSS, and JavaScript. Netlify Functions handle authenticated updates, and Netlify Database with Drizzle stores race results, point adjustments, news, and one-hour administrator sessions. No frontend build step is required.

## Local development

Install dependencies with `npm install`, link the Netlify project, and run `npm run dev` (port 8889). Configure `FIA_ADMIN_PASSCODE` as a secret runtime environment variable for administrator access. Never put it in frontend code. Netlify supplies database connectivity and applies the migrations in `netlify/database/migrations` at deployment.

Edit the grid and calendar in `public/data.js`. Saturday races use fixed CST (UTC−6), including during daylight saving time; the countdown also displays the visitor’s local start time. Calendar rounds have no individual dates because none were supplied. The calendar uses “results posted” once a round contains a classification.

Run `npm run db:generate -- --name descriptive_change` after changing `db/schema.ts`. The platform validates deployment automatically.
