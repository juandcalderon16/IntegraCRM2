package com.crm.dto;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProspectRequest(
        @NotBlank String title,
        Long customerId,
        @NotBlank String stage,
        BigDecimal amount,
        String currency,
        Long ownerUserId,
        LocalDate expectedCloseDate
) {}
