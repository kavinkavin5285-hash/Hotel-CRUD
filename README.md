# Hotel CRUD Project

Beginner-friendly Hotel List CRUD application.

## Stack
- Frontend: React + Redux Toolkit + React Router + CSS + Fetch + React Helmet Async
- Backend: Node.js + Express + PostgreSQL + native parameterized SQL + Multer

## Folder structure
hotel-crud-project/
  client/
  server/

## Setup

### 1. PostgreSQL
Create a database, for example `hotel_db`.

Then run the SQL in:
`server/db/schema.sql`

### 2. Backend
Open a terminal in `server`:

```bash
npm install
```

Copy `.env.example` to `.env` and update the PostgreSQL values.

Then:

```bash
npm run dev
```

The API runs on `http://localhost:5000`.

### 3. Frontend
Open another terminal in `client`:

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## API
- POST `/api/hotels`
- GET `/api/hotels?title=&minPrice=&maxPrice=&limit=6&offset=0`
- PUT `/api/hotels/:id`
- DELETE `/api/hotels/:id`

Images are stored in `server/uploads`.
