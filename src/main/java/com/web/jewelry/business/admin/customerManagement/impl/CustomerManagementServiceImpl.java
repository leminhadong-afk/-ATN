package com.web.jewelry.business.admin.customerManagement.impl;

import com.web.jewelry.business.admin.customerManagement.service.CustomerManagementService;
import com.web.jewelry.config.mailconfig.EmailSender;
import com.web.jewelry.dto.customerManagement.*;
import com.web.jewelry.entity.CustomerEntity;
import com.web.jewelry.repository.CustomerRepository;
import com.web.jewelry.repository.EmployeeRepository;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
@Validated
public class CustomerManagementServiceImpl implements CustomerManagementService {

    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final ModelMapper modelMapper;
    private final EmailSender emailSender;
    private final PasswordEncoder encoder;

    // gen code employee auto
    private String generateNewCode(String maxCode) {
        // Nếu maxCode là null, bắt đầu từ "EMP001"
        if (maxCode == null) {
            return "KH001";
        }

        // Lấy phần số từ maxCode và tăng nó lên 1
        int currentNumber = Integer.parseInt(maxCode.substring(3));
        int newNumber = currentNumber + 1;

        // Định dạng mã mới với "EMP" + số tự tăng, có đủ 3 chữ số
        return String.format("KH%03d", newNumber);
    }

    // Phương thức tạo mật khẩu ngẫu nhiên
    private String generateRandomPassword(int length) {
        String upperCaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz";
        String numbers = "0123456789";
        String specialCharacters = "!@#$%^&*()-_+=<>?";
        String allowedChars = upperCaseLetters + lowerCaseLetters + numbers + specialCharacters;

        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();

        for (int i = 0; i < length; i++) {
            int index = random.nextInt(allowedChars.length());
            password.append(allowedChars.charAt(index));
        }

        return password.toString();
    }

    @Override
    public String createCustomer(CreateCustomerDTO request) {
        // Kiểm tra email đã tồn tại
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email này đã tồn tại!");
        }
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email này đã tồn tại!");
        }

        // Lấy mã code cao nhất hiện có
        String maxCode = customerRepository.findMaxCode();
        String newCode = generateNewCode(maxCode);

        // Tạo mật khẩu ngẫu nhiên 8 ký tự
        String generatedPassword = generateRandomPassword(8);

        // Tạo CustomerEntity mới
        CustomerEntity customer = new CustomerEntity();
        customer.setCode(newCode);
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPassword(encoder.encode(generatedPassword));
        customer.setSex(request.getSex());
        customer.setAddress(request.getAddress());
        customer.setDateOfBirth(request.getDateOfBirth());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setDeleteFlag(0);

        // Lưu customer vào database
        customerRepository.save(customer);

        String htmlBody = "<p>Mật khẩu của bạn là:</p><br/><div style=\"text-align: center; font-weight: bold; font-size: 25px;\"><strong>" + generatedPassword + "</strong></div>";
        emailSender.sendEmail(new String[]{request.getEmail()}, "[ROYAL JEWELRY] Thông báo mật khẩu", "Thông báo mật khẩu sau khi đăng ký tài khoản", htmlBody);

        return "Tạo tài khoản khách hàng thành công!";
    }

    @Override
    public String updateCustomer(UpdateCustomerDTO request) {
        // Tìm kiếm nhân viên theo mã nhân viên (code)
        Optional<CustomerEntity> existingCustomerOpt = customerRepository.findByCode(request.getCode());
        if (!existingCustomerOpt.isPresent()) {
            return "Không tìm thấy tài khoản khách hàng với mã: " + request.getCode();
        }

        // Kiểm tra email trùng
        Optional<CustomerEntity> existingEmail = customerRepository.findByEmailAndIdNot(request.getCode(), request.getId());
        if (existingEmail.isPresent()) {
            throw new IllegalArgumentException("Email đã tồn tại với tài khoản khác");
        }

        CustomerEntity existingCustomer = existingCustomerOpt.get();
        existingCustomer.setName(request.getName());
        existingCustomer.setSex(request.getSex());
        existingCustomer.setAddress(request.getAddress());
        existingCustomer.setPhoneNumber(request.getPhoneNumber());
        existingCustomer.setEmail(request.getEmail());
        existingCustomer.setDateOfBirth(request.getDateOfBirth());
        existingCustomer.setDeleteFlag(request.getDeleteFlag());
        customerRepository.save(existingCustomer);

        return "Cập nhật tài khoản khách hàng thành công!";

    }

    @Override
    public Page<ListCustomerDTO> searchCustomer(FindCustomerDTO req) {
        Pageable pageable = PageRequest.of(req.getPage(), req.getSize());

        Page<CustomerRespone> pageResponse = customerRepository.getCustomerResponse(pageable, req);

        Page<ListCustomerDTO> pageDTO = pageResponse.map(customerRespone ->
                modelMapper.map(customerRespone, ListCustomerDTO.class)
        );

        return pageDTO;
    }

    @Override
    public String updateStatusCustomer(String id, Integer deleteFlag) {
        Optional<CustomerEntity> existingCustomer = customerRepository.findById(id);

        if (!existingCustomer.isPresent()) {
            throw new RuntimeException("Không tìm thấy khách hàng với id : " + id);
        }

        CustomerEntity customer = existingCustomer.get();
        customer.setDeleteFlag(deleteFlag);
        customerRepository.save(customer);

        return "Cập nhật trạng thái khách hàng thành công!";
    }

    @Override
    public List<CustomerNameResponse> searchByName(FindByNameDTO name) {
        return customerRepository.searchByName(name);
    }

    @Override
    public CustomerStatisticsResponseDTO getCustomerStatistics(String startDate, String endDate) {
        Long totalCustomers;
        
        // Nếu có dateRange, sử dụng nó, nếu không thì dùng tháng hiện tại
        if (startDate != null && endDate != null && !startDate.isEmpty() && !endDate.isEmpty()) {
            totalCustomers = customerRepository.getTotalCustomersByDateRange(startDate, endDate);
        } else {
            totalCustomers = customerRepository.getTotalCustomersThisMonth();
        }
        
        List<TopCustomerResponse> topCustomers = customerRepository.getTop3Customers();
        
        return new CustomerStatisticsResponseDTO(totalCustomers, topCustomers);
    }


}
