package com.parcelgo.controller;

import com.parcelgo.dto.ApiResponse;
import com.parcelgo.model.User;
import com.parcelgo.repository.UserRepository;
import com.parcelgo.service.AdminService;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;

    public AdminController(AdminService adminService, UserRepository userRepository) {
        this.adminService = adminService;
        this.userRepository = userRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getDashboardStats()));
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<List<User>>> getCustomers() {
        List<User> customers = userRepository.findAll(Sort.by("createdAt").descending())
            .stream()
            .filter(u -> u.getRole() == User.Role.CUSTOMER)
            .toList();
        return ResponseEntity.ok(ApiResponse.ok(customers));
    }
}
