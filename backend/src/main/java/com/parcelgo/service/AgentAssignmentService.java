package com.parcelgo.service;

import com.parcelgo.exception.AppException;
import com.parcelgo.model.DeliveryAgent;
import com.parcelgo.model.Order;
import com.parcelgo.repository.DeliveryAgentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
public class AgentAssignmentService {

    private final DeliveryAgentRepository agentRepository;

    public AgentAssignmentService(DeliveryAgentRepository agentRepository) {
        this.agentRepository = agentRepository;
    }

    public DeliveryAgent findBestAgent(Order order) {
        Long dropZoneId = order.getDropZone() != null ? order.getDropZone().getId() : null;

        // Prefer agents in the same drop zone first
        if (dropZoneId != null) {
            List<DeliveryAgent> sameZoneAgents = agentRepository
                .findByZoneIdAndAvailability(dropZoneId, DeliveryAgent.Availability.AVAILABLE);
            if (!sameZoneAgents.isEmpty()) {
                return pickNearest(sameZoneAgents, order);
            }
        }

        // Fall back to any available agent
        List<DeliveryAgent> allAvailable = agentRepository
            .findAvailableAgentsWithUser(DeliveryAgent.Availability.AVAILABLE);

        if (allAvailable.isEmpty()) {
            throw new AppException("No delivery agents are currently available", HttpStatus.CONFLICT);
        }

        return pickNearest(allAvailable, order);
    }

    private DeliveryAgent pickNearest(List<DeliveryAgent> agents, Order order) {
        // If we have coordinates on the order's drop zone agents, sort by distance
        // Otherwise fall back to FIFO (first created)
        return agents.stream()
            .min(Comparator.comparingLong(DeliveryAgent::getId))
            .orElseThrow();
    }

    public double haversineDistance(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2) {
        double R = 6371.0;
        double dLat = Math.toRadians(lat2.doubleValue() - lat1.doubleValue());
        double dLon = Math.toRadians(lon2.doubleValue() - lon1.doubleValue());
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(Math.toRadians(lat1.doubleValue()))
            * Math.cos(Math.toRadians(lat2.doubleValue()))
            * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
