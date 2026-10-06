package com.web.jewelry.business.admin.billManagement.web;

import com.web.jewelry.business.admin.billManagement.service.BillManagementService;
import com.web.jewelry.dto.billManagement.BillUpdateRequestDTO;
import com.web.jewelry.dto.billManagement.FindBillDTO;
import com.web.jewelry.dto.billManagement.ListBillDTO;
import com.web.jewelry.entity.BillDetailEntity;
import com.web.jewelry.entity.BillEntity;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin("*")
@RequiredArgsConstructor
@RestController
@RequestMapping("/admin/billManagement")
public class BillManagementController {
    private final BillManagementService billManagementService;

    // API cho admin hủy đơn hàng chủ động
    @PostMapping("/adminCancelBill")
    public ResponseEntity<Map<String, Object>> adminCancelBill(@RequestBody Map<String, String> payload) {
        String billId = payload.get("billId");
        String note = payload.get("note");
        Map<String, Object> result = billManagementService.adminCancelBill(billId, note);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/create")
    public ResponseEntity<String> createBill (BillEntity bill) {
        return ResponseEntity.ok().body(billManagementService.createBill(bill));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ListBillDTO>> searchBill(FindBillDTO request) {
        Page<ListBillDTO> response = billManagementService.getBillResponse(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/infoBill/{id}")
    public ResponseEntity<ListBillDTO> getBillDetails(@PathVariable String id) {
        Optional<ListBillDTO> bill = billManagementService.getInfoBill(id);
        return bill.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Cập nhật phương thức này để không nhận giá trị từ tham số trong URL
    @GetMapping("/getBillWithStatus")
    public ResponseEntity<List<BillEntity>> getBillWithStatus() {
        Integer status = 0; // Cố định status = 0
        Integer deleteFlag = 0;
        List<BillEntity> bills = billManagementService.getBillWithStatus(status,deleteFlag, "OFFLINE");
        return ResponseEntity.ok().body(bills);
    }

    @GetMapping("/getBillAvailable")
    public ResponseEntity<List<BillEntity>> getBillWithAvailable() {
        Integer status = 1; // Cố định status = 0
        Integer deleteFlag = 0;
        List<BillEntity> bills = billManagementService.getBillWithStatus(status,deleteFlag, "OFFLINE");
        return ResponseEntity.ok().body(bills);
    }

    @PutMapping("/updateDeleteFlag/{id}")
    public ResponseEntity<String> updateDeleteFlag(@PathVariable String id) {
        String result = billManagementService.updateDeleteFlag(id);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateBill(@RequestBody @Valid BillUpdateRequestDTO request) {
        BillEntity bill = new BillEntity();
        bill.setId(request.getId());
        bill.setTotalAmount(request.getTotalAmount());
        bill.setCustomerId(request.getCustomerId());
        bill.setEmployeeId(request.getEmployeeId());
        bill.setStatus(request.getStatus());
        bill.setAddress(request.getAddress());
        bill.setPhoneNumber(request.getPhoneNumber());
        bill.setRecipient(request.getRecipient());
        bill.setDatePayment(request.getDatePayment());

        List<BillDetailEntity> billDetails = request.getBillDetails().stream()
                .map(dto -> {
                    BillDetailEntity detail = new BillDetailEntity();
                    detail.setId(dto.getId());
                    detail.setProductDetailId(dto.getProductDetailId());
                    detail.setQuantity(dto.getQuantity());
                    detail.setPrice(dto.getPrice());
                    detail.setDeleteFlag(dto.getDeleteFlag());
                    return detail;
                })
                .collect(Collectors.toList());

        String result = billManagementService.updateBill(bill, billDetails);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/generatePDF/{billId}")
    public ResponseEntity<byte[]> generateBillPDF(@PathVariable String billId) {
        try {
            byte[] pdfContent = billManagementService.generateBillPDF(billId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "bill_" + billId + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfContent);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
