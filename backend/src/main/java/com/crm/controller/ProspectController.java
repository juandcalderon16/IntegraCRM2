package com.crm.controller;

import com.crm.dto.ProspectRequest;
import com.crm.service.ProspectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prospects")
@RequiredArgsConstructor
public class ProspectController {

    private final ProspectService prospectService;

    @GetMapping
    @PreAuthorize("hasAuthority('prospects.read')")
    public List<Map<String, Object>> list() {
        return prospectService.listPipeline();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('prospects.read')")
    public Map<String, Object> get(@PathVariable Long id) {
        return prospectService.get(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('prospects.write')")
    public Map<String, Object> create(@Valid @RequestBody ProspectRequest req) {
        return prospectService.create(req);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('prospects.write')")
    public Map<String, Object> update(@PathVariable Long id, @Valid @RequestBody ProspectRequest req) {
        return prospectService.update(id, req);
    }
}
