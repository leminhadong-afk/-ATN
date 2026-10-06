package com.web.jewelry.business.admin.colorManagement.web;

import com.web.jewelry.business.admin.colorManagement.service.ColorManagementService;
import com.web.jewelry.dto.colorManagement.CreateColorDTO;
import com.web.jewelry.dto.colorManagement.UpdateColorDTO;
import com.web.jewelry.dto.colorManagement.UpdateDeleteFlagColorDTO;
import com.web.jewelry.entity.ColorEntity;
import jakarta.validation.Valid;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin("*")
@AllArgsConstructor
@RestController
@RequestMapping("/admin/colorManagement")
public class ColorManagementController {
    private final ColorManagementService colorManagementService;

    @PostMapping("/create")
    public ResponseEntity<Boolean> createColor (@RequestBody CreateColorDTO request) {
        return ResponseEntity.ok().body(colorManagementService.createColor(request));
    }

    @PutMapping("/update")
    public ResponseEntity<Boolean> updateColor (@RequestBody UpdateColorDTO request) {
        return ResponseEntity.ok().body(colorManagementService.updateColor(request));
    }

    @PutMapping("/updateDeleteFlag")
    public ResponseEntity<String> updateDeleteFlag(@Valid @RequestBody UpdateDeleteFlagColorDTO request) {
        String result = colorManagementService.updateDeleteFlagColor(request);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("delete/{id}")
    public String deleteColor (@PathVariable String id) {
        return colorManagementService.deleteColor(id);
    }

    @GetMapping("/get-all-color")
    public ResponseEntity<List<ColorEntity>> getAllColors () {
        return ResponseEntity.ok().body(colorManagementService.getAllColor());
    }
}
