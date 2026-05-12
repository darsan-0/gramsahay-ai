# GramSahay AI — Backend

Flask API foundation for **GramSahay AI**, an AI-oriented assistant for rural government schemes. This folder is **backend only** (no frontend in this tree).

## Features (current)

- **JSON file** as the initial database (`database/schemes.json`)
- **Blueprints** for schemes and chat
- **CORS** enabled for `/api/*`
- **Placeholder** chat and recommendation/translation services for future AI, NLP, voice, and OpenAI work

## Project layout

| Path | Role |
|------|------|
| `app.py` | Flask app factory, CORS, blueprint registration |
| `config.py` | Paths, secrets placeholder, environment-based config |
| `routes/scheme_routes.py` | Scheme listing and category filter |
| `routes/chat_routes.py` | POST `/api/chat` stub |
| `services/recommendation_service.py` | Future ranking / ML / LLM hooks |
| `services/translation_service.py` | Future Telugu + English support |
| `utils/helpers.py` | JSON load helpers and category filter |
| `database/schemes.json` | Scheme records |

## Quick start

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Server defaults to `http://127.0.0.1:5000`.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Liveness check |
| GET | `/api/schemes` | All schemes from JSON |
| GET | `/api/schemes/category/<category>` | Schemes filtered by category (case-insensitive) |
| POST | `/api/chat` | Placeholder for future AI chatbot |

### Example: list schemes

```http
GET /api/schemes
```

### Example: filter by category

```http
GET /api/schemes/category/agriculture
```

Categories in sample data include: `agriculture`, `education`, `health`, `pension`.

### Example: chat placeholder

```http
POST /api/chat
Content-Type: application/json

{
  "message": "What schemes help farmers?",
  "language": "en",
  "context": { "district": "example", "occupation": "farmer" }
}
```

## Environment

- `FLASK_ENV` — `development` (default) or `production` (selects config class)
- `GRAMSAHAY_SECRET_KEY` — Flask secret (set in production)
- `CORS_ORIGINS` — Comma-separated origins or `*` (default)

## Next steps (not implemented here)

- OpenAI or other LLM client inside `services/` and called from `chat_routes`
- Auth middleware if needed
- Replace JSON with PostgreSQL / Redis while keeping the same route contracts
- Voice and NLP pipelines as separate services or modules
