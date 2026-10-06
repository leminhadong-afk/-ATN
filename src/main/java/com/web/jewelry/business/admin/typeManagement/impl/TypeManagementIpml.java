package com.web.jewelry.business.admin.typeManagement.impl;

import com.web.jewelry.business.admin.typeManagement.service.TypeManagementService;
import com.web.jewelry.entity.TypeEntity;
import com.web.jewelry.repository.TypeRepository;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@AllArgsConstructor
@Valid
@Service
public class TypeManagementIpml implements TypeManagementService {
    private final TypeRepository typeRepository;


    @Override
    public String createType(TypeEntity type) {
        Optional<TypeEntity> existingType = typeRepository.getTypeEntityByName(type.getName());
        if (existingType.isPresent()) {
            throw new IllegalArgumentException("Type đã tồn tại");
        }

        TypeEntity typeEntity = new TypeEntity();
        typeEntity.setName(type.getName());
        typeEntity.setStatus(1);
        typeEntity.setDeleteFlag(0);

        typeRepository.save(typeEntity);

        return "Thêm loại sản phẩm thành công!";
    }

    @Override
    public String updateType(TypeEntity type) {
        Optional<TypeEntity> existingType = typeRepository.findById(type.getId());
        if (!existingType.isPresent()) {
            throw new IllegalArgumentException("Loại sản phẩm không tồn tại");
        }

        TypeEntity typeEntity = existingType.get();
        typeEntity.setName(type.getName());
        typeEntity.setStatus(type.getStatus());
        typeEntity.setDeleteFlag(type.getDeleteFlag());

        typeRepository.save(typeEntity);
        return "Cập nhật thành công!";
    }

    @Override
    public String updateDeleteFlagType(String id, Integer deleteFlag) {

        Optional<TypeEntity> existingType = typeRepository.findById(id);
        if (!existingType.isPresent()) {
            throw new IllegalArgumentException("Loại sản phẩm không tồn tại");
        }

        TypeEntity typeEntity = existingType.get();
        typeEntity.setDeleteFlag(deleteFlag);
        typeRepository.save(typeEntity);


        return "Đặt cờ Loại sản phẩm thành công!";
    }

    @Override
    public String updateStatusType(String id, Integer status) {

        Optional<TypeEntity> existingType = typeRepository.findById(id);
        if (!existingType.isPresent()) {
            throw new IllegalArgumentException("Loại sản phẩm không tồn tại");
        }

        TypeEntity typeEntity = existingType.get();
        typeEntity.setStatus(status);
        typeRepository.save(typeEntity);

        return "Cập nhật trạng thái Loại trang sức thành công!";
    }

    @Override
    public String deleteType(String id) {
        Optional<TypeEntity> existingType = typeRepository.findById(id);
        if (!existingType.isPresent()) {
            throw new IllegalArgumentException("Loại sản phẩm không tồn tại");
        }

        typeRepository.deleteById(id);
        return "Xóa thành công!";
    }

    @Override
    public List<TypeEntity> getAllTypes() {
        return typeRepository.findAll();
    }
}
