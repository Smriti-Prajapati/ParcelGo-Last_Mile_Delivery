package com.parcelgo;

import com.parcelgo.exception.AppException;
import com.parcelgo.model.DeliveryAgent;
import com.parcelgo.model.Order;
import com.parcelgo.model.User;
import com.parcelgo.model.Zone;
import com.parcelgo.repository.DeliveryAgentRepository;
import com.parcelgo.service.AgentAssignmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AgentAssignmentTest {

    @Mock private DeliveryAgentRepository agentRepository;

    private AgentAssignmentService service;

    @BeforeEach
    void setUp() {
        service = new AgentAssignmentService(agentRepository);
    }

    @Test
    void assignsAgentInSameZone() {
        Zone zone = new Zone(); zone.setId(1L); zone.setName("Zone A");

        User user = new User(); user.setId(2L); user.setName("Rahul");
        DeliveryAgent agent = new DeliveryAgent();
        agent.setId(1L);
        agent.setUser(user);
        agent.setZone(zone);
        agent.setAvailability(DeliveryAgent.Availability.AVAILABLE);

        Order order = new Order();
        order.setDropZone(zone);

        when(agentRepository.findByZoneIdAndAvailability(1L, DeliveryAgent.Availability.AVAILABLE))
            .thenReturn(List.of(agent));

        DeliveryAgent result = service.findBestAgent(order);
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void fallsBackToAnyAvailableAgentWhenNoAgentInZone() {
        Zone zone = new Zone(); zone.setId(1L);
        Zone otherZone = new Zone(); otherZone.setId(2L);

        User user = new User(); user.setId(3L); user.setName("Aman");
        DeliveryAgent agent = new DeliveryAgent();
        agent.setId(2L);
        agent.setUser(user);
        agent.setZone(otherZone);
        agent.setAvailability(DeliveryAgent.Availability.AVAILABLE);

        Order order = new Order();
        order.setDropZone(zone);

        when(agentRepository.findByZoneIdAndAvailability(1L, DeliveryAgent.Availability.AVAILABLE))
            .thenReturn(Collections.emptyList());
        when(agentRepository.findAvailableAgentsWithUser(DeliveryAgent.Availability.AVAILABLE))
            .thenReturn(List.of(agent));

        DeliveryAgent result = service.findBestAgent(order);
        assertThat(result.getId()).isEqualTo(2L);
    }

    @Test
    void throwsWhenNoAgentsAvailable() {
        Zone zone = new Zone(); zone.setId(1L);
        Order order = new Order();
        order.setDropZone(zone);

        when(agentRepository.findByZoneIdAndAvailability(1L, DeliveryAgent.Availability.AVAILABLE))
            .thenReturn(Collections.emptyList());
        when(agentRepository.findAvailableAgentsWithUser(DeliveryAgent.Availability.AVAILABLE))
            .thenReturn(Collections.emptyList());

        assertThatThrownBy(() -> service.findBestAgent(order))
            .isInstanceOf(AppException.class)
            .hasMessageContaining("No delivery agents are currently available");
    }
}
