package com.web.jewelry.business.admin.couponManagement.web;

import com.web.jewelry.business.admin.couponManagement.service.CouponService;
import com.web.jewelry.dto.couponManagement.CreateCouponDTO;
import com.web.jewelry.dto.couponManagement.FindCouponDTO;
import com.web.jewelry.dto.couponManagement.ListCouponDTO;
import com.web.jewelry.dto.couponManagement.UpdateCouponDTO;
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
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin("*")
@AllArgsConstructor
@RestController
@RequestMapping("/admin/couponManagement")
public class CouponController {
    private final CouponService couponService;

    @PostMapping("/create")
    public ResponseEntity<String> createCoupon(@Valid @RequestBody CreateCouponDTO request) {
        try {
            String message = couponService.createCoupon(request);
            return ResponseEntity.ok(message);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ListCouponDTO>> searchCoupon (FindCouponDTO request){
        Page<ListCouponDTO> response = couponService.searchCoupon(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateCoupon(@RequestBody UpdateCouponDTO request) {
        try {
            String result = couponService.updateCoupon(request);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
