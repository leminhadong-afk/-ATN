package com.web.jewelry.config.security;

import com.web.jewelry.config.constant.classconstant.RoleConstants;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtTokenFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    private final UserDetailsServiceImpl userDetailsService;

    @Autowired
    public JwtTokenFilter(JwtTokenProvider jwtTokenProvider, UserDetailsServiceImpl userDetailsService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws IOException, ServletException {
        String jwtToken = extractJwtToken(request);

        response.setContentType("text/plain;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");

        if (isApiAuthRequest(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        if (jwtToken != null) {
            if (jwtTokenProvider.validateToken(jwtToken)) {
                String userName = jwtTokenProvider.getUserNameFromToken(jwtToken);
                String role = jwtTokenProvider.getRoleFromToken(jwtToken);

                UserDetailsImpl userDetails = null;

                if (RoleConstants.ROLE_CLIENT.equals(role)) {
                    userDetails = userDetailsService.loadCustomerByUsername(userName);
                } else {
                    userDetails = userDetailsService.loadUserByUsername(userName);
                }

                Authentication authentication = jwtTokenProvider.getAuthentication(jwtToken, userDetails, request);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
                return;
            }
        } else {
            // TODO JWT
//            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authorization token is required");
//            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isApiAuthRequest(HttpServletRequest request) {
        return request.getRequestURI().startsWith("/api/auth") ||
                request.getRequestURI().startsWith("/api/client/home") ||
                request.getRequestURI().startsWith("/api/admin/productDetail") ||
                request.getRequestURI().startsWith("/api/admin/customerManagement") ||
                request.getRequestURI().startsWith("/api/guest");
    }

    private String extractJwtToken(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authorizationHeader) && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        return null;
    }
}
