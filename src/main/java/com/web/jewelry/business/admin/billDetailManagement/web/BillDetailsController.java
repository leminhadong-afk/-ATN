package com.web.jewelry.business.admin.billDetailManagement.web;

import com.web.jewelry.business.admin.billDetailManagement.request.UpdateStatusBillDTO;
import com.web.jewelry.business.admin.billDetailManagement.service.BillDetailService;
import com.web.jewelry.dto.billDetailManagement.CreateBillDetailDTO;
import com.web.jewelry.dto.billDetailManagement.ListBillDetailDTO;
import com.web.jewelry.dto.billDetailManagement.SoldProductSummaryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin("*")
@RequiredArgsConstructor
@RestController
@RequestMapping("/admin/billDetailsManagement")
public class BillDetailsController {
    private final BillDetailService billDetailService;

    @GetMapping("/infoBillDetails/{id}")
    public ResponseEntity<List<ListBillDetailDTO>> getBillDetails(@PathVariable("id") String id) {
        Integer deleteFlag = 0;
        List<ListBillDetailDTO> billDetails = billDetailService.getBillDetails(id, deleteFlag);
        return new ResponseEntity<>(billDetails, HttpStatus.OK);
    }

    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestBody CreateBillDetailDTO request) {
        return ResponseEntity.ok().body(billDetailService.createBillDetail(request));
    }

    @PutMapping("/updateDeleteFlag/{id}")
    public ResponseEntity<String> updateDeleteFlag(@PathVariable String id) {
        String result = billDetailService.updateDeleteFlag(id);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/update-status")
    public ResponseEntity<String> updateDeleteFlag(@RequestBody UpdateStatusBillDTO request) {
        String result = billDetailService.updateBillStatusAndHistory(request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/sold-products")
    public ResponseEntity<List<SoldProductSummaryDTO>> getAllSoldProducts(
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long startDate,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long endDate) {
        List<SoldProductSummaryDTO> soldProducts = billDetailService.getAllSoldProducts(startDate, endDate);
        return ResponseEntity.ok(soldProducts);
    }
}
