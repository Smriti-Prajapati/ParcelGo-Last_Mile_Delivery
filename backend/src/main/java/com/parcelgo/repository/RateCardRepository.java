package com.parcelgo.repository;

import com.parcelgo.model.RateCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface RateCardRepository extends JpaRepository<RateCard, Long> {
    List<RateCard> findByOrderTypeAndZoneTypeAndActiveTrue(
        RateCard.OrderType orderType, RateCard.ZoneType zoneType
    );

    Optional<RateCard> findFirstByOrderTypeAndZoneTypeAndActiveTrueAndMinWeightLessThanEqualAndMaxWeightGreaterThan(
        RateCard.OrderType orderType,
        RateCard.ZoneType zoneType,
        BigDecimal weight1,
        BigDecimal weight2
    );
}
