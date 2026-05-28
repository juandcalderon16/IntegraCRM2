package com.crm.service;

import com.crm.domain.AppUser;
import com.crm.domain.Customer;
import com.crm.dto.CustomerRequest;
import com.crm.repository.AppUserRepository;
import com.crm.repository.CustomerRepository;
import com.crm.security.CrmUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final AppUserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listAll() {
        return customerRepository.findAll().stream().map(this::toMap).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> get(Long id) {
        return customerRepository.findById(id).map(this::toMap)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Map<String, Object> create(CustomerRequest req) {
        Customer c = new Customer();
        apply(c, req);
        if (c.getOwner() == null) {
            currentUser().ifPresent(c::setOwner);
        }
        return toMap(customerRepository.save(c));
    }

    @Transactional
    public Map<String, Object> update(Long id, CustomerRequest req) {
        Customer c = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        apply(c, req);
        return toMap(customerRepository.save(c));
    }

    private void apply(Customer c, CustomerRequest req) {
        c.setName(req.name());
        c.setEmail(req.email());
        c.setPhone(req.phone());
        c.setCompany(req.company());
        if (req.status() != null) {
            c.setStatus(req.status());
        }
        c.setNotes(req.notes());
        if (req.ownerUserId() != null) {
            AppUser owner = userRepository.findById(req.ownerUserId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "owner not found"));
            c.setOwner(owner);
        }
    }

    private Map<String, Object> toMap(Customer c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("name", c.getName());
        m.put("email", c.getEmail() != null ? c.getEmail() : "");
        m.put("phone", c.getPhone() != null ? c.getPhone() : "");
        m.put("company", c.getCompany() != null ? c.getCompany() : "");
        m.put("status", c.getStatus());
        m.put("ownerUserId", c.getOwner() != null ? c.getOwner().getId() : null);
        m.put("notes", c.getNotes() != null ? c.getNotes() : "");
        m.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
        m.put("updatedAt", c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : null);
        return m;
    }

    private java.util.Optional<AppUser> currentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CrmUserDetails d) {
            return userRepository.findById(d.getUser().getId());
        }
        return java.util.Optional.empty();
    }
}
