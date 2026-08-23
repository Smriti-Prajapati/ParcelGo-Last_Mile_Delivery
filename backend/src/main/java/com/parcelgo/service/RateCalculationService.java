package com.parcelgo.service;

import com.parcelgo.dto.ChargeCalculationResponse;
import com.parcelgo.dto.OrderCreateRequest;
import com.parcelgo.exception.AppException;
import com.parcelgo.model.*;
import com.parcelgo.repository.CodSurchargeRepository;
import com.parcelgo.repository.RateCardRepository;
import com.parcelgo.repository.ZoneAreaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.transaction.annotation.Transactional;

@Service
public class RateCalculationService {

    private final ZoneAreaRepository zoneAreaRepository;
    private final RateCardRepository rateCardRepository;
    private final CodSurchargeRepository codSurchargeRepository;

    public RateCalculationService(ZoneAreaRepository zoneAreaRepository,
                                   RateCardRepository rateCardRepository,
                                   CodSurchargeRepository codSurchargeRepository) {
        this.zoneAreaRepository = zoneAreaRepository;
        this.rateCardRepository = rateCardRepository;
        this.codSurchargeRepository = codSurchargeRepository;
    }

    @Transactional(readOnly = true)
    public ChargeCalculationResponse calculate(OrderCreateRequest request) {
        Zone pickupZone = detectZone(request.getPickupPincode());
        Zone dropZone = detectZone(request.getDropPincode());

        BigDecimal volumetricWeight = request.getLength()
            .multiply(request.getBreadth())
            .multiply(request.getHeight())
            .divide(BigDecimal.valueOf(5000), 2, RoundingMode.HALF_UP);

        BigDecimal billableWeight = request.getActualWeight().max(volumetricWeight);

        RateCard.OrderType orderType = parseOrderType(request.getOrderType());
        Order.PaymentType paymentType = parsePaymentType(request.getPaymentType());

        boolean isIntraZone = pickupZone.getId().equals(dropZone.getId());
        RateCard.ZoneType zoneType = isIntraZone ? RateCard.ZoneType.INTRA : RateCard.ZoneType.INTER;

        RateCard rateCard = rateCardRepository
            .findFirstByOrderTypeAndZoneTypeAndActiveTrueAndMinWeightLessThanEqualAndMaxWeightGreaterThan(
                orderType, zoneType, billableWeight, billableWeight
            )
            .orElseThrow(() -> new AppException(
                "No rate card configured for " + orderType + " " + zoneType + " at " + billableWeight + " kg",
                HttpStatus.UNPROCESSABLE_ENTITY
            ));

        BigDecimal baseCharge = rateCard.getBaseCharge()
            .add(rateCard.getRatePerKg().multiply(billableWeight))
            .setScale(2, RoundingMode.HALF_UP);

        BigDecimal codSurcharge = BigDecimal.ZERO;
        if (paymentType == Order.PaymentType.COD) {
            CodSurcharge.OrderType codOrderType = orderType == RateCard.OrderType.B2B
                ? CodSurcharge.OrderType.B2B
                : CodSurcharge.OrderType.B2C;
            codSurcharge = codSurchargeRepository.findByOrderType(codOrderType)
                .map(CodSurcharge::getSurchargeAmount)
                .orElse(BigDecimal.ZERO);
        }

        BigDecimal totalCharge = baseCharge.add(codSurcharge);

        return ChargeCalculationResponse.builder()
            .actualWeight(request.getActualWeight())
            .volumetricWeight(volumetricWeight)
            .billableWeight(billableWeight)
            .pickupZoneName(pickupZone.getName())
            .dropZoneName(dropZone.getName())
            .zoneType(zoneType.name())
            .baseCharge(baseCharge)
            .codSurcharge(codSurcharge)
            .totalCharge(totalCharge)
            .orderType(orderType.name())
            .paymentType(paymentType.name())
            .build();
    }

    @Transactional(readOnly = true)
    public Zone detectZone(String pincode) {
        return zoneAreaRepository.findByPincode(pincode)
            .map(ZoneArea::getZone)
            .orElseThrow(() -> new AppException(
                "No zone configured for pincode " + pincode + ". Please contact admin.",
                HttpStatus.UNPROCESSABLE_ENTITY
            ));
    }

    private RateCard.OrderType parseOrderType(String value) {
        try {
            return RateCard.OrderType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException("Invalid order type: " + value + ". Must be B2B or B2C", HttpStatus.BAD_REQUEST);
        }
    }

    private Order.PaymentType parsePaymentType(String value) {
        try {
            return Order.PaymentType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException("Invalid payment type: " + value + ". Must be PREPAID or COD", HttpStatus.BAD_REQUEST);
        }
    }
}
