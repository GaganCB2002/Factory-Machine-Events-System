package com.factory.events.service;

import com.factory.events.model.MachineEvent;
import com.factory.events.repository.MachineEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class EventIngestionService {

    private final MachineEventRepository repository;

    // Concurrent validation constraints
    private static final long MAX_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours
    private static final long FUTURE_LIMIT_SECONDS = 15 * 60; // 15 mins

    public EventIngestionService(MachineEventRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public BatchResult processBatch(List<MachineEvent> events) {
        BatchResult result = new BatchResult();
        List<MachineEvent> toSave = new ArrayList<>();
        Instant now = Instant.now();

        // 1. In-memory dedupe for the incoming batch to handle duplicates within the
        // same payload
        Map<String, MachineEvent> batchUnique = new HashMap<>(); // eventId -> Event

        for (MachineEvent event : events) {
            // Validation
            if (!isValid(event, now, result)) {
                continue;
            }

            // Local Batch Dedupe: Keep latest in batch if dupe
            batchUnique.put(event.getEventId(), event);
        }

        // 2. Database Check & Merge
        for (MachineEvent incoming : batchUnique.values()) {
            Optional<MachineEvent> existingOpt = repository.findById(incoming.getEventId());
            checkAndMerge(incoming, existingOpt, toSave, result);
        }

        // 3. Batch Save
        if (!toSave.isEmpty()) {
            repository.saveAll(toSave);
        }

        return result;
    }

    private boolean isValid(MachineEvent event, Instant now, BatchResult result) {
        if (event.getDurationMs() < 0 || event.getDurationMs() > MAX_DURATION_MS) {
            result.rejections.add(new Rejection(event.getEventId(), "INVALID_DURATION"));
            result.rejected.incrementAndGet();
            return false;
        }
        if (event.getEventTime().isAfter(now.plusSeconds(FUTURE_LIMIT_SECONDS))) {
            result.rejections.add(new Rejection(event.getEventId(), "FUTURE_EVENT"));
            result.rejected.incrementAndGet();
            return false;
        }
        return true;
    }

    private void checkAndMerge(MachineEvent incoming, Optional<MachineEvent> existingOpt, List<MachineEvent> toSave,
            BatchResult result) {
        // If receivedTime is not set by sender (which is expected), set it to now.
        // If sender provides it (e.g. for backfill or testing), keep it.
        if (incoming.getReceivedTime() == null) {
            incoming.setReceivedTime(Instant.now());
        }

        if (existingOpt.isPresent()) {
            MachineEvent existing = existingOpt.get();

            // Rule 3: Different payload + older receivedTime -> ignored
            if (incoming.getReceivedTime().isBefore(existing.getReceivedTime())) {
                // Ignore update
                result.ignored.incrementAndGet();
                return;
            }

            if (isSamePayload(incoming, existing)) {
                // Exact Match -> Dedupe
                result.deduped.incrementAndGet();
            } else {
                // Different Payload -> Update
                existing.setMachineId(incoming.getMachineId());
                existing.setLineId(incoming.getLineId());
                existing.setEventTime(incoming.getEventTime());
                existing.setDurationMs(incoming.getDurationMs());
                existing.setDefectCount(incoming.getDefectCount());
                existing.setReceivedTime(incoming.getReceivedTime()); // Update timestamp

                toSave.add(existing);
                result.updated.incrementAndGet();
            }
        } else {
            // New -> Insert
            toSave.add(incoming);
            result.accepted.incrementAndGet();
        }
    }

    private boolean isSamePayload(MachineEvent a, MachineEvent b) {
        return a.getMachineId().equals(b.getMachineId()) &&
                Objects.equals(a.getLineId(), b.getLineId()) &&
                a.getEventTime().equals(b.getEventTime()) &&
                a.getDurationMs() == b.getDurationMs() &&
                a.getDefectCount() == b.getDefectCount();
    }

    public static class BatchResult {
        public AtomicInteger accepted = new AtomicInteger(0);
        public AtomicInteger deduped = new AtomicInteger(0);
        public AtomicInteger updated = new AtomicInteger(0);
        public AtomicInteger rejected = new AtomicInteger(0);
        public AtomicInteger ignored = new AtomicInteger(0);
        public List<Rejection> rejections = Collections.synchronizedList(new ArrayList<>());
    }

    public record Rejection(String eventId, String reason) {
    }
}
