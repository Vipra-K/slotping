# SlotPing Backend

## Local setup

1. Start PostgreSQL:
```bash
docker compose up -d postgres
```
2. Copy `.env.example` to `.env` and set a long random `JWT_SECRET`.
3. Add Twilio credentials if WhatsApp delivery is required.
4. Install and run:
```bash
npm install
npm run start:dev
```

The API listens on `http://localhost:3000` by default.

## Twilio WhatsApp

Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_WHATSAPP_NUMBER`. For local development, the Twilio WhatsApp Sandbox can be used; recipients must opt in to the sandbox before delivery.

## Demo seed

Set at least four real test numbers in `DEMO_WHATSAPP_NUMBERS`, comma-separated, then run:
```bash
npm run seed
```

Demo login:
- Email: `demo@slotping.local`
- Password: `Demo@12345`

Do not use real customer data in the demo database.

## Reminder worker

A scheduler runs every 10 minutes and checks for confirmed appointments roughly two hours away. Successful reminder sends are marked as sent.

## API

- `POST /auth/signup`
- `POST /auth/login`
- `GET /appointments?date=YYYY-MM-DD`
- `POST /appointments`
- `PATCH /appointments/:id/status`
- `DELETE /appointments/:id`
- `POST /appointments/:id/delay`

All appointment routes require the JWT returned by login/signup.
