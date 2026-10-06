package com.web.jewelry.business.common.auth.web;

import com.web.jewelry.config.security.JwtTokenProvider;
import com.web.jewelry.config.security.UserDetailsImpl;
import com.web.jewelry.dto.auth.LoginRequestDTO;
import com.web.jewelry.dto.auth.LoginResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final com.web.jewelry.config.security.UserDetailsServiceImpl userDetailsService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        try {
            UserDetailsImpl principal = userDetailsService.loadUserByUsername(request.getEmail());
            if (!passwordEncoder.matches(request.getPassword(), principal.getPassword())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
            }

            SecurityContextHolder.getContext().setAuthentication(null);

            com.web.jewelry.entity.EmployeeEntity employee = new com.web.jewelry.entity.EmployeeEntity();
            employee.setId(principal.getId());
            employee.setEmail(principal.getEmail());
            employee.setCode(principal.getCode());
            employee.setName(principal.getUsername());
            employee.setRole(com.web.jewelry.config.constant.enumconstant.Role.valueOf(principal.getRole()));

            String token = jwtTokenProvider.generateTokenEmployee(employee);

            LoginResponseDTO response = new LoginResponseDTO(
                    token,
                    principal.getRole(),
                    principal.getEmail(),
                    principal.getUsername(),
                    "",
                    principal.getId(),
                    principal.getCode()
            );
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication failed");
        }
    }

}


