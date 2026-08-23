# ParcelGo — Last-Mile Delivery Tracker

A delivery management platform for customers, delivery agents, and administrators. Handles order creation with auto-calculated charges, intelligent agent assignment, and real-time status tracking.

## Features

- **Customer**: Register, place orders, view charge breakdown before confirming, track deliveries, reschedule failed deliveries
- **Admin**: Manage zones, rate cards, COD surcharges, assign agents, override order status, view dashboard metrics
- **Delivery Agent**: View assigned orders, update delivery status with notes
- **Rate Engine**: Zone detection via pincode, volumetric weight calculation, B2B/B2C rate cards, COD surcharge — all admin-configurable, nothing hardcoded
- **Auto-assignment**: Finds nearest available agent, prefers same drop-zone agents
- **Immutable tracking history**: Every status change is logged with actor and timestamp, never overwritten
- **Email notifications**: Sent on every status change via Spring Mail (configurable)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Java 17, Spring Boot 3.2, Spring Security |
| Auth | JWT (jjwt) |
| ORM | Spring Data JPA / Hibernate |
| Database | PostgreSQL |
| Migrations | Flyway |
| Email | Spring Mail (SMTP) |

## Project Structure

```
ParcelGo/
├── backend/
│   ├── src/main/java/com/parcelgo/
│   │   ├── config/          # Security, CORS, async config
│   │   ├── controller/      # REST endpoints
│   │   ├── dto/             # Request/response objects
│   │   ├── exception/       # Global error handling
│   │   ├── model/           # JPA entities
│   │   ├── repository/      # Spring Data repositories
│   │   ├── security/        # JWT filter and utility
│   │   └── service/         # Business logic
│   └── src/main/resources/
│       └── db/migration/    # Flyway SQL migrations
└── frontend/
    └── src/
        ├── components/      # Shared UI components and layouts
        ├── hooks/           # useAuth hook
        ├── lib/             # Axios instance, utility functions
        ├── pages/           # Admin, customer, agent pages
        └── types/           # TypeScript interfaces
```

## Setup

### Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
- PostgreSQL 14+

### Database

```sql
CREATE DATABASE parcelgo;
```

Flyway runs migrations automatically on startup. V1 creates the schema, V2 seeds zones, rate cards, and demo users.

### Backend

```bash
cd backend

# Copy and fill in environment variables
cp ../.env.example .env

# Run (set env vars or use application.properties defaults)
mvn spring-boot:run
```

The API starts on `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app starts on `http://localhost:5173`. The Vite dev server proxies `/api` to `localhost:8080`.

## Environment Variables

See `.env.example` for all required variables.

For email notifications, provide Gmail SMTP credentials. If `MAIL_USERNAME` is empty, notifications are logged but not sent — the app works fine without it.

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@parcelgo.in | password |
| Agent | agent@parcelgo.in | password |
| Customer | customer@example.com | password |

## API Overview

```
POST   /api/auth/register
POST   /api/auth/login

POST   /api/orders/calculate       # Calculate charge before confirming
POST   /api/orders                 # Create order
GET    /api/orders                 # List orders (role-filtered)
GET    /api/orders/:id
GET    /api/orders/track/:trackingId   # Public tracking endpoint
GET    /api/orders/:id/tracking    # Full tracking timeline
POST   /api/orders/:id/status      # Update delivery status
POST   /api/orders/:id/assign      # Manual agent assignment
POST   /api/orders/:id/auto-assign # Auto-assign nearest agent
POST   /api/orders/:id/reschedule

GET    /api/zones
POST   /api/zones
PUT    /api/zones/:id
DELETE /api/zones/:id
POST   /api/zones/:zoneId/areas
DELETE /api/zones/areas/:areaId

GET    /api/rates
POST   /api/rates
PUT    /api/rates/:id
GET    /api/rates/cod
PUT    /api/rates/cod/:id

GET    /api/agents
POST   /api/agents
PUT    /api/agents/:id
PATCH  /api/agents/:id/availability

GET    /api/admin/dashboard
GET    /api/admin/customers
```

## Rate Calculation Logic

1. **Detect zones** — look up pickup and drop pincodes in `zone_areas` table
2. **Volumetric weight** = `L × B × H ÷ 5000`
3. **Billable weight** = `max(actual_weight, volumetric_weight)`
4. **Zone type** — INTRA if pickup and drop zones are the same, INTER otherwise
5. **Rate card lookup** — query `rate_cards` for matching `order_type`, `zone_type`, and weight range
6. **Base charge** = `base_charge + (rate_per_kg × billable_weight)`
7. **COD surcharge** — added from `cod_surcharges` table if payment type is COD
8. **Total** = base charge + COD surcharge

All rates and surcharges come from the database and are editable by admin in real time.

## System Design

See [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md).

## Running Tests

```bash
cd backend
mvn test
```

11 unit tests covering rate calculation (various weight scenarios, B2B/B2C, intra/inter-zone, COD) and agent assignment logic.
