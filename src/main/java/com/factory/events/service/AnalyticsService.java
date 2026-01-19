package com.factory.events.service;

import com.factory.events.repository.MachineEventRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class AnalyticsService {

        private final MachineEventRepository repository;

        public AnalyticsService(MachineEventRepository repository) {
                this.repository = repository;
        }

        public MachineStats getStats(String machineId, Instant start, Instant end) {
                long eventsCount = repository.countEventsInWindow(machineId, start, end);
                Long defectsCountWrap = repository.countDefectsInWindow(machineId, start, end);
                long defectsCount = (defectsCountWrap == null) ? 0 : defectsCountWrap;

                double hours = Duration.between(start, end).toSeconds() / 3600.0;
                double avgDefectRate = (hours > 0) ? (defectsCount / hours) : 0.0;

                // Round to 1 decimal place
                avgDefectRate = Math.round(avgDefectRate * 10.0) / 10.0;

                String status = (avgDefectRate < 2.0) ? "Healthy" : "Warning";

                return new MachineStats(machineId, start, end, eventsCount, defectsCount, avgDefectRate, status);
        }

        public List<TopDefectLine> getTopDefectLines(Instant from, Instant to, int limit) {
                List<MachineEventRepository.TopDefectProjection> projections = repository.findTopDefectLines(from, to,
                                limit);

                return projections.stream().map(p -> {
                        double defectsPercent = (p.getEventCount() > 0)
                                        ? (double) p.getTotalDefects() / p.getEventCount() * 100
                                        : 0.0;
                        defectsPercent = Math.round(defectsPercent * 100.0) / 100.0; // Round to 2 decimals

                        return new TopDefectLine(p.getLineId(), p.getTotalDefects(), p.getEventCount(), defectsPercent);
                }).toList();
        }

        public record MachineStats(String machineId, Instant start, Instant end, long eventsCount, long defectsCount,
                        double avgDefectRate, String status) {
        }

        public record TopDefectLine(String lineId, long totalDefects, long eventCount, double defectsPercent) {
        }
}
