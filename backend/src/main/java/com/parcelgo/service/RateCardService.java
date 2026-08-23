package com.parcelgo.service;

import com.parcelgo.exception.AppException;
import com.parcelgo.model.CodSurcharge;
import com.parcelgo.model.RateCard;
import com.parcelgo.repository.CodSurchargeRepository;
import com.parcelgo.repository.RateCardRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class RateCardService {

    private final RateCardRepository rateCardRepository;
    private final CodSurchargeRepository codSurchargeRepository;

    public RateCardService(RateCardRepository rateCardRepository, CodSurchargeRepository codSurchargeRepository) {
        this.rateCardRepository = rateCardRepository;
        this.codSurchargeRepository = codSurchargeRepository;
    }

    public List<RateCard> getAllRateCards() {
        return rateCardRepository.findAll();
    }

    public RateCard getRateCardById(Long id) {
        return rateCardRepository.findById(id)
            .orElseThrow(() -> new AppException("Rate card not found", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public RateCard createRateCard(Map<String, Object> body) {
        RateCard card = new RateCard();
        card.setName((String) body.get("name"));
        card.setOrderType(RateCard.OrderType.valueOf((String) body.get("orderType")));
        card.setZoneType(RateCard.ZoneType.valueOf((String) body.get("zoneType")));
        card.setMinWeight(new BigDecimal(body.get("minWeight").toString()));
        card.setMaxWeight(new BigDecimal(body.get("maxWeight").toString()));
        card.setRatePerKg(new BigDecimal(body.get("ratePerKg").toString()));
        card.setBaseCharge(new BigDecimal(body.get("baseCharge").toString()));
        return rateCardRepository.save(card);
    }

    @Transactional
    public RateCard updateRateCard(Long id, Map<String, Object> body) {
        RateCard card = getRateCardById(id);
        if (body.containsKey("name")) card.setName((String) body.get("name"));
        if (body.containsKey("ratePerKg")) card.setRatePerKg(new BigDecimal(body.get("ratePerKg").toString()));
        if (body.containsKey("baseCharge")) card.setBaseCharge(new BigDecimal(body.get("baseCharge").toString()));
        if (body.containsKey("minWeight")) card.setMinWeight(new BigDecimal(body.get("minWeight").toString()));
        if (body.containsKey("maxWeight")) card.setMaxWeight(new BigDecimal(body.get("maxWeight").toString()));
        if (body.containsKey("active")) card.setActive((Boolean) body.get("active"));
        return rateCardRepository.save(card);
    }

    @Transactional
    public void deleteRateCard(Long id) {
        rateCardRepository.deleteById(id);
    }

    public List<CodSurcharge> getCodSurcharges() {
        return codSurchargeRepository.findAll();
    }

    @Transactional
    public CodSurcharge updateCodSurcharge(Long id, Map<String, Object> body) {
        CodSurcharge surcharge = codSurchargeRepository.findById(id)
            .orElseThrow(() -> new AppException("COD surcharge not found", HttpStatus.NOT_FOUND));
        surcharge.setSurchargeAmount(new BigDecimal(body.get("surchargeAmount").toString()));
        return codSurchargeRepository.save(surcharge);
    }
}
