package com.factory.events.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "events", indexes = {
        @Index(name = "idx_machine_time", columnList = "machineId, eventTime"),
        @Index(name = "idx_line_time", columnList = "lineId, eventTime")
})
public class MachineEvent {

    @Id
    @NotNull
    private String eventId;

    @NotNull
    private Instant eventTime;

    private Instant receivedTime;

    @NotNull
    private String machineId;

    private String lineId;

    @Min(value = 0, message = "Duration cannot be negative")
    @Max(value = 21600000, message = "Duration cannot exceed 6 hours")
    private long durationMs;

    private int defectCount;

    public MachineEvent() {
    }

    public MachineEvent(String eventId, Instant eventTime, String machineId, String lineId, long durationMs,
            int defectCount) {
        this.eventId = eventId;
        this.eventTime = eventTime;
        this.machineId = machineId;
        this.lineId = lineId;
        this.durationMs = durationMs;
        this.defectCount = defectCount;
    }

    // Getters and Setters

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public Instant getEventTime() {
        return eventTime;
    }

    public void setEventTime(Instant eventTime) {
        this.eventTime = eventTime;
    }

    public Instant getReceivedTime() {
        return receivedTime;
    }

    public void setReceivedTime(Instant receivedTime) {
        this.receivedTime = receivedTime;
    }

    public String getMachineId() {
        return machineId;
    }

    public void setMachineId(String machineId) {
        this.machineId = machineId;
    }

    public String getLineId() {
        return lineId;
    }

    public void setLineId(String lineId) {
        this.lineId = lineId;
    }

    public long getDurationMs() {
        return durationMs;
    }

    public void setDurationMs(long durationMs) {
        this.durationMs = durationMs;
    }

    public int getDefectCount() {
        return defectCount;
    }

    public void setDefectCount(int defectCount) {
        this.defectCount = defectCount;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        MachineEvent that = (MachineEvent) o;
        if (durationMs != that.durationMs)
            return false;
        if (defectCount != that.defectCount)
            return false;
        if (!eventId.equals(that.eventId))
            return false;
        if (!eventTime.equals(that.eventTime))
            return false;
        if (lineId != null ? !lineId.equals(that.lineId) : that.lineId != null)
            return false;
        return machineId.equals(that.machineId);
    }

    @Override
    public int hashCode() {
        return eventId.hashCode();
    }
}
