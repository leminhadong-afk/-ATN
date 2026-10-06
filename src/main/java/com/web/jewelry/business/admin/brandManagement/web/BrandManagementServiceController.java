package com.web.jewelry.business.admin.brandManagement.web;

import com.web.jewelry.dto.brandManagement.CreateBrandRequestDTO;
import com.web.jewelry.dto.brandManagement.UpdateBrandRequestDTO;
import com.web.jewelry.business.admin.brandManagement.service.BrandManagementService;
import com.web.jewelry.dto.brandManagement.UpdateDeleteFlagRequestDTO;
import com.web.jewelry.entity.BrandEntity;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin("*")
@RequiredArgsConstructor
@RestController
@RequestMapping("/admin/brandManagement")
public class BrandManagementServiceController {
    private final BrandManagementService brandManagementService;

    @PostMapping("/create")
    public ResponseEntity<String> createBrand(@Valid @RequestBody CreateBrandRequestDTO request) {
        System.out.println("Received request: " + request);
        try {
            boolean isCreated = brandManagementService.createBrand(request);
            if (isCreated) {
                return ResponseEntity.status(HttpStatus.CREATED).body("Thêm Brand thành công!");
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Thêm Brand thất bại!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateBrand(@Valid @RequestBody UpdateBrandRequestDTO updateRequest) {
        try {
            boolean isUpdated = brandManagementService.updateBrandRequest(updateRequest);
            if (isUpdated) {
                return ResponseEntity.ok("Cập nhật Brand thành công!");
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cập nhật Brand thất bại!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/updateDeleteFlag")
    public ResponseEntity<String> updateDeleteFlag(@Valid @RequestBody UpdateDeleteFlagRequestDTO request) {
        String result = brandManagementService.updateDeleteFlag(request);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/updateStatus")
    public ResponseEntity<String> updateStatus(@RequestParam String id, @RequestParam Integer status) {
        String result = brandManagementService.updateStatus(id, status);
        return ResponseEntity.ok(result);
    }



    @DeleteMapping("delete/{id}")
    public ResponseEntity<String> deleteBrand(@PathVariable String id) {
        String result = brandManagementService.deleteBrandRequestDTO(id);
        return ResponseEntity.ok(result); // Returns 200 OK with the message
    }

    @GetMapping("get-all-brand")
    public ResponseEntity<List<BrandEntity>> getAllBrand() {
        List<BrandEntity> brands = brandManagementService.getAllBrand();
        return new ResponseEntity<>(brands,HttpStatus.OK);
    }


}
