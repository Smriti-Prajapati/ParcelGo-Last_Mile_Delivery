package com.parcelgo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "zone_areas")
@Getter @Setter @NoArgsConstructor
public class ZoneArea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id", nullable = false)
    @JsonIgnoreProperties({"areas", "hibernateLazyInitializer"})
    private Zone zone;

    @Column(nullable = false, length = 20)
    private String pincode;

    @Column(name = "area_name", nullable = false, length = 100)
    private String areaName;
}
