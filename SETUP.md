# Setup and running

## Prerequisites

- Node.js 22.5 or newer. The API uses the built-in `node:sqlite` module.
- npm.
- Docker with Compose, for the containerized setup.

## Setup

From the repository root:

```bash
npm install
```

This installs the client and server workspaces.

## Database seeding

The database is created and seeded automatically. `npm run dev` runs a seed step first, and it only seeds when the database has no users yet, so restarting keeps your data.

The seed creates 10,000 users with 0 to 10 hobbies each. It uses a fixed random seed, so every run produces the same data.

To wipe the database and seed it again:

```bash
npm run seed
```

The database file is `server/data/directory.db`. Set `DATABASE_PATH` to use a different location.

## Run locally

```bash
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:4000/api/health

This starts the Vite client and the API together, and both reload on changes. The client proxies `/api` to the API.

## Run with Docker Compose

```bash
docker compose up --build
```

- Client: http://localhost:8080
- API: http://localhost:4000/api/health

On first start the API seeds the database before it accepts requests. nginx serves the built client and proxies `/api` to the API.

SQLite data is stored in the `sqlite-data` volume, so it survives restarts and rebuilds. To stop and delete the data, so the next start seeds fresh:

```bash
docker compose down -v
```
