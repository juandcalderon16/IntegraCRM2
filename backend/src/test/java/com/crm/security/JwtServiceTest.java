package com.crm.security;

import com.crm.config.JwtProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        JwtProperties props = new JwtProperties();
        props.setSecret("test-secret-key-with-enough-length-for-hs256");
        props.setExpirationMs(3600000L);
        jwtService = new JwtService(props);
    }

    @Test
    void createAndParseTokenRoundTrip() {
        String token = jwtService.createAccessToken(42L, "user@crm.local", List.of("customers.read", "dashboard.view"));

        JwtService.ParsedJwt parsed = jwtService.parseLocal(token);

        assertThat(parsed.userId()).isEqualTo(42L);
        assertThat(parsed.email()).isEqualTo("user@crm.local");
        assertThat(parsed.permissions()).containsExactlyInAnyOrder("customers.read", "dashboard.view");
    }

    @Test
    void parseTokenWithShortSecretPadsKey() {
        JwtProperties props = new JwtProperties();
        props.setSecret("short");
        props.setExpirationMs(3600000L);
        JwtService service = new JwtService(props);

        String token = service.createAccessToken(1L, "a@b.com", List.of());
        JwtService.ParsedJwt parsed = service.parseLocal(token);

        assertThat(parsed.userId()).isEqualTo(1L);
        assertThat(parsed.permissions()).isEmpty();
    }
}
