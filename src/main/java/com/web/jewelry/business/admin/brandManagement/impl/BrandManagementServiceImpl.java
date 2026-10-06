package com.web.jewelry.business.admin.brandManagement.impl;

import com.web.jewelry.config.exception.custom.NotFoundException;
import com.web.jewelry.dto.brandManagement.CreateBrandRequestDTO;
import com.web.jewelry.dto.brandManagement.UpdateBrandRequestDTO;
import com.web.jewelry.business.admin.brandManagement.service.BrandManagementService;
import com.web.jewelry.config.exception.custom.RestApiException;
import com.web.jewelry.dto.brandManagement.UpdateDeleteFlagRequestDTO;
import com.web.jewelry.entity.BrandEntity;
import com.web.jewelry.repository.BrandRepository;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
@Validated
public class BrandManagementServiceImpl implements BrandManagementService {

    private final BrandRepository brandRepository;

    @Override
    public Boolean createBrand(@Valid CreateBrandRequestDTO request) {
        Optional<BrandEntity> existingBrand = brandRepository.findBrandEntityByName(request.getName());
        if (existingBrand.isPresent()) {
            throw new RestApiException("Brand đã tồn tại");
        }

        BrandEntity brand = new BrandEntity();
        brand.setName(request.getName());
        brand.setStatus(1);
        brand.setDeleteFlag(0);

        brandRepository.save(brand);

        return true;
    }

    @Override
    public Boolean updateBrandRequest(UpdateBrandRequestDTO updateBrandRequestDTO) {

        Optional<BrandEntity> brand = brandRepository.findById(updateBrandRequestDTO.getId());
        if (!brand.isPresent()) {
            throw new RestApiException("Brand không tồn tại");
        }

        BrandEntity brandEntity = brand.get();
        brandEntity.setName(updateBrandRequestDTO.getName());
        brandEntity.setStatus(updateBrandRequestDTO.getStatus());

        brandRepository.save(brandEntity);

        return true;
    }

    @Override
    public String deleteBrandRequestDTO(String id) {
        Optional<BrandEntity> brand = brandRepository.findById(id);
        if(!brand.isPresent()) {
        throw new NotFoundException();
        }

        brandRepository.deleteById(brand.get().getId());

        return "Xóa thành công!";
    }

    @Override
    public List<BrandEntity> getAllBrand() {
        return brandRepository.findAll();
    }

    @Override
    public String updateDeleteFlag(UpdateDeleteFlagRequestDTO request) {
        Optional<BrandEntity> brand = brandRepository.findById(request.getId());
        if (!brand.isPresent()) {
            throw new RestApiException("Brand không tồn tại");
        }

        BrandEntity brandEntity = brand.get();
        brandEntity.setDeleteFlag(request.getDeleteFlag());
        brandRepository.save(brandEntity);  // Persist the change

        return "Đặt cờ thành công!";
    }

    @Override
    public String updateStatus(String id, Integer status) {
        Optional<BrandEntity> brand = brandRepository.findById(id);
        if (!brand.isPresent()) {
            throw new RestApiException("Brand không tồn tại");
        }

        BrandEntity brandEntity = brand.get();
        brandEntity.setStatus(status);
        brandRepository.save(brandEntity);  // Persist the change

        return "Cập nhật status thành công!";
    }


}
