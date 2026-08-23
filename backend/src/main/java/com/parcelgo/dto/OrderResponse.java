package com.parcelgo.dto;

import com.parcelgo.model.Order;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class OrderResponse {
    private Long id;
    private String trackingId;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private Long agentId;
    private String agentName;
    private String agentPhone;
    private String pickupAddress;
    private String pickupPincode;
    private String dropAddress;
    private String dropPincode;
    private String pickupZoneName;
    private String dropZoneName;
    private BigDecimal length;
    private BigDecimal breadth;
    private BigDecimal height;
    private BigDecimal actualWeight;
    private BigDecimal volumetricWeight;
    private BigDecimal billableWeight;
    private String orderType;
    private String paymentType;
    private BigDecimal baseCharge;
    private BigDecimal codSurcharge;
    private BigDecimal totalCharge;
    private String status;
    private LocalDate scheduledDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static OrderResponse from(Order order) {
        return OrderResponse.builder()
            .id(order.getId())
            .trackingId(order.getTrackingId())
            .customerId(order.getCustomer().getId())
            .customerName(order.getCustomer().getName())
            .customerEmail(order.getCustomer().getEmail())
            .agentId(order.getAgent() != null ? order.getAgent().getId() : null)
            .agentName(order.getAgent() != null ? order.getAgent().getUser().getName() : null)
            .agentPhone(order.getAgent() != null ? order.getAgent().getUser().getPhone() : null)
            .pickupAddress(order.getPickupAddress())
            .pickupPincode(order.getPickupPincode())
            .dropAddress(order.getDropAddress())
            .dropPincode(order.getDropPincode())
            .pickupZoneName(order.getPickupZone() != null ? order.getPickupZone().getName() : "Unknown")
            .dropZoneName(order.getDropZone() != null ? order.getDropZone().getName() : "Unknown")
            .length(order.getLength())
            .breadth(order.getBreadth())
            .height(order.getHeight())
            .actualWeight(order.getActualWeight())
            .volumetricWeight(order.getVolumetricWeight())
            .billableWeight(order.getBillableWeight())
            .orderType(order.getOrderType().name())
            .paymentType(order.getPaymentType().name())
            .baseCharge(order.getBaseCharge())
            .codSurcharge(order.getCodSurcharge())
            .totalCharge(order.getTotalCharge())
            .status(order.getStatus().name())
            .scheduledDate(order.getScheduledDate())
            .notes(order.getNotes())
            .createdAt(order.getCreatedAt())
            .updatedAt(order.getUpdatedAt())
            .build();
    }
}
