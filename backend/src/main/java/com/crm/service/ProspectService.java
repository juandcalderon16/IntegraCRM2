package com.crm.service;

import com.crm.domain.Customer;
import com.crm.domain.Prospect;
import com.crm.domain.AppUser;
import com.crm.dto.ProspectRequest;
import com.crm.repository.AppUserRepository;
import com.crm.repository.CustomerRepository;
import com.crm.repository.ProspectRepository;
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
public class ProspectService {

    private final ProspectRepository prospectRepository;
    private final CustomerRepository customerRepository;
    private final AppUserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listPipeline() {
        return prospectRepository.findAll().stream().map(this::toMap).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> get(Long id) {
        return prospectRepository.findById(id).map(this::toMap)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Map<String, Object> create(ProspectRequest req) {
        Prospect p = new Prospect();
        apply(p, req);
        if (p.getOwner() == null) {
            currentUserId().flatMap(userRepository::findById).ifPresent(p::setOwner);
        }
        return toMap(prospectRepository.save(p));
    }

    @Transactional
    public Map<String, Object> update(Long id, ProspectRequest req) {
        Prospect p = prospectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        apply(p, req);
        return toMap(prospectRepository.save(p));
    }

    private void apply(Prospect p, ProspectRequest req) {
        p.setTitle(req.title());
        p.setStage(req.stage());
        p.setAmount(req.amount());
        if (req.currency() != null) {
            p.setCurrency(req.currency());
        }
        p.setExpectedCloseDate(req.expectedCloseDate());
        if (req.customerId() != null) {
            Customer c = customerRepository.findById(req.customerId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "customer not found"));
            p.setCustomer(c);
        } else {
            p.setCustomer(null);
        }
        if (req.ownerUserId() != null) {
            AppUser owner = userRepository.findById(req.ownerUserId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "owner not found"));
            p.setOwner(owner);
        }
    }

    private Map<String, Object> toMap(Prospect p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.getId());
        m.put("title", p.getTitle());
        m.put("customerId", p.getCustomer() != null ? p.getCustomer().getId() : null);
        m.put("stage", p.getStage());
        m.put("amount", p.getAmount());
        m.put("currency", p.getCurrency());
        m.put("ownerUserId", p.getOwner() != null ? p.getOwner().getId() : null);
        m.put("expectedCloseDate", p.getExpectedCloseDate() != null ? p.getExpectedCloseDate().toString() : null);
        m.put("createdAt", p.getCreatedAt().toString());
        m.put("updatedAt", p.getUpdatedAt().toString());
        return m;
    }

    private java.util.Optional<Long> currentUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CrmUserDetails d) {
            return java.util.Optional.of(d.getUser().getId());
        }
        return java.util.Optional.empty();
    }
}
