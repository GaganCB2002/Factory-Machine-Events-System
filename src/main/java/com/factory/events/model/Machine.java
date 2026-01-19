package com.factory.events.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

@Entity
@Table(name = "machines")
public class Machine {

    @Id
    @NotNull
    private String id; // This corresponds to "Department ID" or "Machine ID", effectively the unique
                       // identifier in this context

    private String name;
    private String serialNumber;
    private String department;
    private String departmentId; // Keeping this distinct if 'id' is internal, but logic suggests this might be
                                 // the same.
                                 // However, observing the UI: "Machine Name", "Serial", "Department", "Dept ID".
                                 // Often Dept ID is just a string. I will store all fields mapping 1:1 to UI.

    private Instant lastUpdated;

    public Machine() {
    }

    public Machine(String id, String name, String serialNumber, String department, String departmentId) {
        this.id = id;
        this.name = name;
        this.serialNumber = serialNumber;
        this.department = department;
        this.departmentId = departmentId;
        this.lastUpdated = Instant.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }

    public Instant getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Instant lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
