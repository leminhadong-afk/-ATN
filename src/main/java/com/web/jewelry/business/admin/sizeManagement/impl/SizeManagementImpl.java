package com.web.jewelry.business.admin.sizeManagement.impl;

import com.web.jewelry.business.admin.sizeManagement.service.SizeManagementService;
import com.web.jewelry.entity.SizeEntity;
import com.web.jewelry.repository.SizeRepository;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
@Valid
public class SizeManagementImpl implements SizeManagementService {

    private final SizeRepository sizeRepository;

    @Override
    public String createSize(SizeEntity size) {
        Optional<SizeEntity> existingSize = sizeRepository.getSizeEntityByNameAndTypeProductId(size.getName(),
                size.getTypeProductId());
        if (existingSize.isPresent()) {
            throw new RuntimeException("Size đã tồn tại cho loại sản phẩm này");
        }

        SizeEntity sizeEntity = new SizeEntity();
        sizeEntity.setName(size.getName());
        sizeEntity.setStatus(1);
        sizeEntity.setDeleteFlag(0);
        sizeEntity.setTypeProductId(size.getTypeProductId());

        sizeRepository.save(sizeEntity);

        return "Thêm size thành công!";
    }

    @Override
    public String updateSize(SizeEntity size) {
        Optional<SizeEntity> existingSize = sizeRepository.findById(size.getId());
        if (!existingSize.isPresent()) {
            throw new RuntimeException("Size không tồn tại");
        }

        // Check if another SizeEntity with the same name already exists in the same
        // type
        Optional<SizeEntity> existingSizeWithName = sizeRepository.getSizeEntityByNameAndTypeProductId(size.getName(),
                size.getTypeProductId());
        if (existingSizeWithName.isPresent() && !existingSizeWithName.get().getId().equals(size.getId())) {
            throw new RuntimeException("Size đã tồn tại cho loại sản phẩm này");
        }

        SizeEntity sizeEntity = existingSize.get();
        sizeEntity.setName(size.getName());
        sizeEntity.setStatus(size.getStatus());
        sizeEntity.setDeleteFlag(size.getDeleteFlag());
        sizeEntity.setTypeProductId(size.getTypeProductId());

        sizeRepository.save(sizeEntity);

        return "Cập nhật size thành công!";
    }

    @Override
    public String updateDeleteFlagSize(String id, Integer deleteFlag) {
        Optional<SizeEntity> existingSize = sizeRepository.findById(id);
        if (!existingSize.isPresent()) {
            throw new RuntimeException("Size không tồn tại");
        }

        SizeEntity sizeEntity = existingSize.get();
        sizeEntity.setDeleteFlag(deleteFlag);
        sizeRepository.save(sizeEntity);

        return "Đặt cờ size thành công!";
    }

    @Override
    public String deleteSize(String id) {
        Optional<SizeEntity> existingSize = sizeRepository.findById(id);
        if (!existingSize.isPresent()) {
            throw new RuntimeException("Size không tồn tại");
        }
        sizeRepository.deleteById(id);
        return "Xoá size thành công";
    }

    @Override
    public List<SizeEntity> getAllSize(String typeProductId) {
        if (typeProductId != null && !typeProductId.isEmpty()) {
            return sizeRepository.findByTypeProductId(typeProductId);
        }
        return sizeRepository.findAll();
    }
}
