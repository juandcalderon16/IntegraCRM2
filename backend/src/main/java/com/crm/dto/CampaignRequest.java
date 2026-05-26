package com.crm.dto;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CampaignRequest(
        @NotBlank String name,
        String channel,
        String status,
        BigDecimal budget,
        LocalDate startDate,
        LocalDate endDate,
        String description
) {}
