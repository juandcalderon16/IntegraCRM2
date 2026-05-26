package com.crm.security;

import com.crm.config.SupabaseJwtProperties;
import com.crm.domain.AppUser;
import com.crm.repository.AppUserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final DatabaseUserDetailsService userDetailsService;
    private final SupabaseJwtProperties supabaseProps;
    private final AppUserRepository appUserRepository;

    private JwtDecoder supabaseDecoder;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (!StringUtils.hasText(header) || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        String token = header.substring(7).trim();
        try {
            Optional<CrmUserDetails> authUser = tryLocal(token);
            if (authUser.isEmpty() && StringUtils.hasText(supabaseProps.getJwkSetUri())) {
                authUser = trySupabase(token);
            }
            if (authUser.isEmpty()) {
                SecurityContextHolder.clearContext();
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
            CrmUserDetails details = authUser.get();
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(auth);
        } catch (Exception e) {
            log.debug("JWT invalid: {}", e.getMessage());
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        filterChain.doFilter(request, response);
    }

    private Optional<CrmUserDetails> tryLocal(String token) {
        try {
            JwtService.ParsedJwt parsed = jwtService.parseLocal(token);
            return Optional.of(userDetailsService.loadById(parsed.userId()));
        } catch (Exception e) {
            log.trace("Not a local JWT: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private Optional<CrmUserDetails> trySupabase(String token) {
        try {
            if (supabaseDecoder == null && StringUtils.hasText(supabaseProps.getIssuer())) {
                supabaseDecoder = JwtDecoders.fromIssuerLocation(supabaseProps.getIssuer());
            } else if (supabaseDecoder == null) {
                supabaseDecoder = NimbusJwtDecoder.withJwkSetUri(supabaseProps.getJwkSetUri()).build();
            }
            Jwt jwt = supabaseDecoder.decode(token);
            String sub = jwt.getSubject();
            String email = jwt.getClaimAsString("email");
            Optional<AppUser> user = appUserRepository.findBySupabaseUserId(sub);
            if (user.isEmpty() && StringUtils.hasText(email)) {
                user = appUserRepository.findByEmailIgnoreCase(email);
            }
            return user.map(CrmUserDetails::from);
        } catch (Exception e) {
            log.trace("Supabase JWT decode failed: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
