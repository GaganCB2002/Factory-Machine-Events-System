# Factory Events System Benchmark

## Goal
Verify that the system can process **1,000 events in under 1 second**.

## Setup
1. **Database**: Ensure PostgreSQL is running (`docker-compose up -d`).
2. **Application**: Start the backend (`mvn spring-boot:run`).

## Tools
You can use `Apache Bench (ab)`, `wrk`, or `Postman Runner`.

### Using cURL (Simple)
Save the following JSON to `batch.json` (repeat the object 1000 times):
```json
[
  {"eventId":"E-1", "eventTime":"...", "machineId":"M-1", "durationMs":100, "defectCount":0},
  ...
]
```
Run:
```bash
time curl -X POST -H "Content-Type: application/json" -d @batch.json http://localhost:8080/events/batch
```

### Expected Result
- **Time**: < 1.000s
- **Response**: `{"accepted": 1000, ...}`

## Current Performance Estimations
- **Database**: PostgreSQL with indexing on `(machineId, eventTime)` ensures fast lookup.
- **Batch Processing**: The `processBatch` method uses in-memory deduplication (HashMap) before hitting the DB, reducing redundant queries. The detailed "Read-Then-Write" logic handles complex updates efficiently.
