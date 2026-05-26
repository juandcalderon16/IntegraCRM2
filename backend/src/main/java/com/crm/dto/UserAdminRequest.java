package com.crm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record UserAdminRequest(
        @Email @NotBlank String email,
        String password,
        @NotBlank String fullName,
        boolean enabled,
        List<String> roleNames
) {}
