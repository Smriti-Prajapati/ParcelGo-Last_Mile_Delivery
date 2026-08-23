package com.parcelgo.repository;

import com.parcelgo.model.DeliveryAgent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryAgentRepository extends JpaRepository<DeliveryAgent, Long> {
    Optional<DeliveryAgent> findByUserId(Long userId);
    List<DeliveryAgent> findByAvailability(DeliveryAgent.Availability availability);
    List<DeliveryAgent> findByZoneIdAndAvailability(Long zoneId, DeliveryAgent.Availability availability);

    @Query("SELECT da FROM DeliveryAgent da JOIN FETCH da.user WHERE da.availability = :availability")
    List<DeliveryAgent> findAvailableAgentsWithUser(DeliveryAgent.Availability availability);
}
