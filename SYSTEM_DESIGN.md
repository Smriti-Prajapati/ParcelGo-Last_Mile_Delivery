# ParcelGo — System Design

## Rate Calculation Engine

The rate engine is the core of the platform and is fully database-driven with no hardcoded values.

**Flow:**

1. The customer provides pickup pincode, drop pincode, package dimensions, actual weight, order type (B2B/B2C), and payment type.
2. The system looks up each pincode in the `zone_areas` table to resolve the pickup zone and drop zone. If a pincode isn't mapped, the order is rejected with a clear error — no silent failures.
3. Volumetric weight is computed as `L × B × H ÷ 5000`. This is the courier industry standard divisor for converting dimensional weight to kg.
4. Billable weight = `max(actual_weight, volumetric_weight)`. The customer is billed on whichever is higher.
5. Zone type is INTRA if pickup and drop zones share the same zone ID, INTER otherwise.
6. The system queries `rate_cards` for the matching combination of `order_type`, `zone_type`, and a weight range that contains the billable weight. The query uses `min_weight <= billable_weight < max_weight` to find the right slab.
7. Base charge = `base_charge + (rate_per_kg × billable_weight)`.
8. If payment type is COD, the system queries `cod_surcharges` for the matching order type and adds the configured amount.
9. The full breakdown is returned to the customer before confirmation — actual weight, volumetric weight, billable weight, zone names, zone type, base charge, COD surcharge, and total.

Changing a rate in the admin panel takes effect immediately for all future orders. There is no caching or code change required.

## Zone Detection

Zones are geographic groupings. Each zone has one or more area/pincode mappings stored in `zone_areas`. Zone detection is a simple lookup: given a pincode, find the matching row and return its parent zone.

This approach is practical and explainable. The admin can add new pincodes to zones at any time through the UI without touching code or redeploying. For a production system, this could be extended to support city names, lat/lon bounding boxes, or integration with a geocoding API — but for the assessment scope, pincode-based lookup is accurate, testable, and fast.

If a pincode is not found, the system returns a specific error telling the customer to contact support, rather than assigning a default zone silently.

## Auto-Assignment Logic

When an order needs an agent (either triggered manually by admin or automatically), the assignment service runs:

1. Look for available agents (availability = AVAILABLE) whose home zone matches the order's drop zone. Agents assigned to the delivery zone are the best fit since they're already in the area.
2. If no agents are available in the drop zone, fall back to any available agent across all zones.
3. Among the candidates, the current implementation selects by lowest ID as a deterministic tiebreaker. When agents have GPS coordinates stored, the haversine distance formula is used to pick the geographically closest agent.
4. The selected agent is assigned to the order and their availability is set to BUSY.

This is intentionally straightforward. The assignment result is deterministic and auditable — you can always explain why a particular agent was chosen. A more complex routing engine (round-robin, load balancing, ETA prediction) could be layered on top of this interface without changing the order or agent models.

## Order Status Lifecycle

Status transitions are strictly enforced:

```
CONFIRMED → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
                                                       ↘ FAILED → CONFIRMED (reschedule)
```

Each transition is validated against a predefined map. Jumping from CONFIRMED to DELIVERED directly, for example, is rejected. This prevents data integrity issues where tracking history would be misleading.

Every status change writes an immutable record to `order_tracking` with the new status, the actor's ID and name, optional notes, and a server-side timestamp. The current status is stored on the `orders` table for fast query access, but the source of truth for the full history is always `order_tracking`. Records in this table are never updated or deleted.

## Failed Delivery Handling

When an agent marks an order as FAILED:

1. Order status is set to FAILED and a tracking event is recorded.
2. The customer receives an email notification explaining the failure.
3. The customer opens the order detail page and picks a new delivery date using a date picker (future dates only).
4. A row is inserted into `reschedules` capturing the original date, the new date, and an optional reason. This history is preserved even after the order is re-confirmed.
5. The previous agent is released (availability reset to AVAILABLE) and the order is set back to CONFIRMED with the new scheduled date.
6. The system immediately attempts auto-assignment for the rescheduled order. If no agent is available at that moment, the order stays unassigned and the admin can assign one later.
7. The tracking timeline shows the full history including the failed attempt — nothing is erased.

This design ensures the failed delivery is fully auditable, the customer has a clear path to reschedule, and the agent pool is kept accurate.
