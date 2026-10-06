package com.web.jewelry.business.admin.transactionManagement.web;

import com.web.jewelry.business.admin.transactionManagement.service.TransactionService;
import com.web.jewelry.dto.transactionManagement.CreateTransactionDTO;
import com.web.jewelry.dto.transactionManagement.ListTransactionDTO;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin("*")
@AllArgsConstructor
@RestController
@RequestMapping("/admin/transactionManagement")
public class TransactionController {
    private final TransactionService transactionService;

    @GetMapping("/transaction/{id}")
    public ResponseEntity<List<ListTransactionDTO>> getTransaction(@PathVariable("id") String id) {
        List<ListTransactionDTO> transaction = transactionService.getTransaction(id);
        return new ResponseEntity<>(transaction, HttpStatus.OK);
    }

    @PostMapping("/create")
    public ResponseEntity<String> createTransaction(@RequestBody CreateTransactionDTO request) {
        try {
            String result = transactionService.createTransaction(request);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PostMapping("/updateDeleteFlag/{id}")
    public ResponseEntity<String> updateDeleteFlag(@PathVariable("id") String id) {
        try {
            String result = transactionService.updateDeleteFlag(id);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteTransaction(@PathVariable("id") String id) {
        try {
            transactionService.deleteTransaction(id);
            return ResponseEntity.ok("Xóa transaction thành công với id: " + id);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }





}
