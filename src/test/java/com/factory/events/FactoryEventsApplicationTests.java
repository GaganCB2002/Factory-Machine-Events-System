package com.factory.events;

import com.factory.events.model.MachineEvent;
import com.factory.events.repository.MachineEventRepository;
import com.factory.events.service.AnalyticsService;
import com.factory.events.service.EventIngestionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class FactoryEventsApplicationTests {

    @Autowired
    private EventIngestionService ingestionService;

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private MachineEventRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    // 1. Identical duplicate eventId -> deduped
    @Test
    void testIdenticalDuplicateDeduped() {
        MachineEvent event1 = new MachineEvent("E-1", Instant.parse("2026-01-15T10:00:00Z"), "M-001", "L1", 1000, 0);
        MachineEvent event2 = new MachineEvent("E-1", Instant.parse("2026-01-15T10:00:00Z"), "M-001", "L1", 1000, 0);

        EventIngestionService.BatchResult response = ingestionService.processBatch(List.of(event1, event2));

        assertEquals(1, response.accepted.get());
        assertEquals(1, response.deduped.get()); // 1 accepted, 1 deduped (either locally or via DB logic)
        assertEquals(1, repository.count());
    }

    // 2. Different payload + newer receivedTime -> update happens
    @Test
    void testDifferentPayloadUpdates() {
        MachineEvent event1 = new MachineEvent("E-1", Instant.parse("2026-01-15T10:00:00Z"), "M-001", "L1", 1000, 0);
        ingestionService.processBatch(List.of(event1)); // Initially saved

        // Simulate newer update
        MachineEvent event2 = new MachineEvent("E-1", Instant.parse("2026-01-15T10:00:00Z"), "M-001", "L1", 2000, 5);
        EventIngestionService.BatchResult response = ingestionService.processBatch(List.of(event2));

        assertEquals(1, response.updated.get());

        MachineEvent stored = repository.findById("E-1").get();
        assertEquals(2000, stored.getDurationMs());
        assertEquals(5, stored.getDefectCount());
    }

    // 3. Different payload + older receivedTime → ignored
    @Test
    void testDifferentPayloadOlderIgnored() {
        // Save initial event with "future" receivedTime (simulating it is the latest
        // state)
        MachineEvent eventOld = new MachineEvent("E-IGNORED", Instant.parse("2026-01-15T10:00:00Z"), "M-001", "L1",
                1000, 0);
        eventOld.setReceivedTime(Instant.now().plusSeconds(60)); // It arrived "in the future"
        repository.save(eventOld);

        // Try to update with "older" (current time) event
        MachineEvent eventNew = new MachineEvent("E-IGNORED", Instant.parse("2026-01-15T10:00:00Z"), "M-001", "L1",
                8888, 8);
        // eventNew.receivedTime will be set to NOW, which is BEFORE
        // eventOld.receivedTime

        EventIngestionService.BatchResult response = ingestionService.processBatch(List.of(eventNew));

        assertEquals(1, response.ignored.get());
        assertEquals(0, response.updated.get());

        // Verify state did NOT change
        MachineEvent stored = repository.findById("E-IGNORED").get();
        assertEquals(1000, stored.getDurationMs());
    }

    // 4. Invalid duration rejected
    @Test
    void testInvalidDurationRejected() {
        MachineEvent event = new MachineEvent("E-INV-DUR", Instant.parse("2026-01-15T10:00:00Z"), "M-001", "L1", -1, 0);
        EventIngestionService.BatchResult response = ingestionService.processBatch(List.of(event));
        assertEquals(1, response.rejected.get());
        assertEquals("INVALID_DURATION", response.rejections.get(0).reason());
    }

    // 5. Future eventTime rejected
    @Test
    void testFutureEventTimeRejected() {
        Instant futureInfo = Instant.now().plus(java.time.Duration.ofMinutes(20));
        MachineEvent event = new MachineEvent("E-FUT", futureInfo, "M-001", "L1", 1000, 0);
        EventIngestionService.BatchResult response = ingestionService.processBatch(List.of(event));
        assertEquals(1, response.rejected.get());
    }

    // 6. DefectCount = -1 ignored in defect totals
    @Test
    void testDefectCountNegativeOneIgnored() {
        MachineEvent e1 = new MachineEvent("E-DEF-1", Instant.parse("2026-01-15T10:00:00Z"), "M-001", "L1", 1000, 5);
        MachineEvent e2 = new MachineEvent("E-DEF-2", Instant.parse("2026-01-15T10:05:00Z"), "M-001", "L1", 1000, -1);

        ingestionService.processBatch(List.of(e1, e2));

        AnalyticsService.MachineStats stats = analyticsService.getStats("M-001", Instant.parse("2026-01-15T09:00:00Z"),
                Instant.parse("2026-01-15T11:00:00Z"));
        assertEquals(2, stats.eventsCount());
        assertEquals(5, stats.defectsCount()); // Should be 5, not 4 or 6.
    }

    // 7. start/end boundary correctness (inclusive/exclusive)
    @Test
    void testTimeWindowBoundaries() {
        MachineEvent e1 = new MachineEvent("E-B-1", Instant.parse("2026-01-15T10:00:00Z"), "M-001", "L1", 1000, 1);
        MachineEvent e2 = new MachineEvent("E-B-2", Instant.parse("2026-01-15T10:59:59Z"), "M-001", "L1", 1000, 1);
        MachineEvent e3 = new MachineEvent("E-B-3", Instant.parse("2026-01-15T11:00:00Z"), "M-001", "L1", 1000, 1);

        ingestionService.processBatch(List.of(e1, e2, e3));

        // Query 10:00 (inclusive) to 11:00 (exclusive)
        AnalyticsService.MachineStats stats = analyticsService.getStats("M-001", Instant.parse("2026-01-15T10:00:00Z"),
                Instant.parse("2026-01-15T11:00:00Z"));
        assertEquals(2, stats.eventsCount()); // Should include e1, e2 but NOT e3
    }

    // 8. Thread-safety test: concurrent ingestion
    @Test
    void testConcurrentIngestion() throws InterruptedException {
        int threads = 10;
        int eventsPerThread = 100;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(threads);

        for (int i = 0; i < threads; i++) {
            final int threadId = i;
            executor.submit(() -> {
                try {
                    List<MachineEvent> batch = new ArrayList<>();
                    for (int j = 0; j < eventsPerThread; j++) {
                        String eventId = "E-CONC-" + threadId + "-" + j;
                        batch.add(new MachineEvent(eventId, Instant.now(), "M-CONC", "L1", 1000, 0));
                    }
                    ingestionService.processBatch(batch);
                } finally {
                    latch.countDown();
                }
            });
        }

        assertTrue(latch.await(10, TimeUnit.SECONDS));
        assertEquals(threads * eventsPerThread, repository.count());
    }
}
