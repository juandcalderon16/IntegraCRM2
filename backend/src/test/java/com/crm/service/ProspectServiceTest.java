package com.crm.service;

import com.crm.domain.Prospect;
import com.crm.dto.ProspectRequest;
import com.crm.repository.AppUserRepository;
import com.crm.repository.CustomerRepository;
import com.crm.repository.ProspectRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProspectServiceTest {

    @Mock
    private ProspectRepository prospectRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private AppUserRepository userRepository;

    @InjectMocks
    private ProspectService prospectService;

    @Test
    void listPipelineReturnsProspects() {
        Prospect p = Prospect.builder().id(1L).title("Deal A").stage("LEAD").currency("USD")
                .createdAt(Instant.parse("2026-01-01T00:00:00Z"))
                .updatedAt(Instant.parse("2026-01-01T00:00:00Z"))
                .build();
        when(prospectRepository.findAll()).thenReturn(List.of(p));

        List<Map<String, Object>> rows = prospectService.listPipeline();

        assertThat(rows).hasSize(1);
        assertThat(rows.get(0).get("title")).isEqualTo("Deal A");
        assertThat(rows.get(0).get("stage")).isEqualTo("LEAD");
    }

    @Test
    void createProspectFromRequest() {
        ProspectRequest req = new ProspectRequest("New Deal", null, "PROPOSAL", new BigDecimal("1000"), "USD", null, null);
        when(prospectRepository.save(any(Prospect.class))).thenAnswer(inv -> {
            Prospect saved = inv.getArgument(0);
            saved.setId(5L);
            saved.setCreatedAt(Instant.parse("2026-01-02T00:00:00Z"));
            saved.setUpdatedAt(Instant.parse("2026-01-02T00:00:00Z"));
            return saved;
        });

        Map<String, Object> map = prospectService.create(req);

        assertThat(map.get("id")).isEqualTo(5L);
        assertThat(map.get("stage")).isEqualTo("PROPOSAL");
        verify(prospectRepository).save(any(Prospect.class));
    }
}
