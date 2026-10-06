package com.web.jewelry.business.common.service.impl;

import com.web.jewelry.business.common.service.service.CommonService;
import com.web.jewelry.config.security.UserDetailsImpl;
import com.web.jewelry.entity.CustomerEntity;
import com.web.jewelry.entity.EmployeeEntity;
import com.web.jewelry.repository.CustomerRepository;
import com.web.jewelry.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommonServiceImpl implements CommonService {

    private final EmployeeRepository employeeRepository;
    private final CustomerRepository customerRepository;

    @Override
    public EmployeeEntity getCurrentEmployee() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof String) {
                return null;
            }
            UserDetailsImpl userDetails = (UserDetailsImpl) principal;
            String email = userDetails.getUsername();
            return employeeRepository.findByEmailAndDeleteFlagFalse(email);
        }
        return null;
    }

    @Override
    public CustomerEntity getCurrentCustomer() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof String) {
                return null;
            }
            UserDetailsImpl userDetails = (UserDetailsImpl) principal;
            String email = userDetails.getUsername();
            return customerRepository.findByEmailAndDeleteFlagFalse(email);
        }
        return null;
    }
}
