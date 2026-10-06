package com.web.jewelry.business.admin.materialManagement.impl;

import com.web.jewelry.business.admin.materialManagement.service.MaterialManagementService;
import com.web.jewelry.entity.MaterialEntity;
import com.web.jewelry.repository.MaterialRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
@Validated
public class MaterialManagementImpl implements MaterialManagementService {
    private final MaterialRepository materialRepository;


    @Override
    public String createMaterial(MaterialEntity materialEntity) {
        Optional<MaterialEntity> existingMaterial = materialRepository.findMaterialEntityByName(materialEntity.getName());
        if (existingMaterial.isPresent()) {
            throw new RuntimeException("Material đã tồn tại");
        }

        MaterialEntity material = new MaterialEntity();
        material.setName(materialEntity.getName());
        material.setStatus(1);
        material.setDeleteFlag(0);

        materialRepository.save(material);


        return "Thêm Material thành công!";
    }

    @Override
    public String updateMaterial(MaterialEntity materialEntity) {

        Optional<MaterialEntity> existingMaterial = materialRepository.findById(materialEntity.getId());
        if (!existingMaterial.isPresent()) {
            throw new RuntimeException("Material không tồn tại");
        }

        MaterialEntity material = existingMaterial.get();
        material.setName(materialEntity.getName());
        material.setStatus(materialEntity.getStatus());
        material.setDeleteFlag(materialEntity.getDeleteFlag());
        materialRepository.save(material);

        return "Cập nhật Material thành công!";
    }

    @Override
    public String deleteMaterial(String id) {
        Optional<MaterialEntity> existingMaterial = materialRepository.findById(id);
        if (!existingMaterial.isPresent()) {
            throw new RuntimeException("Material không tồn tại");
        }
        materialRepository.deleteById(id);
        return "Xoá Material thành công!";
    }

    @Override
    public List<MaterialEntity> getAllMaterialServices() {
        return materialRepository.findAll();
    }

    @Override
    public String updateDeleteFlagMaterial(String id, Integer deleteFlag) {

        Optional<MaterialEntity> existingMaterial = materialRepository.findById(id);
        if (!existingMaterial.isPresent()) {
            throw new RuntimeException("Material không tồn tại");
        }

        MaterialEntity material = existingMaterial.get();
        material.setDeleteFlag(deleteFlag);
        materialRepository.save(material);

        return "Đặt cờ material thành công!";
    }

    @Override
    public String updateStatusMaterial(String id, Integer status) {

        Optional<MaterialEntity> existingMaterial = materialRepository.findById(id);
        if (!existingMaterial.isPresent()) {
            throw new RuntimeException("Material không tồn tại");
        }

        MaterialEntity material = existingMaterial.get();
        material.setStatus(status);
        materialRepository.save(material);

        return "Cập nhật trạng thái Material thành công!";
    }
}
