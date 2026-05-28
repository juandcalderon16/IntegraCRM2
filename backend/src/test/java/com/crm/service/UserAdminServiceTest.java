package com.crm.service;

import com.crm.domain.AppUser;
import com.crm.domain.Role;
import com.crm.dto.UserAdminRequest;
import com.crm.repository.AppUserRepository;
import com.crm.repository.RoleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserAdminServiceTest {

    @Mock
    private AppUserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserAdminService userAdminService;

    @Test
    void createUserEncodesPasswordAndAssignsRoles() {
        Role vendedor = Role.builder().id(1L).name("VENDEDOR").build();
        UserAdminRequest req = new UserAdminRequest("new@crm.local", "secret", "Nuevo User", true, List.of("VENDEDOR"));

        when(userRepository.findByEmailIgnoreCase("new@crm.local")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("secret")).thenReturn("hash");
        when(roleRepository.findByName("VENDEDOR")).thenReturn(Optional.of(vendedor));
        when(userRepository.save(any(AppUser.class))).thenAnswer(inv -> {
            AppUser u = inv.getArgument(0);
            u.setId(99L);
            return u;
        });

        Map<String, Object> result = userAdminService.create(req);

        assertThat(result.get("id")).isEqualTo(99L);
        assertThat(result.get("email")).isEqualTo("new@crm.local");
        assertThat(result.get("roles")).isEqualTo(List.of("VENDEDOR"));
        verify(passwordEncoder).encode("secret");
    }

    @Test
    void createUserFailsWhenEmailExists() {
        when(userRepository.findByEmailIgnoreCase("dup@crm.local"))
                .thenReturn(Optional.of(AppUser.builder().id(1L).email("dup@crm.local").fullName("Dup").build()));

        assertThatThrownBy(() -> userAdminService.create(
                new UserAdminRequest("dup@crm.local", "x", "Dup", true, List.of("VENDEDOR"))))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("409");

        verify(userRepository, never()).save(any());
    }

    @Test
    void createUserFailsForUnknownRole() {
        when(userRepository.findByEmailIgnoreCase(anyString())).thenReturn(Optional.empty());
        when(roleRepository.findByName("INVALID")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userAdminService.create(
                new UserAdminRequest("x@crm.local", "p", "X", true, List.of("INVALID"))))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Unknown role");
    }

    @Test
    void getUserReturnsMapWhenFound() {
        AppUser user = AppUser.builder()
                .id(3L)
                .email("a@b.com")
                .fullName("A B")
                .enabled(true)
                .roles(Set.of(Role.builder().id(1L).name("GERENTE").build()))
                .build();
        when(userRepository.findById(3L)).thenReturn(Optional.of(user));

        Map<String, Object> map = userAdminService.getUser(3L);

        assertThat(map.get("fullName")).isEqualTo("A B");
        assertThat(map.get("roles")).isEqualTo(List.of("GERENTE"));
    }
}
