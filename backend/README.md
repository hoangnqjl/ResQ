# ResQ backend (MySQL)

The API uses MySQL. It reads `.env` in this directory, or falls back to `../.env` at the project root. In PowerShell, create the local config with `Copy-Item .env.example .env`, then edit `.env` and set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`. `.env.example` is only a template and is not loaded as configuration. `DB_USER` and `DB_PASSWORD` must match an account that exists on your MySQL server. That account needs permission to create the database and tables the first time the schema is applied.

From this directory, run:

```sh
npm run db:schema
npm run db:seed
npm run dev
```

`db:schema` creates the configured database if needed, then applies `db/schema.sql`. It does not delete or convert existing tables. If an existing database was created with a different schema, use a new empty `DB_NAME` in `.env` (for example `resq_clean`) and rerun the commands. `db:seed` inserts a demo buyer, a demo seller, their shop, and four sample listings. It downloads the listing photos into `backend/uploads` and stores local API URLs in MySQL. Set `PUBLIC_API_URL` when the API is reachable through a LAN IP or a public host; it defaults to localhost. The API serves those images from `/uploads`. The API listens on `API_PORT` (default `4000`).

Demo profiles have no password or login credentials; they are seed records for trying app flows. Their email addresses use the reserved `.local` domain.
