package com.example.dienlanh.config;

import com.example.dienlanh.model.User;
import com.example.dienlanh.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class SingleSessionFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    public SingleSessionFilter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) auth.getPrincipal();
            String email = jwt.getSubject();
            String lastLoginToken = jwt.getClaimAsString("lastLoginToken");

            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                // If token has a mismaching lastLoginToken (someone else logged in since)
                if (lastLoginToken == null || !lastLoginToken.equals(user.getLastLoginToken())) {
                    SecurityContextHolder.clearContext();
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"status\":\"error\",\"message\":\"Tài khoản của bạn đã được đăng nhập từ một thiết bị khác!\",\"code\":\"MULTIPLE_LOGINS\"}");
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
