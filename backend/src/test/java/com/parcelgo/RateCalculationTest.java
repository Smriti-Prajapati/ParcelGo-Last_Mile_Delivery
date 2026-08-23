package com.parcelgo;

import com.parcelgo.dto.ChargeCalculationResponse;
import com.parcelgo.dto.OrderCreateRequest;
import com.parcelgo.exception.AppException;
import com.parcelgo.model.*;
import com.parcelgo.repository.CodSurchargeRepository;
import com.parcelgo.repository.RateCardRepository;
import com.parcelgo.repository.ZoneAreaRepository;
import com.parcelgo.service.RateCalculationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RateCalculationTest {

    @Mock private ZoneAreaRepository zoneAreaRepository;
    @Mock private RateCardRepository rateCardRepository;
    @Mock private CodSurchargeRepository codSurchargeRepository;

    private RateCalculationService service;

    private Zone zoneA;
    private Zone zoneB;

    @BeforeEach
    void setUp() {
        service = new RateCalculationService(zoneAreaRepository, rateCardRepository, codSurchargeRepository);

        zoneA = new Zone();
        zoneA.setId(1L);
        zoneA.setName("Zone A");

        zoneB = new Zone();
        zoneB.setId(2L);
        zoneB.setName("Zone B");
    }

    @Test
    void volumetricWeightCalculation() {
        // 30 x 20 x 15 / 5000 = 1.8
        BigDecimal result = new BigDecimal("30")
            .multiply(new BigDecimal("20"))
            .multiply(new BigDecimal("15"))
            .divide(BigDecimal.valueOf(5000), 2, java.math.RoundingMode.HALF_UP);
        assertThat(result).isEqualByComparingTo("1.80");
    }

    @Test
    void billableWeightUsesActualWhenHigher() {
        BigDecimal actual = new BigDecimal("5.0");
        BigDecimal volumetric = new BigDecimal("1.8");
        assertThat(actual.max(volumetric)).isEqualByComparingTo("5.0");
    }

    @Test
    void billableWeightUsesVolumetricWhenHigher() {
        BigDecimal actual = new BigDecimal("1.0");
        BigDecimal volumetric = new BigDecimal("3.6");
        assertThat(actual.max(volumetric)).isEqualByComparingTo("3.6");
    }

    @Test
    void b2cIntraZonePrepaidCharge() {
        ZoneArea areaA = new ZoneArea(); areaA.setZone(zoneA);
        ZoneArea areaB = new ZoneArea(); areaB.setZone(zoneA);
        when(zoneAreaRepository.findByPincode("462001")).thenReturn(Optional.of(areaA));
        when(zoneAreaRepository.findByPincode("462002")).thenReturn(Optional.of(areaB));

        RateCard card = new RateCard();
        card.setBaseCharge(new BigDecimal("40"));
        card.setRatePerKg(new BigDecimal("25"));
        when(rateCardRepository
            .findFirstByOrderTypeAndZoneTypeAndActiveTrueAndMinWeightLessThanEqualAndMaxWeightGreaterThan(
                eq(RateCard.OrderType.B2C), eq(RateCard.ZoneType.INTRA), any(), any()))
            .thenReturn(Optional.of(card));

        OrderCreateRequest req = buildRequest("462001", "462002", "2", "5", "4", "2.4", "B2C", "PREPAID");
        ChargeCalculationResponse resp = service.calculate(req);

        assertThat(resp.getZoneType()).isEqualTo("INTRA");
        assertThat(resp.getCodSurcharge()).isEqualByComparingTo("0");
        assertThat(resp.getTotalCharge()).isEqualByComparingTo(resp.getBaseCharge());
    }

    @Test
    void b2cInterZoneCodAddsCorrectSurcharge() {
        ZoneArea areaA = new ZoneArea(); areaA.setZone(zoneA);
        ZoneArea areaB = new ZoneArea(); areaB.setZone(zoneB);
        when(zoneAreaRepository.findByPincode("462001")).thenReturn(Optional.of(areaA));
        when(zoneAreaRepository.findByPincode("452001")).thenReturn(Optional.of(areaB));

        RateCard card = new RateCard();
        card.setBaseCharge(new BigDecimal("80"));
        card.setRatePerKg(new BigDecimal("50"));
        when(rateCardRepository
            .findFirstByOrderTypeAndZoneTypeAndActiveTrueAndMinWeightLessThanEqualAndMaxWeightGreaterThan(
                eq(RateCard.OrderType.B2C), eq(RateCard.ZoneType.INTER), any(), any()))
            .thenReturn(Optional.of(card));

        CodSurcharge cod = new CodSurcharge();
        cod.setSurchargeAmount(new BigDecimal("35"));
        when(codSurchargeRepository.findByOrderType(CodSurcharge.OrderType.B2C))
            .thenReturn(Optional.of(cod));

        OrderCreateRequest req = buildRequest("462001", "452001", "2", "5", "4", "2.4", "B2C", "COD");
        ChargeCalculationResponse resp = service.calculate(req);

        assertThat(resp.getZoneType()).isEqualTo("INTER");
        assertThat(resp.getCodSurcharge()).isEqualByComparingTo("35");
        assertThat(resp.getTotalCharge()).isEqualByComparingTo(resp.getBaseCharge().add(new BigDecimal("35")));
    }

    @Test
    void b2bIntraZonePrepaid() {
        ZoneArea area = new ZoneArea(); area.setZone(zoneA);
        when(zoneAreaRepository.findByPincode("462001")).thenReturn(Optional.of(area));
        when(zoneAreaRepository.findByPincode("462002")).thenReturn(Optional.of(area));

        RateCard card = new RateCard();
        card.setBaseCharge(new BigDecimal("30"));
        card.setRatePerKg(new BigDecimal("15"));
        when(rateCardRepository
            .findFirstByOrderTypeAndZoneTypeAndActiveTrueAndMinWeightLessThanEqualAndMaxWeightGreaterThan(
                eq(RateCard.OrderType.B2B), eq(RateCard.ZoneType.INTRA), any(), any()))
            .thenReturn(Optional.of(card));

        OrderCreateRequest req = buildRequest("462001", "462002", "10", "10", "10", "5.0", "B2B", "PREPAID");
        ChargeCalculationResponse resp = service.calculate(req);

        assertThat(resp.getOrderType()).isEqualTo("B2B");
        assertThat(resp.getZoneType()).isEqualTo("INTRA");
        assertThat(resp.getCodSurcharge()).isEqualByComparingTo("0");
    }

    @Test
    void unknownPincodeThrowsException() {
        when(zoneAreaRepository.findByPincode(any())).thenReturn(Optional.empty());
        OrderCreateRequest req = buildRequest("999999", "462001", "1", "1", "1", "1.0", "B2C", "PREPAID");
        assertThatThrownBy(() -> service.calculate(req))
            .isInstanceOf(AppException.class)
            .hasMessageContaining("No zone configured for pincode");
    }

    @Test
    void noRateCardThrowsException() {
        ZoneArea area = new ZoneArea(); area.setZone(zoneA);
        when(zoneAreaRepository.findByPincode(any())).thenReturn(Optional.of(area));
        when(rateCardRepository
            .findFirstByOrderTypeAndZoneTypeAndActiveTrueAndMinWeightLessThanEqualAndMaxWeightGreaterThan(
                any(), any(), any(), any()))
            .thenReturn(Optional.empty());

        OrderCreateRequest req = buildRequest("462001", "462002", "1", "1", "1", "1.0", "B2C", "PREPAID");
        assertThatThrownBy(() -> service.calculate(req))
            .isInstanceOf(AppException.class)
            .hasMessageContaining("No rate card configured");
    }

    private OrderCreateRequest buildRequest(String pickupPin, String dropPin,
                                             String l, String b, String h,
                                             String weight, String orderType, String paymentType) {
        OrderCreateRequest req = new OrderCreateRequest();
        req.setPickupAddress("Test Pickup");
        req.setPickupPincode(pickupPin);
        req.setDropAddress("Test Drop");
        req.setDropPincode(dropPin);
        req.setLength(new BigDecimal(l));
        req.setBreadth(new BigDecimal(b));
        req.setHeight(new BigDecimal(h));
        req.setActualWeight(new BigDecimal(weight));
        req.setOrderType(orderType);
        req.setPaymentType(paymentType);
        return req;
    }
}
