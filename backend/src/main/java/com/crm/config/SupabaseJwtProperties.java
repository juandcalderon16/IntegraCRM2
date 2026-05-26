package com.crm.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "crm.supabase")
public class SupabaseJwtProperties {
    /** JWKS URL, ej. https://PROJECT.supabase.co/auth/v1/.well-known/jwks.json */
    private String jwkSetUri = "";
    private String issuer = "";
}
