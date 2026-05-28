package com.crm.service;

import com.crm.domain.Customer;
import com.crm.dto.CustomerRequest;
import com.crm.repository.AppUserRepository;
import com.crm.repository.CustomerRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private AppUserRepository userRepository;

    @InjectMocks
    private CustomerService customerService;

    @Test
    void listAllReturnsMappedCustomers() {
        Customer c = Customer.builder().id(1L).name("Acme").status("ACTIVE")
                .createdAt(Instant.parse("2026-01-01T00:00:00Z"))
                .updatedAt(Instant.parse("2026-01-01T00:00:00Z"))
                .build();
        when(customerRepository.findAll()).thenReturn(List.of(c));

        List<Map<String, Object>> rows = customerService.listAll();

        assertThat(rows).hasSize(1);
        assertThat(rows.get(0).get("name")).isEqualTo("Acme");
    }

    @Test
    void getThrowsWhenCustomerMissing() {
        when(customerRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerService.get(404L))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void createPersistsCustomerFromRequest() {
        CustomerRequest req = new CustomerRequest("New Co", "n@co.test", "555", "Co", "ACTIVE", null, "notes");
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> {
            Customer saved = inv.getArgument(0);
            saved.setId(10L);
            saved.setCreatedAt(Instant.parse("2026-01-02T00:00:00Z"));
            saved.setUpdatedAt(Instant.parse("2026-01-02T00:00:00Z"));
            return saved;
        });

        Map<String, Object> map = customerService.create(req);

        assertThat(map.get("id")).isEqualTo(10L);
        assertThat(map.get("name")).isEqualTo("New Co");
        verify(customerRepository).save(any(Customer.class));
    }
}
