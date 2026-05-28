package com.crm.security;

import com.crm.domain.AppUser;
import com.crm.domain.Permission;
import com.crm.domain.Role;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class CrmUserDetailsTest {

    @Test
    void fromBuildsDistinctPermissionCodes() {
        Permission p1 = Permission.builder().id(1L).code("customers.read").build();
        Permission p2 = Permission.builder().id(2L).code("customers.write").build();
        Role role = Role.builder().id(1L).name("VENDEDOR").permissions(Set.of(p1, p2)).build();
        AppUser user = AppUser.builder()
                .id(1L)
                .email("vendedor@crm.local")
                .fullName("Vendedor")
                .enabled(true)
                .roles(Set.of(role))
                .build();

        CrmUserDetails details = CrmUserDetails.from(user);

        assertThat(details.getPermissionCodes()).containsExactlyInAnyOrder("customers.read", "customers.write");
        assertThat(details.getAuthorities()).extracting("authority")
                .containsExactlyInAnyOrder("customers.read", "customers.write");
        assertThat(details.getUsername()).isEqualTo("vendedor@crm.local");
        assertThat(details.isEnabled()).isTrue();
    }

    @Test
    void constructorUsesProvidedPermissions() {
        AppUser user = AppUser.builder().id(2L).email("x@y.com").fullName("X").enabled(false).build();
        CrmUserDetails details = new CrmUserDetails(user, java.util.List.of("dashboard.view"));

        assertThat(details.getPermissionCodes()).containsExactly("dashboard.view");
        assertThat(details.isEnabled()).isFalse();
    }
}
