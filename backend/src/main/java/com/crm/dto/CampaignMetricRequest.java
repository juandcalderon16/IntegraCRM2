package com.crm.dto;

import java.math.BigDecimal;

public record CampaignMetricRequest(
        long impressions,
        long clicks,
        long conversions,
        long leadsGenerated,
        BigDecimal revenueAttributed
) {}
