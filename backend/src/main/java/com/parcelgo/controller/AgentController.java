package com.parcelgo.controller;

import com.parcelgo.dto.AgentResponse;
import com.parcelgo.dto.ApiResponse;
import com.parcelgo.model.DeliveryAgent;
import com.parcelgo.service.AgentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/agents")
public class AgentController {

    private final AgentService agentService;

    public AgentController(AgentService agentService) {
        this.agentService = agentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AgentResponse>>> getAll() {
        List<AgentResponse> agents = agentService.getAllAgents()
            .stream().map(AgentResponse::new).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(agents));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AgentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(new AgentResponse(agentService.getAgentById(id))));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AgentResponse>> getMyProfile(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(ApiResponse.ok(new AgentResponse(agentService.getAgentByUserId(userId))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AgentResponse>> create(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(ApiResponse.ok("Agent created", new AgentResponse(agentService.createAgent(body))));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AgentResponse>> update(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(ApiResponse.ok("Agent updated", new AgentResponse(agentService.updateAgent(id, body))));
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<AgentResponse>> updateAvailability(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok("Availability updated",
            new AgentResponse(agentService.updateAgentAvailability(id, body.get("availability")))));
    }
}
