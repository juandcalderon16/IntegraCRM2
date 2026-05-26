package com.crm.security;

import com.crm.domain.AppUser;
import com.crm.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DatabaseUserDetailsService implements UserDetailsService {

    private final AppUserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AppUser user = userRepository.findByEmailIgnoreCase(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));
        return CrmUserDetails.from(user);
    }

    @Transactional(readOnly = true)
    public CrmUserDetails loadById(Long id) {
        AppUser user = userRepository.findById(id).orElseThrow(() -> new UsernameNotFoundException(String.valueOf(id)));
        return CrmUserDetails.from(user);
    }
}
