package com.factory.events.model;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class TopDefectLine {
    private String lineId;
    private int totalDefects;
    private int eventCount;
    private BigDecimal defectsPercent;

    public TopDefectLine(String lineId, int totalDefects, int eventCount) {
        this.lineId = lineId;
        this.totalDefects = totalDefects;
        this.eventCount = eventCount;
        this.defectsPercent = calculatePercent(totalDefects, eventCount);
    }

    private BigDecimal calculatePercent(int defects, int total) {
        if (total == 0)
            return BigDecimal.ZERO;
        return BigDecimal.valueOf((double) defects / total * 100)
                .setScale(2, RoundingMode.HALF_UP);
    }

    // Getters
    public String getLineId() {
        return lineId;
    }

    public int getTotalDefects() {
        return totalDefects;
    }

    public int getEventCount() {
        return eventCount;
    }

    public BigDecimal getDefectsPercent() {
        return defectsPercent;
    }
}
