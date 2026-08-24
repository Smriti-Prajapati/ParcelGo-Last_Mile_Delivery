# ParcelGo — Last-Mile Delivery Tracker

ParcelGo is a delivery management platform built to handle the complete last-mile delivery process — from placing an order and calculating its delivery charge to assigning an agent and tracking the delivery.

## Live Demo

[ParcelGo Live App](https://parcel-go-last-mile-delivery-rouge.vercel.app)

## Features

* Customers can register, place orders, and track deliveries.
* Delivery charges are calculated automatically before an order is confirmed.
* Supports B2B/B2C and prepaid/COD orders.
* Pickup and drop locations are mapped to configured zones.
* Admins can assign agents manually or use automatic assignment.
* Customers can view the complete tracking history of an order.
* Failed deliveries can be rescheduled for another attempt.
* Admins can manage zones, rates, orders, customers, and delivery agents.
* Customers receive email and SMS notifications when the delivery status changes.

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

Make sure you have:

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

Flyway will create and update the required tables when the backend starts.

### 3. Configure Environment Variables

Create a `.env` file based on `.env.example`.

```env
DATABASE_URL=your_database_url
DATABASE_USERNAME=your_database_username
DATABASE_PASSWORD=your_database_password

JWT_SECRET=your_jwt_secret

MAIL_USERNAME=your_email
MAIL_PASSWORD=your_email_password

FAST2SMS_API_KEY=your_fast2sms_api_key
```

Use your actual credentials in the local `.env` file.

**Do not commit `.env` or any real credentials to GitHub.**

### 4. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

The backend will start at:

`http://localhost:8080`

### 5. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at:

`http://localhost:5173`

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

ParcelGo uses PostgreSQL, with Flyway handling database migrations.

The database covers the main parts of the application:

* Users and roles
* Customers
* Delivery agents
* Orders
* Zones
* Rate cards
* COD charges
* Tracking history
* Delivery assignments

Migration files can be found in:

```text
backend/src/main/resources/db/migration/
```

## Rate Calculation

The delivery charge is worked out when the customer enters the package details and is shown before the order is confirmed.

### 1. Find the Zones

The pickup and drop pincodes are matched with the zones configured by the admin.

### 2. Calculate Volumetric Weight

```text
Volumetric Weight = (L × B × H) / 5000
```

### 3. Find the Billable Weight

The system uses whichever is higher:

```text
Billable Weight = max(Actual Weight, Volumetric Weight)
```

### 4. Select the Rate

The rate card is selected based on:

* B2B or B2C
* Intra-zone or Inter-zone
* Weight range

### 5. Add COD Charge

For COD orders, the configured COD surcharge is added to the delivery charge.

```text
Final Charge = Base Delivery Charge + COD Surcharge
```

Rates are stored in the database, so admins can update them without changing the application code.

## Notifications

### Email

Email notifications are handled through Spring Mail. Customers receive an email when their order status changes.

### SMS

SMS notifications are integrated using the Fast2SMS API.

The integration is already implemented. To enable SMS sending, configure `FAST2SMS_API_KEY` and maintain sufficient balance in the Fast2SMS account.

Email notifications work independently of SMS.

## Testing

Run the backend tests with:

```bash
cd backend
mvn test
```

The tests cover the main delivery and pricing logic, including:

* Rate calculation
* Volumetric weight
* B2B/B2C pricing
* Intra/inter-zone pricing
* COD charges
* Agent assignment
