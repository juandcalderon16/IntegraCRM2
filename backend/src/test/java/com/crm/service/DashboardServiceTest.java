package com.crm.service;

import com.crm.dto.DashboardStatsDto;
import com.crm.repository.CustomerRepository;
import com.crm.repository.ProspectRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private ProspectRepository prospectRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void statsAggregatesRepositoryCounts() {
        when(customerRepository.countByStatus("ACTIVE")).thenReturn(14L);
        when(prospectRepository.countByStageNotIn(List.of("WON", "LOST"))).thenReturn(5L);
        when(prospectRepository.countByStage("WON")).thenReturn(3L);
        when(prospectRepository.sumAmountByStage("WON")).thenReturn(new BigDecimal("45000.00"));

        DashboardStatsDto stats = dashboardService.stats();

        assertThat(stats.activeCustomers()).isEqualTo(14L);
        assertThat(stats.openOpportunities()).isEqualTo(5L);
        assertThat(stats.closedWonDeals()).isEqualTo(3L);
        assertThat(stats.closedWonRevenue()).isEqualByComparingTo("45000.00");
        verify(customerRepository).countByStatus("ACTIVE");
    }

    @Test
    void statsUsesZeroWhenRevenueIsNull() {
        when(customerRepository.countByStatus("ACTIVE")).thenReturn(0L);
        when(prospectRepository.countByStageNotIn(List.of("WON", "LOST"))).thenReturn(0L);
        when(prospectRepository.countByStage("WON")).thenReturn(0L);
        when(prospectRepository.sumAmountByStage("WON")).thenReturn(null);

        DashboardStatsDto stats = dashboardService.stats();

        assertThat(stats.closedWonRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
