# ParcelGo — Last-Mile Delivery Tracker

ParcelGo is a last-mile delivery management platform that handles the main steps of a delivery workflow — creating orders, calculating delivery charges, assigning agents, tracking orders, and notifying customers.

## Live Demo

[ParcelGo Live App](https://parcel-go-last-mile-delivery-rouge.vercel.app/)

## Features

* Customer registration, login, order placement, and tracking
* Admin order creation and management
* Delivery charge calculation before order confirmation
* B2B/B2C and Prepaid/COD order support
* Pincode-based pickup and drop-zone detection
* Admin management of zones, pincodes, rates, orders, and agents
* Separate INTRA-zone and INTER-zone pricing
* Configurable COD surcharge
* Manual and automatic agent assignment
* Agent availability tracking
* Complete order status and tracking history
* Failed-delivery rescheduling and agent reassignment
* Email and SMS delivery notifications
* Admin order filtering and status management

## Tech Stack

* **Frontend:** React, TypeScript, Vite, Tailwind CSS
* **Backend:** Java 17, Spring Boot
* **Database:** PostgreSQL
* **ORM:** Spring Data JPA / Hibernate
* **Authentication:** Spring Security, JWT
* **Database Migrations:** Flyway
* **Notifications:** Spring Mail, Fast2SMS

## Setup

### Requirements

* Java 17+
* Maven 3.8+
* Node.js 18+
* PostgreSQL 14+

### 1. Clone the Repository

```bash
git clone https://github.com/Smriti-Prajapati/ParcelGo-Last_Mile_Delivery.git
cd ParcelGo-Last_Mile_Delivery
```

### 2. Create the Database

Create a PostgreSQL database:

```sql
CREATE DATABASE parcelgo;
```

Flyway automatically creates the required tables when the backend starts.

### 3. Configure Environment Variables

Create a `.env` file using `.env.example` as a reference.

```env
DB_URL=your_database_url
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password

JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=86400000

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

FAST2SMS_API_KEY=your_fast2sms_api_key
```

Use your actual credentials only in your local environment.

**Never commit `.env` or real credentials to GitHub.**

The repository includes `.env.example` with placeholder values.

### 4. Run the Backend

```bash
cd backend
mvn spring-boot:run
```

Backend:

```text
http://localhost:8080
```

### 5. Run the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
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

GET /api/rates/cod
PUT /api/rates/cod/{id}
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

## Database Schema

ParcelGo uses PostgreSQL with Flyway migrations.

The main entities are:

* Users and roles
* Customers
* Delivery agents
* Orders
* Zones and zone areas
* Rate cards
* COD charges
* Assignments
* Tracking history
* Reschedules

Migration files are located at:

```text
backend/src/main/resources/db/migration/
```

The `orders` table stores the current order status, while `order_tracking` stores every status change along with its timestamp and actor.

Tracking history is preserved rather than overwritten, so the complete delivery journey remains available for reference.

## Rate Calculation

The delivery charge is calculated before the customer confirms the order.

### 1. Zone Detection

Pickup and drop pincodes are matched with the zones configured by the admin.

Shipments within the same zone are treated as **INTRA**, while shipments between different zones are treated as **INTER**.

### 2. Volumetric Weight

```text
Volumetric Weight = (L × B × H) / 5000
```

### 3. Billable Weight

```text
Billable Weight = max(Actual Weight, Volumetric Weight)
```

### 4. Rate Selection

The applicable rate is selected based on:

* B2B or B2C
* INTRA or INTER
* Billable weight range

### 5. COD Charges

For COD orders, the configured surcharge is added:

```text
Final Charge = Base Delivery Charge + COD Surcharge
```

Rates are stored in the database, allowing admins to update pricing without changing the application code.

## Order Tracking

Orders follow a controlled lifecycle:

```text
CONFIRMED
    ↓
PICKED_UP
    ↓
IN_TRANSIT
    ↓
OUT_FOR_DELIVERY
    ↓
DELIVERED
```

If delivery fails, the order can be rescheduled:

```text
OUT_FOR_DELIVERY
    ↓
FAILED
    ↓
RESCHEDULE
    ↓
CONFIRMED
```

The backend validates status transitions before updating an order. Each change is also recorded in the tracking history.

## Agent Assignment

Agents can be assigned manually by an admin or automatically by the system.

For automatic assignment, the system first checks available agents in the delivery zone. When location information is available, it can be used to select a suitable nearby agent.

Agent availability is updated when an order is assigned or released:

```text
AVAILABLE → BUSY
BUSY → AVAILABLE
```

This prevents the same agent from being assigned to multiple orders unnecessarily.

## Notifications

Email notifications are sent through **Spring Mail** when important order-status changes occur.

SMS notifications are integrated through **Fast2SMS** and require a configured `FAST2SMS_API_KEY` and sufficient Fast2SMS balance.

Notification failures do not overwrite the order status or tracking history.

## Testing

Run the backend tests with:

```bash
cd backend
mvn test
```

The tests cover key areas such as:

* Rate calculation
* Volumetric weight
* Billable weight
* B2B/B2C pricing
* INTRA/INTER pricing
* COD charges
* Agent assignment
* Order workflow

## Project Structure

```text
ParcelGo-Last_Mile_Delivery/
├── backend/
│   └── src/
│       └── main/
│           ├── java/
│           └── resources/
│               └── db/
│                   └── migration/
├── frontend/
│   ├── src/
│   └── public/
├── .env.example
└── README.md
```

## Notes

* Configure all database and external-service credentials through environment variables.
* Do not commit `.env` or API keys to the repository.
* Make sure PostgreSQL is running before starting the backend.
* Fast2SMS notifications require a valid API key and sufficient account balance.
* Flyway applies database migrations automatically when the backend starts.


```

## Developed By

**Smriti Prajapati**