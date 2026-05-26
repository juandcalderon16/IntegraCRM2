package com.crm.dto;

import jakarta.validation.constraints.NotBlank;

public record CustomerRequest(
        @NotBlank String name,
        String email,
        String phone,
        String company,
        String status,
        Long ownerUserId,
        String notes
) {}
