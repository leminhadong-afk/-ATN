package com.web.jewelry.business.client.user.impl;

import com.web.jewelry.business.client.user.response.CustomerInfoResponse;
import com.web.jewelry.business.client.user.service.ClientUserService;
import com.web.jewelry.business.common.service.service.CommonService;
import com.web.jewelry.dto.customerManagement.UpdateCustomerInfoDTO;
import com.web.jewelry.entity.CustomerEntity;
import com.web.jewelry.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientUserServiceImpl implements ClientUserService {
    private final CommonService commonService;
    private final CustomerRepository customerRepository;

    @Override
    public CustomerInfoResponse getCustomerInfo() {
        CustomerEntity customer = commonService.getCurrentCustomer();
        if (customer == null) {
            return null;
        }
        CustomerInfoResponse response = new CustomerInfoResponse();
        response.setId(customer.getId());
        response.setCode(customer.getCode());
        response.setName(customer.getName());
        response.setDateOfBirth(customer.getDateOfBirth());
        response.setPhoneNumber(customer.getPhoneNumber());
        response.setEmail(customer.getEmail());
        response.setSex(customer.getSex());
        response.setAddress(customer.getAddress());
        response.setAvatar(customer.getAvatar());
        return response;
    }

    @Override
    public String updateCustomerInfo(UpdateCustomerInfoDTO request) {
        CustomerEntity customer = commonService.getCurrentCustomer();
        if (customer == null) {
            throw new IllegalArgumentException("Không tìm thấy thông tin người dùng");
        }

        // Update customer information
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            customer.setName(request.getName().trim());
        }
        if (request.getDateOfBirth() != null) {
            customer.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            customer.setPhoneNumber(request.getPhoneNumber().trim());
        }
        if (request.getSex() != null) {
            customer.setSex(request.getSex());
        }
        if (request.getAddress() != null) {
            customer.setAddress(request.getAddress().trim());
        }
        if (request.getAvatar() != null && !request.getAvatar().trim().isEmpty()) {
            customer.setAvatar(request.getAvatar().trim());
        }

        customerRepository.save(customer);
        return "Cập nhật thông tin thành công!";
    }
}
