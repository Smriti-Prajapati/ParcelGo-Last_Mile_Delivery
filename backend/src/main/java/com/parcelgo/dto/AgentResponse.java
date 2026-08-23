package com.parcelgo.dto;

import com.parcelgo.model.DeliveryAgent;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class AgentResponse {
    private final Long id;
    private final Long userId;
    private final String name;
    private final String email;
    private final String phone;
    private final Long zoneId;
    private final String zoneName;
    private final BigDecimal latitude;
    private final BigDecimal longitude;
    private final String availability;
    private final String vehicleNumber;

    public AgentResponse(DeliveryAgent agent) {
        this.id = agent.getId();
        this.userId = agent.getUser().getId();
        this.name = agent.getUser().getName();
        this.email = agent.getUser().getEmail();
        this.phone = agent.getUser().getPhone();
        this.zoneId = agent.getZone() != null ? agent.getZone().getId() : null;
        this.zoneName = agent.getZone() != null ? agent.getZone().getName() : null;
        this.latitude = agent.getLatitude();
        this.longitude = agent.getLongitude();
        this.availability = agent.getAvailability().name();
        this.vehicleNumber = agent.getVehicleNumber();
    }
}
