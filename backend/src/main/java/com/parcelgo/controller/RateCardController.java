package com.parcelgo.controller;

import com.parcelgo.dto.ApiResponse;
import com.parcelgo.model.CodSurcharge;
import com.parcelgo.model.RateCard;
import com.parcelgo.service.RateCardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rates")
public class RateCardController {

    private final RateCardService rateCardService;

    public RateCardController(RateCardService rateCardService) {
        this.rateCardService = rateCardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RateCard>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(rateCardService.getAllRateCards()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RateCard>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(rateCardService.getRateCardById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RateCard>> create(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(ApiResponse.ok("Rate card created", rateCardService.createRateCard(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RateCard>> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(ApiResponse.ok("Rate card updated", rateCardService.updateRateCard(id, body)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        rateCardService.deleteRateCard(id);
        return ResponseEntity.ok(ApiResponse.ok("Rate card deleted", null));
    }

    @GetMapping("/cod")
    public ResponseEntity<ApiResponse<List<CodSurcharge>>> getCodSurcharges() {
        return ResponseEntity.ok(ApiResponse.ok(rateCardService.getCodSurcharges()));
    }

    @PutMapping("/cod/{id}")
    public ResponseEntity<ApiResponse<CodSurcharge>> updateCodSurcharge(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(ApiResponse.ok("COD surcharge updated", rateCardService.updateCodSurcharge(id, body)));
    }
}
