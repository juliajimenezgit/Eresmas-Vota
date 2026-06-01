# Eresmas Vota

Sistema de votación para charangas con React + FastAPI.

## Requisitos

- Node.js 20+
- Python 3.12+

## Backend

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # si no existe .env
uvicorn app.main:app --reload
```

API en `http://127.0.0.1:8000`.

### Variables de entorno (`server/.env`)

| Variable       | Descripción                          |
|----------------|--------------------------------------|
| `APP_URL`      | URL del QR (frontend de votación)    |
| `DATABASE_URL` | SQLite, p. ej. `sqlite:///votes.db` |
| `FRONTEND_URL` | Origen permitido en CORS             |
| `ADMIN_FRONTEND_URL` | Origen permitido para panel admin |
| `ADMIN_KEY` | Clave privada para acceso organizadores |

## Frontend

```bash
cd client
npm install
npm run dev
```

App en `http://localhost:5173`. El proxy de Vite reenvía `/api` al backend.

Para producción, define `VITE_API_URL` con la URL pública del API.

### Panel de organizadores

- URL: `http://localhost:5173/admin`
- Acceso: clave de organizador (`ADMIN_KEY` en `server/.env`)
- Datos en directo: total votos, ranking, líder actual y últimos votos.

## Endpoints

| Método | Ruta           | Descripción        |
|--------|----------------|--------------------|
| POST   | `/api/vote`    | Registrar voto     |
| GET    | `/api/results` | Resultados         |
| GET    | `/api/qr`      | Imagen PNG del QR  |
| GET    | `/api/admin/dashboard` | Panel admin (protegido por `X-Admin-Key`) |

## Seguridad

- `deviceId` único en `localStorage` (UUID)
- Validación en SQLite (`device_id` UNIQUE)
- Registro de IP y User-Agent
- CORS limitado a `FRONTEND_URL`
- Validación con Pydantic
