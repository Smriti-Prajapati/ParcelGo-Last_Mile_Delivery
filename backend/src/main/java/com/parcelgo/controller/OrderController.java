package com.parcelgo.controller;

import com.parcelgo.dto.*;
import com.parcelgo.repository.UserRepository;
import com.parcelgo.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public OrderController(OrderService orderService, UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    @PostMapping("/calculate")
    public ResponseEntity<ApiResponse<ChargeCalculationResponse>> calculate(
            @Valid @RequestBody OrderCreateRequest request) {
        ChargeCalculationResponse response = orderService.calculateCharge(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> create(
            @Valid @RequestBody OrderCreateRequest request,
            Authentication auth) {
        Long actorId = (Long) auth.getCredentials();
        OrderResponse order = orderService.createOrder(request, actorId);
        return ResponseEntity.ok(ApiResponse.ok("Order created successfully", order));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        boolean isAgent = auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_AGENT"));

        List<OrderResponse> orders;
        if (isAdmin) {
            orders = orderService.getAllOrders();
        } else if (isAgent) {
            orders = orderService.getOrdersForAgent(userId);
        } else {
            orders = orderService.getOrdersForCustomer(userId);
        }
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrderById(id)));
    }

    @GetMapping("/track/{trackingId}")
    public ResponseEntity<ApiResponse<OrderResponse>> trackByTrackingId(@PathVariable String trackingId) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrderByTrackingId(trackingId)));
    }

    @GetMapping("/{id}/tracking")
    public ResponseEntity<ApiResponse<List<TrackingEventDto>>> getTracking(@PathVariable Long id) {
        List<TrackingEventDto> events = orderService.getTrackingHistory(id)
            .stream().map(TrackingEventDto::new).collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(events));
    }

    @PostMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            Authentication auth) {
        Long actorId = (Long) auth.getCredentials();
        return ResponseEntity.ok(ApiResponse.ok("Status updated", orderService.updateStatus(id, request, actorId)));
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<OrderResponse>> assignAgent(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Long> body) {
        Long agentId = body.get("agentId");
        return ResponseEntity.ok(ApiResponse.ok("Agent assigned", orderService.assignAgent(id, agentId)));
    }

    @PostMapping("/{id}/auto-assign")
    public ResponseEntity<ApiResponse<OrderResponse>> autoAssign(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Agent auto-assigned", orderService.autoAssign(id)));
    }

    @PostMapping("/{id}/reschedule")
    public ResponseEntity<ApiResponse<OrderResponse>> reschedule(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequest request,
            Authentication auth) {
        Long customerId = (Long) auth.getCredentials();
        return ResponseEntity.ok(ApiResponse.ok("Delivery rescheduled", orderService.reschedule(id, request, customerId)));
    }
}
