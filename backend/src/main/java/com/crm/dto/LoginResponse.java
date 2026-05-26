package com.crm.dto;

import java.util.List;

public record LoginResponse(String token, UserInfo user) {

    public record UserInfo(Long id, String email, String fullName, List<String> roles, List<String> permissions) {}
}
