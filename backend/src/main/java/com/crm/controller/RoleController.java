package com.crm.controller;

import com.crm.domain.Role;
import com.crm.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleRepository roleRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('users.manage')")
    public List<Map<String, Object>> list() {
        return roleRepository.findAll().stream().sorted((a, b) -> a.getName().compareTo(b.getName())).map(this::toMap).collect(Collectors.toList());
    }

    private Map<String, Object> toMap(Role r) {
        return Map.of("id", r.getId(), "name", r.getName());
    }
}
