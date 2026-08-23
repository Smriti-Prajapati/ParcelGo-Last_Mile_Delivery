package com.parcelgo.dto;

import com.parcelgo.model.Order;
import com.parcelgo.model.OrderTracking;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class TrackingEventDto {
    private final Long id;
    private final Long orderId;
    private final String status;
    private final Long actorId;
    private final String actorName;
    private final String notes;
    private final LocalDateTime createdAt;

    public TrackingEventDto(OrderTracking t) {
        this.id = t.getId();
        this.orderId = t.getOrder().getId();
        this.status = t.getStatus().name();
        this.actorId = t.getActorId();
        this.actorName = t.getActorName();
        this.notes = t.getNotes();
        this.createdAt = t.getCreatedAt();
    }
}
