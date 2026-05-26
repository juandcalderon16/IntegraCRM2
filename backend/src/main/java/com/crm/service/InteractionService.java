package com.crm.service;

import com.crm.domain.Customer;
import com.crm.domain.Interaction;
import com.crm.domain.AppUser;
import com.crm.dto.InteractionRequest;
import com.crm.repository.AppUserRepository;
import com.crm.repository.CustomerRepository;
import com.crm.repository.InteractionRepository;
import com.crm.security.CrmUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InteractionService {

    private final InteractionRepository interactionRepository;
    private final CustomerRepository customerRepository;
    private final AppUserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> byCustomer(Long customerId) {
        return interactionRepository.findByCustomer_IdOrderByOccurredAtDesc(customerId).stream()
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> create(InteractionRequest req) {
        Customer customer = customerRepository.findById(req.customerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "customer not found"));
        AppUser actor = currentUserId().flatMap(userRepository::findById).orElse(null);
        Interaction i = Interaction.builder()
                .customer(customer)
                .user(actor)
                .type(req.type())
                .summary(req.summary())
                .occurredAt(req.occurredAt() != null ? req.occurredAt() : Instant.now())
                .build();
        return toMap(interactionRepository.save(i));
    }

    private Map<String, Object> toMap(Interaction i) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", i.getId());
        m.put("customerId", i.getCustomer().getId());
        m.put("userId", i.getUser() != null ? i.getUser().getId() : null);
        m.put("type", i.getType());
        m.put("summary", i.getSummary());
        m.put("occurredAt", i.getOccurredAt().toString());
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
