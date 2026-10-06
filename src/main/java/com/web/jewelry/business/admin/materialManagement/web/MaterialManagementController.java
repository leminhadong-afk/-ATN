package com.web.jewelry.business.admin.materialManagement.web;

import com.web.jewelry.business.admin.materialManagement.service.MaterialManagementService;
import com.web.jewelry.entity.MaterialEntity;
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
@RequestMapping("/admin/materialManagement")
public class MaterialManagementController {
    private final MaterialManagementService materialManagementService;

    @PostMapping("/create")
    public ResponseEntity<String> createMaterial (@RequestBody MaterialEntity request) {
        return ResponseEntity.ok().body(materialManagementService.createMaterial(request));
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateMaterial (@RequestBody MaterialEntity request) {
        return ResponseEntity.ok().body(materialManagementService.updateMaterial(request));
    }

    @PutMapping("/updateDeleteFlag")
    public ResponseEntity<String> updateDeleteFlagMaterial (@RequestParam String id, @RequestParam Integer deleteFlag) {
        return ResponseEntity.ok().body(materialManagementService.updateDeleteFlagMaterial(id,deleteFlag));
    }

    @PutMapping("/updateStatus")
    public ResponseEntity<String> updateStatusMaterial (@RequestParam String id, @RequestParam Integer status) {
        return ResponseEntity.ok().body(materialManagementService.updateStatusMaterial(id,status));
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<String> deleteMaterial(@PathVariable String id) {
        return ResponseEntity.ok().body(materialManagementService.deleteMaterial(id));
    }

    @GetMapping("/get-all-materials")
    public ResponseEntity<List<MaterialEntity>> getAllMaterials() {
        return ResponseEntity.ok(materialManagementService.getAllMaterialServices());
    }
}
