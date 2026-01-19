package com.factory.events.model;

import java.util.ArrayList;
import java.util.List;

public class BatchResponse {
    private int accepted;
    private int deduped;
    private int updated;
    private int rejected;
    private List<RejectionDTO> rejections = new ArrayList<>();

    public void incrementAccepted() {
        accepted++;
    }

    public void incrementDeduped() {
        deduped++;
    }

    public void incrementUpdated() {
        updated++;
    }

    public void incrementRejected() {
        rejected++;
    }

    public void addRejection(String eventId, String reason) {
        rejections.add(new RejectionDTO(eventId, reason));
    }

    // Getters
    public int getAccepted() {
        return accepted;
    }

    public int getDeduped() {
        return deduped;
    }

    public int getUpdated() {
        return updated;
    }

    public int getRejected() {
        return rejected;
    }

    public List<RejectionDTO> getRejections() {
        return rejections;
    }

    public static class RejectionDTO {
        public String eventId;
        public String reason;

        public RejectionDTO(String eventId, String reason) {
            this.eventId = eventId;
            this.reason = reason;
        }
    }
}
