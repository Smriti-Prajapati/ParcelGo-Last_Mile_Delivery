package com.parcelgo.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class ChargeCalculationResponse {
    private BigDecimal actualWeight;
    private BigDecimal volumetricWeight;
    private BigDecimal billableWeight;
    private String pickupZoneName;
    private String dropZoneName;
    private String zoneType;
    private BigDecimal baseCharge;
    private BigDecimal codSurcharge;
    private BigDecimal totalCharge;
    private String orderType;
    private String paymentType;
}
