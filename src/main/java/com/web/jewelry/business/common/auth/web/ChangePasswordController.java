package com.web.jewelry.business.common.auth.web;

import com.web.jewelry.business.common.service.service.CommonService;
import com.web.jewelry.config.mailconfig.EmailSender;
import com.web.jewelry.entity.CustomerEntity;
import com.web.jewelry.repository.CustomerRepository;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@CrossOrigin("*")
@RestController
@RequestMapping("/customer")
public class ChangePasswordController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CommonService commonService;

    @Autowired
    private EmailSender emailSender;

    // OTP cache: email -> OTP
    private final Map<String, String> otpCache = new ConcurrentHashMap<>();

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ----------- ĐỔI MẬT KHẨU (CẦN MẬT KHẨU CŨ) -----------
    @PostMapping("/request-change-password-otp")
    public ResponseEntity<?> requestChangePasswordOtp(@RequestBody(required = false) OtpRequest request) {
        CustomerEntity customer = null;
        if (request != null && request.getCustomerId() != null && !request.getCustomerId().trim().isEmpty()) {
            customer = customerRepository.findById(request.getCustomerId().trim()).orElse(null);
        }
        if (customer == null) {
            customer = commonService.getCurrentCustomer();
        }
        if (customer == null) {
            return ResponseEntity.badRequest().body("Tài khoản không tồn tại hoặc phiên đăng nhập đã hết hạn");
        }
        String email = customer.getEmail();
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Không tìm thấy email của tài khoản");
        }
        String otp = generateOtp();
        otpCache.put(email, otp);

        log.info("==================================================");
        log.info("[OTP ĐỔI MẬT KHẨU] Email: {} | OTP: {}", email, otp);
        log.info("==================================================");

        String htmlBody = "<p>Mã OTP đổi mật khẩu của bạn là:</p><br/><div style=\"text-align: center; font-weight: bold; font-size: 25px;\"><strong>" + otp + "</strong></div>";
        emailSender.sendEmail(new String[]{email}, "[ROYAL JEWELRY] Mã OTP đổi mật khẩu", "OTP đổi mật khẩu", htmlBody);

        return ResponseEntity.ok("Đã gửi mã OTP về email " + email);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        CustomerEntity customer = null;
        if (request.getCustomerId() != null && !request.getCustomerId().trim().isEmpty()) {
            customer = customerRepository.findById(request.getCustomerId().trim()).orElse(null);
        }
        if (customer == null) {
            customer = commonService.getCurrentCustomer();
        }
        if (customer == null) {
            return ResponseEntity.badRequest().body("Tài khoản không tồn tại");
        }
        String email = customer.getEmail();
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Không tìm thấy email của tài khoản");
        }
        String cachedOtp = otpCache.get(email);
        String inputOtp = request.getOtp() != null ? request.getOtp().trim() : "";
        if (cachedOtp == null || !cachedOtp.equals(inputOtp)) {
            return ResponseEntity.badRequest().body("Mã OTP không đúng hoặc đã hết hạn");
        }

        // Kiểm tra mật khẩu cũ (hỗ trợ cả bcrypt và chuỗi thuần)
        boolean passwordMatches = false;
        if (customer.getPassword() != null) {
            if (customer.getPassword().startsWith("$2a$") || customer.getPassword().startsWith("$2b$") || customer.getPassword().startsWith("$2y$")) {
                passwordMatches = passwordEncoder.matches(request.getOldPassword(), customer.getPassword());
            } else {
                passwordMatches = customer.getPassword().equals(request.getOldPassword());
            }
        }
        if (!passwordMatches) {
            return ResponseEntity.badRequest().body("Mật khẩu cũ không đúng");
        }

        customer.setPassword(passwordEncoder.encode(request.getNewPassword()));
        customerRepository.save(customer);
        otpCache.remove(email);

        log.info("Đổi mật khẩu thành công cho tài khoản: {}", email);
        return ResponseEntity.ok("Đổi mật khẩu thành công");
    }

    // ----------- QUÊN MẬT KHẨU (KHÔNG CẦN MẬT KHẨU CŨ) -----------
    @PostMapping("/request-forgot-password-otp")
    public ResponseEntity<?> requestForgotPasswordOtp(@RequestBody ForgotPasswordOtpRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Vui lòng cung cấp email");
        }
        String email = request.getEmail().trim();
        CustomerEntity customer = customerRepository.findByEmail(email);
        if (customer == null) {
            return ResponseEntity.badRequest().body("Tài khoản không tồn tại với email này");
        }
        String otp = generateOtp();
        otpCache.put(email, otp);

        log.info("==================================================");
        log.info("[OTP QUÊN MẬT KHẨU] Email: {} | OTP: {}", email, otp);
        log.info("==================================================");

        String htmlBody = "<p>Mã OTP lấy lại mật khẩu của bạn là:</p><br/><div style=\"text-align: center; font-weight: bold; font-size: 25px;\"><strong>" + otp + "</strong></div>";
        emailSender.sendEmail(new String[]{email}, "[ROYAL JEWELRY] Mã OTP quên mật khẩu", "OTP quên mật khẩu", htmlBody);

        return ResponseEntity.ok("Đã gửi mã OTP về email");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Vui lòng cung cấp email");
        }
        String email = request.getEmail().trim();
        CustomerEntity customer = customerRepository.findByEmail(email);
        if (customer == null) {
            return ResponseEntity.badRequest().body("Tài khoản không tồn tại với email này");
        }
        String cachedOtp = otpCache.get(email);
        String inputOtp = request.getOtp() != null ? request.getOtp().trim() : "";
        if (cachedOtp == null || !cachedOtp.equals(inputOtp)) {
            return ResponseEntity.badRequest().body("Mã OTP không đúng hoặc đã hết hạn");
        }
        customer.setPassword(passwordEncoder.encode(request.getNewPassword()));
        customerRepository.save(customer);
        otpCache.remove(email);

        log.info("Đặt lại mật khẩu thành công cho tài khoản: {}", email);
        return ResponseEntity.ok("Đặt lại mật khẩu thành công");
    }

    private String generateOtp() {
        String numbers = "0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            otp.append(numbers.charAt(random.nextInt(numbers.length())));
        }
        return otp.toString();
    }

    @Data
    public static class OtpRequest {
        private String customerId;
    }

    @Data
    public static class ChangePasswordRequest {
        private String customerId;
        private String oldPassword;
        private String newPassword;
        private String otp;
    }

    @Data
    public static class ForgotPasswordOtpRequest {
        private String email;
    }

    @Data
    public static class ForgotPasswordRequest {
        private String email;
        private String newPassword;
        private String otp;
    }
}

