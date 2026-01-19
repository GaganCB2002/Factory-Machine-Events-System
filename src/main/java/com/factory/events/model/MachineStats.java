package com.factory.events.model;

public class MachineStats {
    private String machineId;
    private String start;
    private String end;
    private long eventsCount;
    private int defectsCount;
    private double avgDefectRate;
    private String status;

    public MachineStats(String machineId, String start, String end, long eventsCount, int defectsCount,
            double avgDefectRate, String status) {
        this.machineId = machineId;
        this.start = start;
        this.end = end;
        this.eventsCount = eventsCount;
        this.defectsCount = defectsCount;
        this.avgDefectRate = avgDefectRate;
        this.status = status;
    }

    // Getters
    public String getMachineId() {
        return machineId;
    }

    public String getStart() {
        return start;
    }

    public String getEnd() {
        return end;
    }

    public long getEventsCount() {
        return eventsCount;
    }

    public int getDefectsCount() {
        return defectsCount;
    }

    public double getAvgDefectRate() {
        return avgDefectRate;
    }

    public String getStatus() {
        return status;
    }
}
