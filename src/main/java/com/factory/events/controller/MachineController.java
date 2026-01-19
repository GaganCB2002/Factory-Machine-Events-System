package com.factory.events.controller;

import com.factory.events.model.Machine;
import com.factory.events.repository.MachineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/machines")
@CrossOrigin(origins = "*") // Allow frontend access
public class MachineController {

    @Autowired
    private MachineRepository machineRepository;

    @GetMapping
    public List<Machine> getAllMachines() {
        return machineRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Machine> getMachine(@PathVariable String id) {
        return machineRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Machine saveMachine(@RequestBody Machine machine) {
        // Simple update or create logic
        machine.setLastUpdated(Instant.now());
        // Ensure ID is populated either from UI or generated.
        // For this use case, we assume the UI provides the identifying "Dept ID" or we
        // use a generated one if null.
        // Since UI provides "departmentId", we might use that as ID or generate one.
        // Let's defer to the entity's ID field. If UI doesn't send "id", we might want
        // to map departmentId to ID or auto-gen.

        // Data correction: Map deptId to ID if ID is missing but deptId exists (a
        // reasonable assumption for this specific app logic)
        if ((machine.getId() == null || machine.getId().isEmpty()) && machine.getDepartmentId() != null) {
            machine.setId(machine.getDepartmentId());
        }

        return machineRepository.save(machine);
    }
}
