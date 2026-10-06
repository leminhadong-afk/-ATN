package com.web.jewelry.business.admin.colorManagement.impl;

import com.web.jewelry.business.admin.colorManagement.service.ColorManagementService;
import com.web.jewelry.config.exception.custom.NotFoundException;
import com.web.jewelry.config.exception.custom.RestApiException;
import com.web.jewelry.dto.colorManagement.CreateColorDTO;
import com.web.jewelry.dto.colorManagement.UpdateColorDTO;
import com.web.jewelry.dto.colorManagement.UpdateDeleteFlagColorDTO;
import com.web.jewelry.entity.ColorEntity;
import com.web.jewelry.repository.ColorRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
@Validated
public class ColorManagementImpl implements ColorManagementService {

    private final ColorRepository colorRepository;

    @Override
    public Boolean createColor(CreateColorDTO createColor) {
        String trimmedName = createColor.getName() != null ? createColor.getName().trim() : "";
        if (trimmedName.isEmpty()) {
            throw new RestApiException("Tên màu không được để trống");
        }

        // Kiểm tra xem đã có màu đang hoạt động trùng tên hay chưa
        Optional<ColorEntity> activeColor = colorRepository.findByNameIgnoreCaseAndDeleteFlag(trimmedName, 0);
        if (activeColor.isPresent()) {
            throw new RestApiException("Màu '" + trimmedName + "' đã tồn tại");
        }

        // Nếu màu đã từng tồn tại nhưng bị xóa mềm (deleteFlag = 1), khôi phục lại
        Optional<ColorEntity> deletedColor = colorRepository.findByNameIgnoreCaseAndDeleteFlag(trimmedName, 1);
        if (deletedColor.isPresent()) {
            ColorEntity color = deletedColor.get();
            color.setName(trimmedName);
            color.setStatus(1);
            color.setDeleteFlag(0);
            colorRepository.save(color);
            return true;
        }

        // Tạo màu mới
        ColorEntity color = new ColorEntity();
        color.setName(trimmedName);
        color.setStatus(1);
        color.setDeleteFlag(0);

        colorRepository.save(color);

        return true;
    }

    @Override
    public Boolean updateColor(UpdateColorDTO updateColor) {
        Optional<ColorEntity> colorOpt = colorRepository.findById(updateColor.getId());
        if (!colorOpt.isPresent()) {
            throw new RestApiException("Màu không tồn tại");
        }

        String trimmedName = updateColor.getName() != null ? updateColor.getName().trim() : "";
        if (trimmedName.isEmpty()) {
            throw new RestApiException("Tên màu không được để trống");
        }

        // Kiểm tra trùng tên với màu khác đang hoạt động
        Optional<ColorEntity> duplicate = colorRepository.findByNameIgnoreCaseAndIdNotAndDeleteFlag(trimmedName, updateColor.getId(), 0);
        if (duplicate.isPresent()) {
            throw new RestApiException("Màu '" + trimmedName + "' đã tồn tại");
        }

        ColorEntity color = colorOpt.get();
        color.setName(trimmedName);
        color.setStatus(updateColor.getStatus());
        color.setDeleteFlag(updateColor.getDeleteFlag());

        colorRepository.save(color);
        return true;
    }

    @Override
    public String deleteColor(String id) {
        Optional<ColorEntity> color = colorRepository.findById(id);
        if (!color.isPresent()) {
            throw new NotFoundException();
        }

        colorRepository.deleteById(id);

        return "Xóa màu thành công!";
    }

    @Override
    public List<ColorEntity> getAllColor() {
        return colorRepository.findAllByDeleteFlag(0);
    }

    @Override
    public String updateDeleteFlagColor(UpdateDeleteFlagColorDTO request) {
        Optional<ColorEntity> color = colorRepository.findById(request.getId());
        if (!color.isPresent()) {
            throw new RestApiException("Màu không tồn tại");
        }

        color.get().setDeleteFlag(request.getDeleteFlag());
        colorRepository.save(color.get());

        return "Đặt cờ thành công!";
    }

}

