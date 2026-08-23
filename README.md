# ParcelGo — Last-Mile Delivery Tracker

ParcelGo is a delivery management platform built to simplify the last-mile delivery process. It allows customers to place and track orders, helps admins manage pricing and delivery operations, and gives delivery agents the tools they need to manage assigned deliveries.

## What ParcelGo Does

* Customers can register, place orders, view the delivery charge before confirming, and track their orders.
* Admins can manage zones, pricing, COD charges, customers, orders, and delivery agents.
* Delivery agents can view their assigned orders and update delivery status.
* Delivery charges are calculated automatically based on package weight, dimensions, zones, order type, and payment method.
* Orders can be manually assigned by an admin or automatically assigned to a nearby available agent.
* Failed deliveries can be rescheduled by the customer.
* Every order status change is saved in the tracking history.
* Customers receive notifications when their delivery status changes.

## How Delivery Charges Are Calculated

The charge is calculated automatically when the customer enters the package details.

**1. Find the zones**

The pickup and drop pincodes are matched with the zones configured by the admin.

**2. Calculate volumetric weight**

```text
Volumetric Weight = L × B × H / 5000
```

**3. Find billable weight**

The higher value between actual weight and volumetric weight is used.

```text
Billable Weight = max(Actual Weight, Volumetric Weight)
```

**4. Find the applicable rate**

The system checks the configured rate card based on:

* B2B or B2C
* Intra-zone or Inter-zone
* Weight range

**5. Add COD charge**

For COD orders, the applicable COD surcharge is added.

The final amount is shown to the customer **before the order is confirmed**.

All rates are stored in the database, so admins can update them without changing the code.

## Delivery Flow

```text
Order Created
     ↓
Picked Up
     ↓
In Transit
     ↓
Out for Delivery
     ↓
Delivered
```

If a delivery fails:

```text
Out for Delivery
     ↓
Failed
     ↓
Customer Reschedules
     ↓
Agent Reassigned
     ↓
New Delivery Attempt
```

Every status change is recorded with the time and the person/system that made the change, so the tracking history is not overwritten.

## Agent Assignment

ParcelGo supports both manual and automatic assignment.

**Manual assignment:**
An admin can select an available delivery agent for an order.

**Automatic assignment:**
The system looks for available agents and selects a suitable nearby agent based on their location or zone.

## Tech Stack

* **Frontend:** React, TypeScript, Vite, Tailwind CSS
* **Backend:** Java 17, Spring Boot
* **Security:** Spring Security, JWT
* **Database:** PostgreSQL
* **ORM:** Spring Data JPA / Hibernate
* **Migrations:** Flyway
* **Email:** Spring Mail

## Project Structure

```text
ParcelGo/
├── backend/
│   └── src/
│       └── main/
│           ├── java/com/parcelgo/
│           │   ├── config/
│           │   ├── controller/
│           │   ├── dto/
│           │   ├── exception/
│           │   ├── model/
│           │   ├── repository/
│           │   ├── security/
│           │   └── service/
│           └── resources/
│               └── db/migration/
│
└── frontend/
    └── src/
        ├── components/
        ├── hooks/
        ├── lib/
        ├── pages/
        └── types/
```

## Getting Started

### Requirements

Make sure you have the following installed:

* Java 17+
* Maven 3.8+
* Node.js 18+
* PostgreSQL 14+

### 1. Clone the project

```bash
git clone https://github.com/your-username/parcelgo.git
cd parcelgo
```

### 2. Create the database

```sql
CREATE DATABASE parcelgo;
```

Flyway will create and update the required tables when the backend starts.

### 3. Configure environment variables

Create your `.env` file using the example provided:

```bash
cp .env.example .env
```

Add your database, JWT, and email configuration.

### 4. Start the backend

```bash
cd backend
mvn spring-boot:run
```

The backend will run at:

```text
http://localhost:8080
```

### 5. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

## Environment Variables

The complete list of variables is available in `.env.example`.

The main configuration includes:

```text
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
JWT_SECRET
MAIL_USERNAME
MAIL_PASSWORD
```

Email configuration is optional. If email credentials are not provided, the application can still run without sending emails.

## API Overview

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

### Admin

```text
GET /api/admin/dashboard
GET /api/admin/customers
```

## Testing

Run the backend tests with:

```bash
cd backend
mvn test
```

The tests cover important parts of the application such as:

* Rate calculation
* Volumetric weight
* B2B/B2C pricing
* Intra/inter-zone pricing
* COD charges
* Agent assignment

## Demo Accounts

| Role     | Email                                               | Password |
| -------- | --------------------------------------------------- | -------- |
| Admin    | [admin@parcelgo.in](mailto:admin@parcelgo.in)       | password |
| Agent    | [agent@parcelgo.in](mailto:agent@parcelgo.in)       | password |
| Customer | [customer@example.com](mailto:customer@example.com) | password |

## System Design

The detailed system design is available in [`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md).

It explains the main design decisions behind:

* Rate calculation
* Zone detection
* Agent assignment
* Order status tracking
* Failed delivery and rescheduling

## Live Demo

**Frontend:** Add deployed URL here

**Backend:** Add deployed API URL here

