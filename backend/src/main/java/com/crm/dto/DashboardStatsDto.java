package com.crm.dto;

import java.math.BigDecimal;

public record DashboardStatsDto(
        long activeCustomers,
        long openOpportunities,
        long closedWonDeals,
        BigDecimal closedWonRevenue
) {}
