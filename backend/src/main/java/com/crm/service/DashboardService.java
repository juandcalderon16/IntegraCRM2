package com.crm.service;

import com.crm.dto.DashboardStatsDto;
import com.crm.repository.CustomerRepository;
import com.crm.repository.ProspectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final List<String> TERMINAL = List.of("WON", "LOST");

    private final CustomerRepository customerRepository;
    private final ProspectRepository prospectRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDto stats() {
        long active = customerRepository.countByStatus("ACTIVE");
        long open = prospectRepository.countByStageNotIn(TERMINAL);
        long won = prospectRepository.countByStage("WON");
        BigDecimal revenue = prospectRepository.sumAmountByStage("WON");
        if (revenue == null) {
            revenue = BigDecimal.ZERO;
        }
        return new DashboardStatsDto(active, open, won, revenue);
    }
}
