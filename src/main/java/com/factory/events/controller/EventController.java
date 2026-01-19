package com.factory.events.controller;

import com.factory.events.model.MachineEvent;
import com.factory.events.service.AnalyticsService;
import com.factory.events.service.EventIngestionService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@CrossOrigin(origins = "*") // Allow frontend access
public class EventController {

    private final EventIngestionService ingestionService;
    private final AnalyticsService analyticsService;

    public EventController(EventIngestionService ingestionService, AnalyticsService analyticsService) {
        this.ingestionService = ingestionService;
        this.analyticsService = analyticsService;
    }

    @PostMapping("/events/batch")
    public ResponseEntity<EventIngestionService.BatchResult> ingestBatch(@RequestBody List<MachineEvent> events) {
        if (events == null || events.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(ingestionService.processBatch(events));
    }

    @GetMapping("/stats")
    public ResponseEntity<AnalyticsService.MachineStats> getStats(
            @RequestParam String machineId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant end) {

        return ResponseEntity.ok(analyticsService.getStats(machineId, start, end));
    }

    @GetMapping("/stats/top-defect-lines")
    public ResponseEntity<List<AnalyticsService.TopDefectLine>> getTopDefectLines(
            @RequestParam(required = false, defaultValue = "F01") String factoryId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "10") int limit) {

        return ResponseEntity.ok(analyticsService.getTopDefectLines(from, to, limit));
    }
}
