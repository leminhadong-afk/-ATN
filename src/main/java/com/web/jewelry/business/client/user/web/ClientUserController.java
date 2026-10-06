package com.web.jewelry.business.client.user.web;

import com.web.jewelry.business.client.user.response.CustomerInfoResponse;
import com.web.jewelry.business.client.user.service.ClientUserService;
import com.web.jewelry.dto.customerManagement.UpdateCustomerInfoDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/client/user")
@RequiredArgsConstructor
public class ClientUserController {
    private final ClientUserService clientUserService;

    @GetMapping("/info")
    public ResponseEntity<CustomerInfoResponse> getCustomerInfo() {
        CustomerInfoResponse response = clientUserService.getCustomerInfo();
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateCustomerInfo(@Valid @RequestBody UpdateCustomerInfoDTO request) {
        String responseMessage = clientUserService.updateCustomerInfo(request);
        return ResponseEntity.ok().body(responseMessage);
    }
}

