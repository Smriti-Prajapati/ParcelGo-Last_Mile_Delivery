package com.parcelgo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Getter @Setter @NoArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tracking_id", nullable = false, unique = true, length = 20)
    private String trackingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private DeliveryAgent agent;

    @Column(name = "pickup_address", nullable = false, columnDefinition = "TEXT")
    private String pickupAddress;

    @Column(name = "pickup_pincode", nullable = false, length = 20)
    private String pickupPincode;

    @Column(name = "drop_address", nullable = false, columnDefinition = "TEXT")
    private String dropAddress;

    @Column(name = "drop_pincode", nullable = false, length = 20)
    private String dropPincode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_zone_id")
    private Zone pickupZone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drop_zone_id")
    private Zone dropZone;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal length;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal breadth;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal height;

    @Column(name = "actual_weight", nullable = false, precision = 8, scale = 2)
    private BigDecimal actualWeight;

    @Column(name = "volumetric_weight", nullable = false, precision = 8, scale = 2)
    private BigDecimal volumetricWeight;

    @Column(name = "billable_weight", nullable = false, precision = 8, scale = 2)
    private BigDecimal billableWeight;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false, length = 5)
    private OrderType orderType;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false, length = 10)
    private PaymentType paymentType;

    @Column(name = "base_charge", nullable = false, precision = 10, scale = 2)
    private BigDecimal baseCharge;

    @Column(name = "cod_surcharge", nullable = false, precision = 10, scale = 2)
    private BigDecimal codSurcharge = BigDecimal.ZERO;

    @Column(name = "total_charge", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCharge;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private OrderStatus status = OrderStatus.CONFIRMED;

    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum OrderType { B2B, B2C }
    public enum PaymentType { PREPAID, COD }
    public enum OrderStatus {
        CONFIRMED, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, FAILED
    }
}
