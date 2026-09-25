# SlotPing

SlotPing is a lightweight WhatsApp appointment communication system for small salons and clinics.

## MVP scope

- Business owner login
- Create, list, update and delete appointments
- Automatic WhatsApp confirmation
- Automatic reminder about two hours before an appointment
- Manual delay alert
- Message logging
- Single business login; no customer app or customer login

## Repository

- `backend/` — NestJS + TypeORM + PostgreSQL API
- `frontend/` — React dashboard to be added from the UI specification

## Local backend

```bash
docker compose up -d postgres
cd backend
cp .env.example .env
npm install
npm run start:dev
```

See `backend/README.md` for Twilio Sandbox and seed setup.

## Build sequence

The backend follows the supplied SlotPing product, architecture, database and build specifications. The React dashboard will be implemented from `04-ui-design-spec.md` once that specification is supplied.
