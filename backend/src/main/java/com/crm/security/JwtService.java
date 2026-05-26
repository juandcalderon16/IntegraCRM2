package com.crm.security;

import com.crm.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtProperties props;

    public String createAccessToken(Long userId, String email, List<String> permissionCodes) {
        long now = System.currentTimeMillis();
        SecretKey key = Keys.hmacShaKeyFor(padSecret(props.getSecret()).getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("perms", permissionCodes)
                .issuedAt(new Date(now))
                .expiration(new Date(now + props.getExpirationMs()))
                .signWith(key)
                .compact();
    }

    public ParsedJwt parseLocal(String token) {
        SecretKey key = Keys.hmacShaKeyFor(padSecret(props.getSecret()).getBytes(StandardCharsets.UTF_8));
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        List<String> perms = claims.get("perms", List.class);
        if (perms == null) {
            perms = List.of();
        } else {
            perms = perms.stream().map(Object::toString).collect(Collectors.toList());
        }
        return new ParsedJwt(Long.parseLong(claims.getSubject()), claims.get("email", String.class), perms);
    }

    /** jjwt requires key length >= 256 bits for HS256 */
    private static String padSecret(String secret) {
        if (secret.length() >= 32) {
            return secret;
        }
        return secret.repeat((32 / secret.length()) + 1).substring(0, 32);
    }

    public record ParsedJwt(Long userId, String email, List<String> permissions) {}
}
