package com.web.jewelry.business.admin.sizeManagement.web;

import com.web.jewelry.business.admin.sizeManagement.service.SizeManagementService;
import com.web.jewelry.entity.SizeEntity;
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
@RequestMapping("/admin/sizeManagement")
public class SizeManagementController {

    private final SizeManagementService sizeManagementService;

    @PostMapping("/create")
    public ResponseEntity<String> createSize(@RequestBody SizeEntity request) {
        return ResponseEntity.ok().body(sizeManagementService.createSize(request));
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateSize(@RequestBody SizeEntity request) {
        return ResponseEntity.ok().body(sizeManagementService.updateSize(request));
    }

    @PutMapping("/updateDeleteFlag")
    public ResponseEntity<String> updateDeleteFlag(@RequestParam String id, @RequestParam Integer deleteFlag) {
        return ResponseEntity.ok().body(sizeManagementService.updateDeleteFlagSize(id, deleteFlag));
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<String> deleteSize(@PathVariable String id) {
        return ResponseEntity.ok().body(sizeManagementService.deleteSize(id));
    }

    @GetMapping("/get-all-size")
    public ResponseEntity<List<SizeEntity>> getAllSize(@RequestParam(name = "typeProductId", required = false) String typeProductId) {
        return ResponseEntity.ok(sizeManagementService.getAllSize(typeProductId));
    }
}
