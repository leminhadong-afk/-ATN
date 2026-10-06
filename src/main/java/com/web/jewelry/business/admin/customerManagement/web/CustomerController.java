package com.web.jewelry.business.admin.customerManagement.web;

import com.web.jewelry.business.admin.customerManagement.service.CustomerManagementService;
import com.web.jewelry.dto.customerManagement.CreateCustomerDTO;
import com.web.jewelry.dto.customerManagement.CustomerNameResponse;
import com.web.jewelry.dto.customerManagement.CustomerStatisticsResponseDTO;
import com.web.jewelry.dto.customerManagement.FindByNameDTO;
import com.web.jewelry.dto.customerManagement.FindCustomerDTO;
import com.web.jewelry.dto.customerManagement.ListCustomerDTO;
import com.web.jewelry.dto.customerManagement.UpdateCustomerDTO;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin("*")
@AllArgsConstructor
@RestController
@RequestMapping("/admin/customerManagement")
public class CustomerController {
    private final CustomerManagementService customerManagementService;

    @PostMapping("/create")
    public ResponseEntity<String> createCustomerr(@Valid @RequestBody CreateCustomerDTO request) {
        try {
            String message = customerManagementService.createCustomer(request);
            return ResponseEntity.ok(message);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateCustomer(@RequestBody UpdateCustomerDTO request) {
        String responseMessage = customerManagementService.updateCustomer(request);
        return ResponseEntity.ok().body(responseMessage);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ListCustomerDTO>> searchCustomer(FindCustomerDTO request) {
        Page<ListCustomerDTO> response = customerManagementService.searchCustomer(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/searchByName")
    public ResponseEntity<List<CustomerNameResponse>> searchByName(FindByNameDTO name) {
        List<CustomerNameResponse> response = customerManagementService.searchByName(name);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/updateStatus")
    public ResponseEntity<String> updateStatusCustomer (@RequestParam String id, @RequestParam Integer deleteFlag) {
        return ResponseEntity.ok().body(customerManagementService.updateStatusCustomer( id, deleteFlag));
    }

    @GetMapping("/statistics")
    public ResponseEntity<CustomerStatisticsResponseDTO> getCustomerStatistics(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        return ResponseEntity.ok(customerManagementService.getCustomerStatistics(startDate, endDate));
    }

}
