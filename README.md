# Planning Poker

## Local setup
1. Create the database and tables from `sql/schema.sql`.
2. In `server/.env`, set the MySQL credentials (see `server/.env.example`). You can use `DB_URL` or individual DB variables.
3. Install dependencies and start dev mode:

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` and the API/WebSocket at `http://localhost:4000`.

## Optional proxy (server)
If your company uses a proxy, you can configure the Node server to use it:
- Set `PROXY_URL=http://localhost:3129` in `server/.env`.
- Keep `NO_PROXY=localhost,127.0.0.1` so local requests are not proxied.

## Docker MySQL (local development)
If you do not want to install MySQL locally, use Docker:

```bash
docker compose up -d
```

This runs MySQL on `localhost:3306` and initializes the schema from `sql/schema.sql`.

## Build and production
```bash
npm run build
npm start
```

## Heroku
- Set env variables (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, CLIENT_ORIGIN).
- Deploy the repo. Heroku runs `npm run build` and `npm start`.
