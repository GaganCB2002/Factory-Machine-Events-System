package com.factory.events.repository;

import com.factory.events.model.MachineEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<MachineEvent, String> {

    List<MachineEvent> findByMachineIdAndEventTimeBetween(String machineId, Instant start, Instant end);

    List<MachineEvent> findByLineIdAndEventTimeBetween(String lineId, Instant start, Instant end);
}
