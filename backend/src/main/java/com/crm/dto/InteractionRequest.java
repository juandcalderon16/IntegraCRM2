package com.crm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record InteractionRequest(
        @NotNull Long customerId,
        @NotBlank String type,
        @NotBlank String summary,
        Instant occurredAt
) {}
