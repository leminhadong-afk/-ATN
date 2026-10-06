package com.web.jewelry.business.admin.billHistoryManagement.web;

import com.web.jewelry.business.admin.billHistoryManagement.service.BillHistoryService;
import com.web.jewelry.dto.billHistoryManagement.ListBillHistoryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin("*")
@RequiredArgsConstructor
@RestController
@RequestMapping("/admin/billHistoryManagement")
public class BillHistoryController {

    private final BillHistoryService billHistoryService;

    @GetMapping("/infoBillHistory/{id}")
    public ResponseEntity<List<ListBillHistoryDTO>> getBillHistory(@PathVariable("id") String id) {
        List<ListBillHistoryDTO> bill = billHistoryService.getBillHistory(id);
        return new ResponseEntity<>(bill, HttpStatus.OK);
    }
}
