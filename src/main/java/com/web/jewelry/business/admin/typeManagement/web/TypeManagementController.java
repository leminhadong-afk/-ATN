package com.web.jewelry.business.admin.typeManagement.web;

import com.web.jewelry.business.admin.typeManagement.service.TypeManagementService;
import com.web.jewelry.entity.TypeEntity;
import lombok.AllArgsConstructor;
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
@AllArgsConstructor
@RestController
@RequestMapping("/admin/typeManagement")
public class TypeManagementController {
    public final TypeManagementService typeManagementService;

    @PostMapping("/create")
    public ResponseEntity<String> createType (@RequestBody TypeEntity request) {
        return ResponseEntity.ok().body(typeManagementService.createType(request));
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateType (@RequestBody TypeEntity request) {
        return ResponseEntity.ok().body(typeManagementService.updateType(request));
    }

    @PutMapping("/updateStatus")
    public ResponseEntity<String> updateStatusType (@RequestParam String id, @RequestParam Integer status) {
        return ResponseEntity.ok().body(typeManagementService.updateStatusType(id, status));
    }

    @PutMapping("/updateDeleteFlag")
    public ResponseEntity<String> updateType (@RequestParam String id, @RequestParam Integer deleteFlag) {
        return ResponseEntity.ok().body(typeManagementService.updateDeleteFlagType(id, deleteFlag));
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<String> deleteType(@PathVariable String id) {
        return ResponseEntity.ok().body(typeManagementService.deleteType(id));
    }

    @GetMapping("/get-all-type")
    public ResponseEntity<List<TypeEntity>> getAllSize() {
        return ResponseEntity.ok(typeManagementService.getAllTypes());
    }
}
