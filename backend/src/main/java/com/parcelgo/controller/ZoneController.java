package com.parcelgo.controller;

import com.parcelgo.dto.ApiResponse;
import com.parcelgo.model.Zone;
import com.parcelgo.model.ZoneArea;
import com.parcelgo.service.ZoneService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/zones")
public class ZoneController {

    private final ZoneService zoneService;

    public ZoneController(ZoneService zoneService) {
        this.zoneService = zoneService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Zone>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(zoneService.getAllZones()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Zone>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(zoneService.getZoneById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Zone>> create(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok("Zone created", zoneService.createZone(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Zone>> update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok("Zone updated", zoneService.updateZone(id, body)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        zoneService.deleteZone(id);
        return ResponseEntity.ok(ApiResponse.ok("Zone deleted", null));
    }

    @PostMapping("/{zoneId}/areas")
    public ResponseEntity<ApiResponse<ZoneArea>> addArea(
            @PathVariable Long zoneId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok("Area added", zoneService.addAreaToZone(zoneId, body)));
    }

    @DeleteMapping("/areas/{areaId}")
    public ResponseEntity<ApiResponse<Void>> removeArea(@PathVariable Long areaId) {
        zoneService.removeArea(areaId);
        return ResponseEntity.ok(ApiResponse.ok("Area removed", null));
    }
}
