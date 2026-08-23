package com.parcelgo.service;

import com.parcelgo.dto.*;
import com.parcelgo.exception.AppException;
import com.parcelgo.model.*;
import com.parcelgo.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
@Service
public class OrderService {

    private static final Map<Order.OrderStatus, Set<Order.OrderStatus>> VALID_TRANSITIONS = Map.of(
        Order.OrderStatus.CONFIRMED,          Set.of(Order.OrderStatus.PICKED_UP),
        Order.OrderStatus.PICKED_UP,          Set.of(Order.OrderStatus.IN_TRANSIT),
        Order.OrderStatus.IN_TRANSIT,         Set.of(Order.OrderStatus.OUT_FOR_DELIVERY),
        Order.OrderStatus.OUT_FOR_DELIVERY,   Set.of(Order.OrderStatus.DELIVERED, Order.OrderStatus.FAILED),
        Order.OrderStatus.FAILED,             Set.of(Order.OrderStatus.CONFIRMED),
        Order.OrderStatus.DELIVERED,          Set.of()
    );

    private final OrderRepository orderRepository;
    private final OrderTrackingRepository trackingRepository;
    private final RescheduleRepository rescheduleRepository;
    private final UserRepository userRepository;
    private final DeliveryAgentRepository agentRepository;
    private final RateCalculationService rateCalculationService;
    private final AgentAssignmentService assignmentService;
    private final NotificationService notificationService;

    public OrderService(OrderRepository orderRepository,
                        OrderTrackingRepository trackingRepository,
                        RescheduleRepository rescheduleRepository,
                        UserRepository userRepository,
                        DeliveryAgentRepository agentRepository,
                        RateCalculationService rateCalculationService,
                        AgentAssignmentService assignmentService,
                        NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.trackingRepository = trackingRepository;
        this.rescheduleRepository = rescheduleRepository;
        this.userRepository = userRepository;
        this.agentRepository = agentRepository;
        this.rateCalculationService = rateCalculationService;
        this.assignmentService = assignmentService;
        this.notificationService = notificationService;
    }

    public ChargeCalculationResponse calculateCharge(OrderCreateRequest request) {
        return rateCalculationService.calculate(request);
    }

    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request, Long actorId) {
        ChargeCalculationResponse charge = rateCalculationService.calculate(request);

        Long customerId = request.getCustomerId() != null ? request.getCustomerId() : actorId;
        User customer = userRepository.findById(customerId)
            .orElseThrow(() -> new AppException("Customer not found", HttpStatus.NOT_FOUND));

        Zone pickupZone = rateCalculationService.detectZone(request.getPickupPincode());
        Zone dropZone = rateCalculationService.detectZone(request.getDropPincode());

        Order order = new Order();
        order.setTrackingId(generateTrackingId());
        order.setCustomer(customer);
        order.setPickupAddress(request.getPickupAddress());
        order.setPickupPincode(request.getPickupPincode());
        order.setDropAddress(request.getDropAddress());
        order.setDropPincode(request.getDropPincode());
        order.setPickupZone(pickupZone);
        order.setDropZone(dropZone);
        order.setLength(request.getLength());
        order.setBreadth(request.getBreadth());
        order.setHeight(request.getHeight());
        order.setActualWeight(request.getActualWeight());
        order.setVolumetricWeight(charge.getVolumetricWeight());
        order.setBillableWeight(charge.getBillableWeight());
        order.setOrderType(Order.OrderType.valueOf(charge.getOrderType()));
        order.setPaymentType(Order.PaymentType.valueOf(charge.getPaymentType()));
        order.setBaseCharge(charge.getBaseCharge());
        order.setCodSurcharge(charge.getCodSurcharge());
        order.setTotalCharge(charge.getTotalCharge());
        order.setNotes(request.getNotes());
        order.setStatus(Order.OrderStatus.CONFIRMED);

        orderRepository.save(order);
        logTrackingEvent(order, Order.OrderStatus.CONFIRMED, actorId, "Order placed");

        return OrderResponse.from(order);
    }

    public List<OrderResponse> getOrdersForCustomer(Long customerId) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
            .stream().map(OrderResponse::from).collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersForAgent(Long userId) {
        return agentRepository.findByUserId(userId)
            .map(agent -> orderRepository.findByAgentIdOrderByCreatedAtDesc(agent.getId())
                .stream().map(OrderResponse::from).collect(Collectors.toList()))
            .orElse(List.of());
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .map(OrderResponse::from).collect(Collectors.toList());
    }

    public OrderResponse getOrderById(Long id) {
        return OrderResponse.from(findOrder(id));
    }

    public OrderResponse getOrderByTrackingId(String trackingId) {
        Order order = orderRepository.findByTrackingId(trackingId)
            .orElseThrow(() -> new AppException("Order not found for tracking ID: " + trackingId, HttpStatus.NOT_FOUND));
        return OrderResponse.from(order);
    }

    public List<OrderTracking> getTrackingHistory(Long orderId) {
        findOrder(orderId);
        return trackingRepository.findByOrderIdOrderByCreatedAtAsc(orderId);
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, StatusUpdateRequest request, Long actorId) {
        Order order = findOrder(orderId);
        Order.OrderStatus newStatus;
        try {
            newStatus = Order.OrderStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException("Invalid status: " + request.getStatus(), HttpStatus.BAD_REQUEST);
        }

        Set<Order.OrderStatus> allowed = VALID_TRANSITIONS.getOrDefault(order.getStatus(), Set.of());
        if (!allowed.contains(newStatus)) {
            throw new AppException(
                "Cannot transition from " + order.getStatus() + " to " + newStatus,
                HttpStatus.CONFLICT
            );
        }

        String previousStatus = order.getStatus().name();
        order.setStatus(newStatus);
        orderRepository.save(order);

        logTrackingEvent(order, newStatus, actorId, request.getNotes());

        // Extract all needed data before async calls (lazy loading safe)
        String toEmail = order.getCustomer().getEmail();
        String customerName = order.getCustomer().getName();
        String customerPhone = order.getCustomer().getPhone();
        String agentName = order.getAgent() != null ? order.getAgent().getUser().getName() : null;

        notificationService.sendStatusUpdateEmail(toEmail, customerName, order.getTrackingId(),
            newStatus.name(), order.getPickupAddress(), order.getDropAddress(), agentName);
        notificationService.sendStatusUpdateSms(customerPhone, order.getTrackingId(), newStatus.name());

        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse assignAgent(Long orderId, Long agentId) {
        Order order = findOrder(orderId);
        DeliveryAgent agent = agentRepository.findById(agentId)
            .orElseThrow(() -> new AppException("Agent not found", HttpStatus.NOT_FOUND));

        if (agent.getAvailability() != DeliveryAgent.Availability.AVAILABLE) {
            throw new AppException("Agent is not available for assignment", HttpStatus.CONFLICT);
        }

        order.setAgent(agent);
        agent.setAvailability(DeliveryAgent.Availability.BUSY);
        agentRepository.save(agent);
        orderRepository.save(order);

        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse autoAssign(Long orderId) {
        Order order = findOrder(orderId);
        DeliveryAgent agent = assignmentService.findBestAgent(order);

        order.setAgent(agent);
        agent.setAvailability(DeliveryAgent.Availability.BUSY);
        agentRepository.save(agent);
        orderRepository.save(order);

        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse reschedule(Long orderId, RescheduleRequest request, Long customerId) {
        Order order = findOrder(orderId);

        if (order.getStatus() != Order.OrderStatus.FAILED) {
            throw new AppException("Only failed deliveries can be rescheduled", HttpStatus.CONFLICT);
        }

        if (!order.getCustomer().getId().equals(customerId)) {
            throw new AppException("You can only reschedule your own orders", HttpStatus.FORBIDDEN);
        }

        Reschedule reschedule = new Reschedule();
        reschedule.setOrder(order);
        reschedule.setOriginalDate(order.getScheduledDate());
        reschedule.setNewDate(request.getNewDate());
        reschedule.setReason(request.getReason());
        rescheduleRepository.save(reschedule);

        order.setScheduledDate(request.getNewDate());
        order.setStatus(Order.OrderStatus.CONFIRMED);

        if (order.getAgent() != null) {
            DeliveryAgent prevAgent = order.getAgent();
            prevAgent.setAvailability(DeliveryAgent.Availability.AVAILABLE);
            agentRepository.save(prevAgent);
            order.setAgent(null);
        }

        orderRepository.save(order);
        logTrackingEvent(order, Order.OrderStatus.CONFIRMED, customerId, "Rescheduled for " + request.getNewDate());

        try {
            DeliveryAgent newAgent = assignmentService.findBestAgent(order);
            order.setAgent(newAgent);
            newAgent.setAvailability(DeliveryAgent.Availability.BUSY);
            agentRepository.save(newAgent);
            orderRepository.save(order);
        } catch (AppException e) {
            // No agents available right now — order stays without agent, will be assigned later
        }

        notificationService.sendRescheduleEmail(
            order.getCustomer().getEmail(),
            order.getCustomer().getName(),
            order.getTrackingId(),
            request.getNewDate().toString()
        );
        notificationService.sendRescheduleSms(
            order.getCustomer().getPhone(),
            order.getTrackingId(),
            request.getNewDate().toString()
        );
        return OrderResponse.from(order);
    }

    private void logTrackingEvent(Order order, Order.OrderStatus status, Long actorId, String notes) {
        OrderTracking event = new OrderTracking();
        event.setOrder(order);
        event.setStatus(status);
        event.setActorId(actorId);

        if (actorId != null) {
            userRepository.findById(actorId).ifPresent(u -> event.setActorName(u.getName()));
        }

        event.setNotes(notes);
        trackingRepository.save(event);
    }

    private Order findOrder(Long id) {
        return orderRepository.findById(id)
            .orElseThrow(() -> new AppException("Order not found", HttpStatus.NOT_FOUND));
    }

    private String generateTrackingId() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmmss"));
        return "PG" + timestamp;
    }
}
