package com.parcelgo.service;

import com.parcelgo.exception.AppException;
import com.parcelgo.model.Zone;
import com.parcelgo.model.ZoneArea;
import com.parcelgo.repository.ZoneAreaRepository;
import com.parcelgo.repository.ZoneRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class ZoneService {

    private final ZoneRepository zoneRepository;
    private final ZoneAreaRepository zoneAreaRepository;

    public ZoneService(ZoneRepository zoneRepository, ZoneAreaRepository zoneAreaRepository) {
        this.zoneRepository = zoneRepository;
        this.zoneAreaRepository = zoneAreaRepository;
    }

    public List<Zone> getAllZones() {
        return zoneRepository.findAll();
    }

    public Zone getZoneById(Long id) {
        return zoneRepository.findById(id)
            .orElseThrow(() -> new AppException("Zone not found", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Zone createZone(Map<String, String> body) {
        String name = body.get("name");
        if (zoneRepository.existsByName(name)) {
            throw new AppException("Zone with name '" + name + "' already exists", HttpStatus.CONFLICT);
        }
        Zone zone = new Zone();
        zone.setName(name);
        zone.setDescription(body.get("description"));
        return zoneRepository.save(zone);
    }

    @Transactional
    public Zone updateZone(Long id, Map<String, String> body) {
        Zone zone = getZoneById(id);
        if (body.containsKey("name")) zone.setName(body.get("name"));
        if (body.containsKey("description")) zone.setDescription(body.get("description"));
        return zoneRepository.save(zone);
    }

    @Transactional
    public void deleteZone(Long id) {
        Zone zone = getZoneById(id);
        zoneRepository.delete(zone);
    }

    @Transactional
    public ZoneArea addAreaToZone(Long zoneId, Map<String, String> body) {
        Zone zone = getZoneById(zoneId);
        String pincode = body.get("pincode");

        if (zoneAreaRepository.existsByPincode(pincode)) {
            throw new AppException("Pincode " + pincode + " is already assigned to a zone", HttpStatus.CONFLICT);
        }

        ZoneArea area = new ZoneArea();
        area.setZone(zone);
        area.setPincode(pincode);
        area.setAreaName(body.get("areaName"));
        return zoneAreaRepository.save(area);
    }

    @Transactional
    public void removeArea(Long areaId) {
        ZoneArea area = zoneAreaRepository.findById(areaId)
            .orElseThrow(() -> new AppException("Area not found", HttpStatus.NOT_FOUND));
        zoneAreaRepository.delete(area);
    }
}
