package com.crm.service;

import com.crm.domain.AppUser;
import com.crm.domain.Role;
import com.crm.dto.LoginRequest;
import com.crm.dto.LoginResponse;
import com.crm.security.CrmUserDetails;
import com.crm.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void loginReturnsTokenAndUserInfo() {
        Role role = Role.builder().id(1L).name("ADMIN").build();
        AppUser user = AppUser.builder()
                .id(1L)
                .email("admin@crm.local")
                .fullName("Admin")
                .enabled(true)
                .roles(Set.of(role))
                .build();
        CrmUserDetails details = new CrmUserDetails(user, List.of("users.manage", "dashboard.view"));
        Authentication auth = new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities());

        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(jwtService.createAccessToken(1L, "admin@crm.local", details.getPermissionCodes()))
                .thenReturn("jwt-token");

        LoginResponse response = authService.login(new LoginRequest("admin@crm.local", "password"));

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.user().email()).isEqualTo("admin@crm.local");
        assertThat(response.user().roles()).containsExactly("ADMIN");
        assertThat(response.user().permissions()).contains("dashboard.view", "users.manage");
    }
}
