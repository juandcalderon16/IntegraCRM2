package com.crm.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "crm.jwt")
public class JwtProperties {
    private String secret = "change-me";
    private long expirationMs = 86400000L;
}
