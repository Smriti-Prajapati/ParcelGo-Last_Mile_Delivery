# ParcelGo — Last-Mile Delivery Tracker

ParcelGo is a delivery management platform for handling orders, delivery pricing, agent assignment, and order tracking.

## 🚀 Live Demo

**Frontend:** [ParcelGo Live App](https://parcel-go-last-mile-delivery.vercel.app/)

**Backend:** [ParcelGo API](https://parcelgo-backend-8z59.onrender.com/)

## Features

* Customer registration and order placement
* Automatic delivery charge calculation
* B2B/B2C and prepaid/COD pricing
* Pickup and drop zone detection
* Manual and automatic delivery-agent assignment
* Order tracking with complete status history
* Failed-delivery rescheduling
* Admin management of zones, rates, orders, and agents
* Email and SMS notifications for delivery status changes

## Tech Stack

* **Frontend:** React, TypeScript, Vite, Tailwind CSS
* **Backend:** Java 17, Spring Boot
* **Database:** PostgreSQL
* **ORM:** Spring Data JPA / Hibernate
* **Security:** Spring Security, JWT
* **Migrations:** Flyway
* **Notifications:** Spring Mail, Fast2SMS

## Setup

### Requirements

* Java 17+
* Maven 3.8+
* Node.js 18+
* PostgreSQL 14+

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/parcelgo.git
cd parcelgo
```

### 2. Create the Database

```sql
CREATE DATABASE parcelgo;
```

Flyway runs the required database migrations automatically when the backend starts.

### 3. Environment Variables

Create a `.env` file using `.env.example`.

**`.env.example`**

```env
DATABASE_URL=your_database_url
DATABASE_USERNAME=your_database_username
DATABASE_PASSWORD=your_database_password

JWT_SECRET=your_jwt_secret

MAIL_USERNAME=your_email
MAIL_PASSWORD=your_email_password

FAST2SMS_API_KEY=your_fast2sms_api_key
```

Replace the placeholder values with your actual credentials in your local `.env` file.

**Never commit `.env` or real credentials to GitHub.**

### 4. Run the Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs at:

```text
http://localhost:8080
```

### 5. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

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

ParcelGo uses PostgreSQL with Flyway for database migrations.

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

### 1. Zone Detection

The pickup and drop pincodes are matched with the zones configured by the admin.

### 2. Volumetric Weight

```text
Volumetric Weight = L × B × H / 5000
```

### 3. Billable Weight

The higher value between actual weight and volumetric weight is used.

```text
Billable Weight = max(Actual Weight, Volumetric Weight)
```

### 4. Apply Rate

The applicable rate is selected based on:

* B2B or B2C
* Intra-zone or Inter-zone
* Weight range

### 5. COD Charge

For COD orders, the configured COD surcharge is added.

```text
Final Charge = Base Delivery Charge + COD Surcharge
```

All rates are stored in the database and can be updated by the admin without changing the application code.

## Notifications

### Email

Email notifications are implemented using Spring Mail and are sent to customers when their order status changes.

### SMS

SMS notifications are implemented using the Fast2SMS API.

The SMS integration is ready but requires an active Fast2SMS account with sufficient balance and a configured `FAST2SMS_API_KEY`.

Email works independently, so customers can still receive email notifications even when SMS is not activated.

## Testing

Run the backend tests with:

```bash
cd backend
mvn test
```

Tests cover key functionality including:

* Rate calculation
* Volumetric weight
* B2B/B2C pricing
* Intra/inter-zone pricing
* COD charges
* Agent assignment
