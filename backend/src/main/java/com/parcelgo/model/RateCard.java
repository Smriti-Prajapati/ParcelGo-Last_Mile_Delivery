package com.parcelgo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rate_cards")
@Getter @Setter @NoArgsConstructor
public class RateCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false, length = 5)
    private OrderType orderType;

    @Enumerated(EnumType.STRING)
    @Column(name = "zone_type", nullable = false, length = 10)
    private ZoneType zoneType;

    @Column(name = "min_weight", nullable = false, precision = 8, scale = 2)
    private BigDecimal minWeight;

    @Column(name = "max_weight", nullable = false, precision = 8, scale = 2)
    private BigDecimal maxWeight;

    @Column(name = "rate_per_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal ratePerKg;

    @Column(name = "base_charge", nullable = false, precision = 10, scale = 2)
    private BigDecimal baseCharge = BigDecimal.ZERO;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum OrderType { B2B, B2C }
    public enum ZoneType { INTRA, INTER }
}
