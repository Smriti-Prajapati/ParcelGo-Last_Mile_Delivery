package com.parcelgo.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
public class RescheduleRequest {

    @NotNull(message = "New delivery date is required")
    @Future(message = "Reschedule date must be in the future")
    private LocalDate newDate;

    private String reason;
}
