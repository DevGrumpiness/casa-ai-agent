# Casa AI Agent

AI-assisted restaurant reservation proof of concept.

## Features

- Voice reservation intake through a Vapi phone agent
- Reservation business rules (party size limit, daily capacity, chef override) enforced in FastAPI
- Automatic "pending" vs "confirmed" status based on those rules
- Next.js dashboard to view reservations, filter by date, confirm pending ones, and create new reservations manually
- PostgreSQL persistence

## Tech Stack

- Next.js
- TypeScript
- FastAPI
- Python
- PostgreSQL
- n8n
- Vapi
- Docker

## Architecture

```
Caller
  ↓
Vapi
  ↓
n8n
  ↓
FastAPI
  ↓
PostgreSQL
  ↑
Next.js Dashboard
```

The voice agent (Vapi) and the manual dashboard form both end up creating reservations through FastAPI, which applies the same business rules and persists them in PostgreSQL. The dashboard reads and updates reservations directly against the FastAPI API.

## Voice Agent Demo

The project includes a working Vapi voice-agent integration for phone reservations:

- Vapi answers the call and handles the conversation in German
- Vapi calls an n8n webhook with the collected reservation details
- n8n forwards the request to the FastAPI reservation endpoint
- FastAPI applies the reservation business rules (capacity, party size)
- PostgreSQL persists the reservation
- The reservation shows up in the Next.js dashboard, pending confirmation if needed

Live phone access to the voice agent is available on request. The phone number is intentionally not published here to avoid uncontrolled call costs.

Screenshot: `<placeholder>`

Demo video: `<placeholder>`

## Local Development

Requirements: Docker, [uv](https://docs.astral.sh/uv/), Node.js 22+.

Start PostgreSQL and n8n:

```bash
docker compose up -d
```

API (from `apps/api`):

```bash
uv sync
uv run python -m app.init_db
uv run uvicorn app.main:app --reload
```

Web (from `apps/web`):

```bash
npm install
npm run dev
```

Copy the `.env.example` files (`apps/api/.env.example`, `apps/web/.env.example`, `.env.example`) to `.env` and fill in the values you need locally.

## Deployment

The public demo runs on [Railway](https://railway.app) as a single environment with three services: `web`, `api`, and `postgres`. n8n and Vapi are **not** deployed publicly — the demo dashboard creates reservations by calling the FastAPI endpoint directly, since the local n8n workflow only forwarded requests to FastAPI without adding logic. The Vapi voice agent still points at a locally/privately run n8n instance for the phone flow.

See `apps/api/Dockerfile` and `apps/web/Dockerfile` for the container images used by Railway.

## Demo

Live Demo: `<URL>`

Voice Demo Video: `<URL>`

## PoC Scope

This is a proof of concept built to demonstrate the architecture, not a production system. Intentionally out of scope:

- Authentication
- Reservation cancellation or modification
- Table management
- Time slot / availability logic
- German-only phone number requirement
- Additional AI features beyond the existing reservation flow

The public database contains disposable demo data only.