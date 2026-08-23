package com.parcelgo.repository;

import com.parcelgo.model.Reschedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RescheduleRepository extends JpaRepository<Reschedule, Long> {
    List<Reschedule> findByOrderIdOrderByCreatedAtDesc(Long orderId);
}
