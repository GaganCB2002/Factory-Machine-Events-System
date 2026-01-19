import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

// Standalone Benchmark
public class Benchmark {

    // Simplified Event Model mirroring the real one
    static class BenchEvent {
        String eventId;
        Instant eventTime;
        String machineId;
        long durationMs;
        int defectCount;

        public BenchEvent(String eventId, Instant eventTime, String machineId, long durationMs, int defectCount) {
            this.eventId = eventId;
            this.eventTime = eventTime;
            this.machineId = machineId;
            this.durationMs = durationMs;
            this.defectCount = defectCount;
        }
    }

    // Repository Logic
    static final ConcurrentHashMap<String, BenchEvent> store = new ConcurrentHashMap<>();

    // Service Logic
    static void processBatch(List<BenchEvent> batch) {
        for (BenchEvent event : batch) {
            // Validate
            if (event.durationMs < 0 || event.durationMs > 21600000)
                continue;

            // Dedupe
            store.compute(event.eventId, (k, v) -> {
                if (v == null)
                    return event;
                // Assuming payload check here (simplified for benchmark speed test of map ops)
                if (v.durationMs != event.durationMs)
                    return event; // Update
                return v; // Ignore
            });
        }
    }

    public static void main(String[] args) {
        System.out.println("Starting Benchmark...");
        int batchSize = 1000;
        List<BenchEvent> batch = new ArrayList<>(batchSize);
        Instant now = Instant.now();
        Random r = new Random();

        for (int i = 0; i < batchSize; i++) {
            batch.add(new BenchEvent("E-" + i, now, "M-1", 1000 + r.nextInt(500), 0));
        }

        long start = System.nanoTime();
        processBatch(batch);
        long end = System.nanoTime();

        double durationMs = (end - start) / 1_000_000.0;
        System.out.println("Processed " + batchSize + " events in " + durationMs + " ms.");

        if (durationMs < 1000) {
            System.out.println("PASS: Under 1 second.");
        } else {
            System.out.println("FAIL: Over 1 second.");
        }
    }
}
