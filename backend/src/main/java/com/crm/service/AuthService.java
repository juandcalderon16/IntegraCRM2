package com.crm.service;

import com.crm.dto.LoginRequest;
import com.crm.dto.LoginResponse;
import com.crm.security.CrmUserDetails;
import com.crm.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email().trim(), req.password()));
        CrmUserDetails details = (CrmUserDetails) auth.getPrincipal();
        var user = details.getUser();
        var roles = user.getRoles().stream().map(r -> r.getName()).sorted().collect(Collectors.toList());
        String token = jwtService.createAccessToken(user.getId(), user.getEmail(), details.getPermissionCodes());
        var info = new LoginResponse.UserInfo(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                roles,
                details.getPermissionCodes().stream().sorted().collect(Collectors.toList()));
        return new LoginResponse(token, info);
    }
}
