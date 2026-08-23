package com.parcelgo.service;

import com.parcelgo.model.Order;
import com.parcelgo.repository.DeliveryAgentRepository;
import com.parcelgo.repository.OrderRepository;
import com.parcelgo.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@Service
public class AdminService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final DeliveryAgentRepository agentRepository;

    public AdminService(OrderRepository orderRepository, UserRepository userRepository,
                        DeliveryAgentRepository agentRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.agentRepository = agentRepository;
    }

    public Map<String, Object> getDashboardStats() {
        long total = orderRepository.count();
        long confirmed = orderRepository.countByStatus(Order.OrderStatus.CONFIRMED);
        long pickedUp = orderRepository.countByStatus(Order.OrderStatus.PICKED_UP);
        long inTransit = orderRepository.countByStatus(Order.OrderStatus.IN_TRANSIT);
        long outForDelivery = orderRepository.countByStatus(Order.OrderStatus.OUT_FOR_DELIVERY);
        long delivered = orderRepository.countByStatus(Order.OrderStatus.DELIVERED);
        long failed = orderRepository.countByStatus(Order.OrderStatus.FAILED);
        long codOrders = orderRepository.countCodOrders();
        BigDecimal revenue = orderRepository.sumDeliveredCharges();
        long totalCustomers = userRepository.count() - agentRepository.count() - 1;
        long availableAgents = agentRepository.findByAvailability(
            com.parcelgo.model.DeliveryAgent.Availability.AVAILABLE).size();

        return Map.of(
            "totalOrders", total,
            "confirmed", confirmed,
            "pickedUp", pickedUp,
            "inTransit", inTransit,
            "outForDelivery", outForDelivery,
            "delivered", delivered,
            "failed", failed,
            "codOrders", codOrders,
            "revenue", revenue != null ? revenue : BigDecimal.ZERO,
            "availableAgents", availableAgents
        );
    }
}
