package com.crm.controller;

import com.crm.dto.UserAdminRequest;
import com.crm.service.UserAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserAdminController {

    private final UserAdminService userAdminService;

    @GetMapping
    @PreAuthorize("hasAuthority('users.manage')")
    public List<Map<String, Object>> list() {
        return userAdminService.listUsers();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('users.manage')")
    public Map<String, Object> get(@PathVariable Long id) {
        return userAdminService.getUser(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('users.manage')")
    public Map<String, Object> create(@Valid @RequestBody UserAdminRequest req) {
        return userAdminService.create(req);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('users.manage')")
    public Map<String, Object> update(@PathVariable Long id, @Valid @RequestBody UserAdminRequest req) {
        return userAdminService.update(id, req);
    }
}
