package com.parcelgo.repository;

import com.parcelgo.model.CodSurcharge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CodSurchargeRepository extends JpaRepository<CodSurcharge, Long> {
    Optional<CodSurcharge> findByOrderType(CodSurcharge.OrderType orderType);
}
