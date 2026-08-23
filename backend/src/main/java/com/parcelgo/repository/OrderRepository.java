package com.parcelgo.repository;

import com.parcelgo.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    Optional<Order> findByTrackingId(String trackingId);
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Order> findByAgentIdOrderByCreatedAtDesc(Long agentId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(Order.OrderStatus status);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.paymentType = 'COD'")
    long countCodOrders();

    @Query("SELECT COALESCE(SUM(o.totalCharge), 0) FROM Order o WHERE o.status = 'DELIVERED'")
    java.math.BigDecimal sumDeliveredCharges();
}
