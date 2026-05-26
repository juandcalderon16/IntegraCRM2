package com.crm.controller;

import com.crm.dto.CustomerRequest;
import com.crm.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @PreAuthorize("hasAuthority('customers.read')")
    public List<Map<String, Object>> list() {
        return customerService.listAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('customers.read')")
    public Map<String, Object> get(@PathVariable Long id) {
        return customerService.get(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('customers.write')")
    public Map<String, Object> create(@Valid @RequestBody CustomerRequest req) {
        return customerService.create(req);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('customers.write')")
    public Map<String, Object> update(@PathVariable Long id, @Valid @RequestBody CustomerRequest req) {
        return customerService.update(id, req);
    }
}
