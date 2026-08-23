package com.parcelgo.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter @Setter
public class OrderCreateRequest {

    @NotBlank(message = "Pickup address is required")
    private String pickupAddress;

    @NotBlank(message = "Pickup pincode is required")
    @Pattern(regexp = "\\d{6}", message = "Pincode must be 6 digits")
    private String pickupPincode;

    @NotBlank(message = "Drop address is required")
    private String dropAddress;

    @NotBlank(message = "Drop pincode is required")
    @Pattern(regexp = "\\d{6}", message = "Pincode must be 6 digits")
    private String dropPincode;

    @NotNull(message = "Length is required")
    @DecimalMin(value = "0.1", message = "Length must be greater than 0")
    private BigDecimal length;

    @NotNull(message = "Breadth is required")
    @DecimalMin(value = "0.1", message = "Breadth must be greater than 0")
    private BigDecimal breadth;

    @NotNull(message = "Height is required")
    @DecimalMin(value = "0.1", message = "Height must be greater than 0")
    private BigDecimal height;

    @NotNull(message = "Actual weight is required")
    @DecimalMin(value = "0.1", message = "Weight must be greater than 0")
    private BigDecimal actualWeight;

    @NotNull(message = "Order type is required")
    private String orderType;

    @NotNull(message = "Payment type is required")
    private String paymentType;

    private String notes;

    private Long customerId;
}
