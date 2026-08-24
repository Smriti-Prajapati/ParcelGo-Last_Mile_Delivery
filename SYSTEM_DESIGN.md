# ParcelGo — System Design

ParcelGo is designed around four main parts of the delivery process: pricing, zone detection, agent assignment, and order tracking. The system uses a Spring Boot backend with PostgreSQL, while the frontend communicates with the backend through REST APIs.

![ParcelGo System Architecture](./docs/parcelgo-system-architecture.jpeg)

## Rate Calculation Engine

The rate calculation is database-driven, so pricing can be changed by an admin without modifying the application code.

The calculation works as follows:

1. The customer enters the pickup and drop pincodes, package dimensions, actual weight, order type (B2B/B2C), and payment type.
2. The system looks up both pincodes in `zone_areas` to find their respective zones. If a pincode is not configured, the order cannot proceed.
3. Volumetric weight is calculated using:

**Volumetric Weight = (L × B × H) / 5000**

4. The higher of actual and volumetric weight becomes the billable weight.

```text
Billable Weight = max(Actual Weight, Volumetric Weight)

```

5. The system determines whether the shipment is **INTRA** or **INTER** zone.
6. It then finds the matching rate card using the order type, zone type, and weight range.
7. The base delivery charge is calculated from the configured base charge and per-kg rate.
8. For COD orders, the applicable COD surcharge is added.
9. The complete calculation is returned before the customer confirms the order.

This keeps pricing flexible because admins can update rate cards directly from the application.

## Zone Detection

ParcelGo uses pincode-based zone detection. Each zone can contain multiple pincodes stored in the `zone_areas` table.

When an order is created, the pickup and drop pincodes are looked up to determine their zones. The two zones are then used to decide whether the shipment is intra-zone or inter-zone.

This approach is simple, fast, and easy to maintain for the current scope. New pincodes can be added by the admin without changing the code.

## Auto-Assignment

When an order needs a delivery agent, the assignment service first looks for agents who are currently available and belong to the order's delivery zone.

If no suitable agent is available in that zone, the system falls back to other available agents.

When location data is available, the system can use the agent's current location to select the nearest suitable agent. The selected agent is then assigned to the order and marked as `BUSY`.

The assignment logic is kept separate from the order service so it can be extended later with features such as load balancing, ETA, or more advanced location-based matching.

## Order Status & Tracking

ParcelGo follows a controlled order lifecycle:

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

If delivery fails:

```text
OUT_FOR_DELIVERY
    ↓
FAILED
    ↓
RESCHEDULE
    ↓
CONFIRMED

```

Status changes are validated before being saved, preventing invalid transitions such as directly moving an order from `CONFIRMED` to `DELIVERED`.

Every status change is stored in the `order_tracking` table with the status, actor, notes, and timestamp. The current status is also stored in the `orders` table for quick access, while `order_tracking` keeps the complete history.

Tracking records are not overwritten, so the full delivery journey remains available.

## Failed Delivery Handling

When an agent marks an order as `FAILED`, the customer is notified by email and can choose a new delivery date.

The reschedule is stored with the original date, new date, and optional reason. The previous agent is released and the order is moved back to `CONFIRMED`.

The system then tries to assign an available agent again. If none is available, the order remains unassigned so an admin can assign one later.

The failed attempt is never removed from the tracking history, keeping the entire delivery process auditable. 