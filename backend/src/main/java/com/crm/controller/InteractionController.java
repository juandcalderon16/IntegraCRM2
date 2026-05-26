package com.crm.controller;

import com.crm.dto.InteractionRequest;
import com.crm.service.InteractionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interactions")
@RequiredArgsConstructor
public class InteractionController {

    private final InteractionService interactionService;

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAuthority('interactions.read')")
    public List<Map<String, Object>> byCustomer(@PathVariable Long customerId) {
        return interactionService.byCustomer(customerId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('interactions.write')")
    public Map<String, Object> create(@Valid @RequestBody InteractionRequest req) {
        return interactionService.create(req);
    }
}
