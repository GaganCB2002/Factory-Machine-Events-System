package com.factory.events.repository;

import com.factory.events.model.MachineEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface MachineEventRepository extends JpaRepository<MachineEvent, String> {

    @Query("SELECT COUNT(e) FROM MachineEvent e WHERE e.machineId = :machineId AND e.eventTime >= :start AND e.eventTime < :end")
    long countEventsInWindow(String machineId, Instant start, Instant end);

    @Query("SELECT SUM(e.defectCount) FROM MachineEvent e WHERE e.machineId = :machineId AND e.eventTime >= :start AND e.eventTime < :end AND e.defectCount >= 0")
    Long countDefectsInWindow(String machineId, Instant start, Instant end);

    // DTO Projection for Top Defect Lines
    @Query("SELECT e.lineId as lineId, " +
            "SUM(CASE WHEN e.defectCount > 0 THEN e.defectCount ELSE 0 END) as totalDefects, " +
            "COUNT(e) as eventCount " +
            "FROM MachineEvent e " +
            "WHERE e.eventTime >= :from AND e.eventTime < :to " +
            "GROUP BY e.lineId " +
            "ORDER BY totalDefects DESC " +
            "LIMIT :limit")
    List<TopDefectProjection> findTopDefectLines(Instant from, Instant to, int limit);

    interface TopDefectProjection {
        String getLineId();

        long getTotalDefects();

        long getEventCount();
    }
}
