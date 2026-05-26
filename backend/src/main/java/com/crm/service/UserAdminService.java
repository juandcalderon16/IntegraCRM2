package com.crm.service;

import com.crm.domain.AppUser;
import com.crm.domain.Role;
import com.crm.dto.UserAdminRequest;
import com.crm.repository.AppUserRepository;
import com.crm.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserAdminService {

    private final AppUserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listUsers() {
        return userRepository.findAll().stream().map(this::toMap).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUser(Long id) {
        return userRepository.findById(id).map(this::toMap)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Map<String, Object> create(UserAdminRequest req) {
        if (userRepository.findByEmailIgnoreCase(req.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "email exists");
        }
        AppUser u = new AppUser();
        u.setEmail(req.email().trim().toLowerCase());
        u.setFullName(req.fullName());
        u.setEnabled(req.enabled());
        if (req.password() != null && !req.password().isBlank()) {
            u.setPasswordHash(passwordEncoder.encode(req.password()));
        }
        applyRoles(u, req.roleNames());
        return toMap(userRepository.save(u));
    }

    @Transactional
    public Map<String, Object> update(Long id, UserAdminRequest req) {
        AppUser u = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        u.setFullName(req.fullName());
        u.setEnabled(req.enabled());
        if (req.password() != null && !req.password().isBlank()) {
            u.setPasswordHash(passwordEncoder.encode(req.password()));
        }
        if (req.roleNames() != null) {
            u.getRoles().clear();
            applyRoles(u, req.roleNames());
        }
        return toMap(userRepository.save(u));
    }

    private void applyRoles(AppUser u, List<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            return;
        }
        for (String rn : new LinkedHashSet<>(roleNames)) {
            Role r = roleRepository.findByName(rn.trim())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown role: " + rn));
            u.getRoles().add(r);
        }
    }

    private Map<String, Object> toMap(AppUser u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", u.getId());
        m.put("email", u.getEmail());
        m.put("fullName", u.getFullName());
        m.put("enabled", u.isEnabled());
        m.put("supabaseUserId", u.getSupabaseUserId());
        m.put("roles", u.getRoles().stream().map(Role::getName).sorted().collect(Collectors.toList()));
        return m;
    }
}
