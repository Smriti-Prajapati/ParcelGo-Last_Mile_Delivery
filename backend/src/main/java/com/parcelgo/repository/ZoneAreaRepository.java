package com.parcelgo.repository;

import com.parcelgo.model.ZoneArea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ZoneAreaRepository extends JpaRepository<ZoneArea, Long> {
    Optional<ZoneArea> findByPincode(String pincode);
    boolean existsByPincode(String pincode);
}
