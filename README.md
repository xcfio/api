# Fastify API

A serverless API built with Fastify, featuring rate limiting, CORS, modular routes, and custom error handling.

## Features

-   **Rate Limiting:** Prevents abuse by limiting requests per IP.
-   **CORS:** Restricts origins based on a configurable whitelist.
-   **Modular Routes:** Includes `Routine`, `Support`, `Vaultly`, and `xcfbot` modules.
-   **Custom Error Handling:** Handles validation and internal errors gracefully.
-   **Status Endpoint:** `/status` for health checks.

## Setup

1. **Install dependencies:**

    ```sh
    npm install
    ```

2. **Configure environment variables:**

    - `NODE_ENV` (e.g., `development` or `production`)
    - `PORT` (default: `7200`)
    - `RENDER` (set for deployment on Render.com)

3. **Allowed Hostnames:**
    - Edit `allowed-hostname.json` to set permitted CORS origins.

## Running Locally

```sh
node --run dev
```

## Endpoints

-   `GET /status` — Health check
-   `GET /` — Redirects to GitHub repo
-   Other endpoints provided by route modules

## Development

-   Logging to `log.json` in development mode.
-   Custom schema validation error formatting.

## Deployment

-   Listens on `0.0.0.0` if `RENDER` env is set, otherwise on `localhost`.
