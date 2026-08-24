# ParcelGo — Last-Mile Delivery Tracker

ParcelGo is a delivery management platform for handling orders, delivery pricing, agent assignment, and order tracking.

## Features

* Customer registration and order placement
* Automatic delivery charge calculation
* B2B/B2C and prepaid/COD pricing
* Pickup and drop zone detection
* Manual and automatic agent assignment
* Order tracking and status history
* Failed-delivery rescheduling
* Admin management of zones, rates, orders, and agents
* Email notifications for status changes

## Tech Stack

* **Frontend:** React, TypeScript, Vite, Tailwind CSS
* **Backend:** Java 17, Spring Boot
* **Database:** PostgreSQL
* **ORM:** Spring Data JPA / Hibernate
* **Security:** Spring Security, JWT
* **Migrations:** Flyway
* **Email:** Spring Mail

## Setup

### Requirements

* Java 17+
* Maven 3.8+
* Node.js 18+
* PostgreSQL 14+

### Database

```sql
CREATE DATABASE parcelgo;
```

Flyway runs the database migrations automatically when the backend starts.

### Environment Variables

Create a `.env` file using `.env.example`.

**`.env.example`**

```env
DATABASE_URL=your_database_url
DATABASE_USERNAME=your_database_username
DATABASE_PASSWORD=your_database_password
JWT_SECRET=your_jwt_secret
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_email_password
```

Do not commit your actual `.env` file or credentials to the repository.

### Run Backend

```bash
cd backend
mvn spring-boot:run
```

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Documentation

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Orders

```text
POST /api/orders/calculate
POST /api/orders
GET  /api/orders
GET  /api/orders/{id}
GET  /api/orders/track/{trackingId}
GET  /api/orders/{id}/tracking
POST /api/orders/{id}/status
POST /api/orders/{id}/assign
POST /api/orders/{id}/auto-assign
POST /api/orders/{id}/reschedule
```

### Zones & Rates

```text
GET    /api/zones
POST   /api/zones
PUT    /api/zones/{id}
DELETE /api/zones/{id}

GET  /api/rates
POST /api/rates
PUT  /api/rates/{id}
GET  /api/rates/cod
PUT  /api/rates/cod/{id}
```

### Agents

```text
GET   /api/agents
POST  /api/agents
PUT   /api/agents/{id}
PATCH /api/agents/{id}/availability
```

## Database Schema

The application uses PostgreSQL with Flyway migrations.

The main entities include:

* Users and roles
* Customers
* Delivery agents
* Orders
* Zones
* Rate cards
* COD charges
* Tracking history
* Delivery assignments

Migration files are located at:

```text
backend/src/main/resources/db/migration/
```

## Rate Calculation

The delivery charge is calculated before the customer confirms the order.

### 1. Detect Zones

Pickup and drop pincodes are matched with the zones configured by the admin.

### 2. Calculate Volumetric Weight

```text
Volumetric Weight = L × B × H / 5000
```

### 3. Calculate Billable Weight

```text
Billable Weight = max(Actual Weight, Volumetric Weight)
```

### 4. Apply Rate

The applicable rate is selected based on:

* B2B or B2C
* Intra-zone or Inter-zone
* Weight range

### 5. Add COD Charge

For COD orders, the configured COD surcharge is added.

```text
Final Charge = Base Delivery Charge + COD Surcharge
```

All rates are stored in the database and can be updated by the admin without changing the application code.

## Live Demo

**Frontend:** [ParcelGo Live App](https://parcel-go-last-mile-delivery.vercel.app/?utm_source=chatgpt.com)

**Backend:** [ParcelGo API](https://parcelgo-backend-8z59.onrender.com?utm_source=chatgpt.com)
