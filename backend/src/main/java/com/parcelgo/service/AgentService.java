package com.parcelgo.service;

import com.parcelgo.exception.AppException;
import com.parcelgo.model.DeliveryAgent;
import com.parcelgo.model.User;
import com.parcelgo.model.Zone;
import com.parcelgo.repository.DeliveryAgentRepository;
import com.parcelgo.repository.UserRepository;
import com.parcelgo.repository.ZoneRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class AgentService {

    private final DeliveryAgentRepository agentRepository;
    private final UserRepository userRepository;
    private final ZoneRepository zoneRepository;
    private final PasswordEncoder passwordEncoder;

    public AgentService(DeliveryAgentRepository agentRepository, UserRepository userRepository,
                        ZoneRepository zoneRepository, PasswordEncoder passwordEncoder) {
        this.agentRepository = agentRepository;
        this.userRepository = userRepository;
        this.zoneRepository = zoneRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<DeliveryAgent> getAllAgents() {
        return agentRepository.findAll();
    }

    public DeliveryAgent getAgentById(Long id) {
        return agentRepository.findById(id)
            .orElseThrow(() -> new AppException("Agent not found", HttpStatus.NOT_FOUND));
    }

    public DeliveryAgent getAgentByUserId(Long userId) {
        return agentRepository.findByUserId(userId)
            .orElseThrow(() -> new AppException("Agent profile not found", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public DeliveryAgent createAgent(Map<String, Object> body) {
        String email = (String) body.get("email");
        if (userRepository.existsByEmail(email)) {
            throw new AppException("Email already registered", HttpStatus.CONFLICT);
        }

        User user = new User();
        user.setName((String) body.get("name"));
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode((String) body.get("password")));
        user.setPhone((String) body.get("phone"));
        user.setRole(User.Role.AGENT);
        userRepository.save(user);

        DeliveryAgent agent = new DeliveryAgent();
        agent.setUser(user);
        agent.setVehicleNumber((String) body.get("vehicleNumber"));

        if (body.get("zoneId") != null) {
            Long zoneId = Long.valueOf(body.get("zoneId").toString());
            Zone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new AppException("Zone not found", HttpStatus.NOT_FOUND));
            agent.setZone(zone);
        }

        if (body.get("latitude") != null) agent.setLatitude(new BigDecimal(body.get("latitude").toString()));
        if (body.get("longitude") != null) agent.setLongitude(new BigDecimal(body.get("longitude").toString()));

        return agentRepository.save(agent);
    }

    @Transactional
    public DeliveryAgent updateAgentAvailability(Long agentId, String availability) {
        DeliveryAgent agent = getAgentById(agentId);
        try {
            agent.setAvailability(DeliveryAgent.Availability.valueOf(availability.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new AppException("Invalid availability: " + availability, HttpStatus.BAD_REQUEST);
        }
        return agentRepository.save(agent);
    }

    @Transactional
    public DeliveryAgent updateAgent(Long agentId, Map<String, Object> body) {
        DeliveryAgent agent = getAgentById(agentId);
        if (body.containsKey("vehicleNumber")) agent.setVehicleNumber((String) body.get("vehicleNumber"));
        if (body.containsKey("latitude")) agent.setLatitude(new BigDecimal(body.get("latitude").toString()));
        if (body.containsKey("longitude")) agent.setLongitude(new BigDecimal(body.get("longitude").toString()));
        if (body.containsKey("availability")) {
            agent.setAvailability(DeliveryAgent.Availability.valueOf(body.get("availability").toString().toUpperCase()));
        }
        if (body.containsKey("zoneId")) {
            Long zoneId = Long.valueOf(body.get("zoneId").toString());
            zoneRepository.findById(zoneId).ifPresent(agent::setZone);
        }
        return agentRepository.save(agent);
    }
}
