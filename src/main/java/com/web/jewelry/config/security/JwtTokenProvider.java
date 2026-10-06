package com.web.jewelry.config.security;

import com.web.jewelry.config.constant.classconstant.JTokenConstants;
import com.web.jewelry.config.constant.classconstant.RoleConstants;
import com.web.jewelry.entity.CustomerEntity;
import com.web.jewelry.entity.EmployeeEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.Objects;

@Component
public class JwtTokenProvider {

    @Value("${app.secretKey}")
    private String secretKey;

    @Value("${app.jwtExpirationMs}")
    private int jwtExpirationMs;

    public String generateTokenEmployee(EmployeeEntity employeeEntity) {
        Date now = new Date();
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(now);
        calendar.add(Calendar.SECOND, jwtExpirationMs);
        Date expiryDate = calendar.getTime();
        String token = Jwts.builder()
                .setSubject(employeeEntity.getEmail())
                .claim(JTokenConstants.AVATAR, Objects.isNull(employeeEntity.getAvatar()) ? "" : employeeEntity.getAvatar())
                .claim(JTokenConstants.ROLE, employeeEntity.getRole())
                .claim(JTokenConstants.NAME, employeeEntity.getName())
                .claim(JTokenConstants.CODE, employeeEntity.getCode())
                .claim(JTokenConstants.EMAIL, employeeEntity.getEmail())
                .claim(JTokenConstants.ID, employeeEntity.getId())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(SignatureAlgorithm.HS512, key())
                .compact();
        return token;
    }

    public String generateTokenCustomer(CustomerEntity customerEntity) {
        Date now = new Date();
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(now);
        calendar.add(Calendar.SECOND, jwtExpirationMs);
        Date expiryDate = calendar.getTime();
        String token = Jwts.builder()
                .setSubject(customerEntity.getEmail())
                .claim(JTokenConstants.AVATAR, Objects.isNull(customerEntity.getAvatar()) ? "" : customerEntity.getAvatar())
                .claim(JTokenConstants.ROLE, RoleConstants.ROLE_CLIENT)
                .claim(JTokenConstants.NAME, customerEntity.getName())
                .claim(JTokenConstants.CODE, customerEntity.getCode())
                .claim(JTokenConstants.EMAIL, customerEntity.getEmail())
                .claim(JTokenConstants.ID, customerEntity.getId())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(SignatureAlgorithm.HS512, key())
                .compact();
        return token;
    }

    public Authentication getAuthentication(String token, UserDetails userDetails, HttpServletRequest httpServletRequest) {
        Claims claims = parseTokenClaims(token);
        String role = claims.get(JTokenConstants.ROLE, String.class);
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role);
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null, Collections.singletonList(authority));
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(httpServletRequest));
        return authentication;
    }

    public boolean validateToken(String token) {
        try {
            Jws<Claims> claims = Jwts.parserBuilder()
                    .setSigningKey(key())
                    .build()
                    .parseClaimsJws(token);

            Date expirationDate = claims.getBody().getExpiration();
            if (expirationDate.before(new Date())) {
                return false;
            }

            return true;
        } catch (JwtException | IllegalArgumentException e) {
            e.printStackTrace();
            return false;
        }
    }

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    private Claims parseTokenClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String getUserNameFromToken(String token) {
        return parseTokenClaims(token).getSubject();
    }

    public String getRoleFromToken(String token) {
        return parseTokenClaims(token).get(JTokenConstants.ROLE, String.class);
    }

}
