package com.web.jewelry.business.admin.couponManagement.impl;

import com.web.jewelry.business.admin.couponManagement.service.CouponService;
import com.web.jewelry.dto.couponManagement.CouponResponse;
import com.web.jewelry.dto.couponManagement.CreateCouponDTO;
import com.web.jewelry.dto.couponManagement.FindCouponDTO;
import com.web.jewelry.dto.couponManagement.ListCouponDTO;
import com.web.jewelry.dto.couponManagement.ListCustomerIdDTO;
import com.web.jewelry.dto.couponManagement.UpdateCouponDTO;
import com.web.jewelry.entity.CouponCustomerEntity;
import com.web.jewelry.entity.CouponEntity;
import com.web.jewelry.entity.CustomerEntity;
import com.web.jewelry.repository.CouponCustomerRepository;
import com.web.jewelry.repository.CouponRepository;
import com.web.jewelry.repository.CustomerRepository;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
@Validated
public class CouponServiceImpl implements CouponService {
    private final CouponRepository couponRepository;
    private final CouponCustomerRepository couponCustomerRepository;
    private final CustomerRepository customerRepository;

    private final ModelMapper modelMapper;

    @Override
    public String createCoupon(CreateCouponDTO request) {
        // 1. Validate mã code không trùng
        if (couponRepository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("Code existing!");
        }

        // 2. Validate giá trị giảm giá
        if (request.getValue() == null || request.getValue() <= 0) {
            throw new RuntimeException("Giá trị giảm giá không hợp lệ!");
        }

        if (request.getUnit() != null && request.getUnit() == 0 && request.getValue() > 100) {
            throw new RuntimeException("Phần trăm giảm giá không được vượt quá 100!");
        }

        // 3. Validate số lượng
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new RuntimeException("Số lượng mã giảm giá phải lớn hơn 0!");
        }

        // Nếu là loại cá nhân thì cần kiểm tra danh sách khách hàng
        if (request.getType() == 0) {
            if (request.getCustomerDetail() == null || request.getCustomerDetail().isEmpty()) {
                throw new RuntimeException("Phải chọn ít nhất một khách hàng cho mã giảm giá cá nhân!");
            }

            for (ListCustomerIdDTO dto : request.getCustomerDetail()) {
                if (dto.getCustomerId() == null || dto.getCustomerId().isBlank()) {
                    throw new RuntimeException("CustomerId không được để trống!");
                }
                if (!customerRepository.existsById(dto.getCustomerId())) {
                    throw new RuntimeException("Khách hàng với ID " + dto.getCustomerId() + " không tồn tại!");
                }
            }
        }

        // 5. Tạo và lưu coupon
        CouponEntity coupon = new CouponEntity();
        coupon.setCode(request.getCode());
        coupon.setName(request.getName());
        coupon.setValue(request.getValue());
        coupon.setUnit(request.getUnit());
        coupon.setMaxValue(request.getMaxValue());
        coupon.setMinCondition(request.getMinCondition());
        coupon.setQuantity(request.getQuantity());
        coupon.setStartDate(request.getStartDate());
        coupon.setEndDate(request.getEndDate());
        coupon.setType(request.getType());
        coupon.setStatus(1);
        couponRepository.save(coupon);

        // 6. Gán khách hàng nếu là loại cá nhân (type=0)
        if (request.getType() == 0) {
            List<CouponCustomerEntity> mappings = new ArrayList<>();
            for (ListCustomerIdDTO dto : request.getCustomerDetail()) {
                // Tìm lại CustomerEntity (mặc dù đã kiểm tra tồn tại ở bước 4)
                CustomerEntity customer = customerRepository.findById(dto.getCustomerId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với ID: " + dto.getCustomerId())); // Should not happen if validation passed

                // Tạo entity mapping
                CouponCustomerEntity mapping = new CouponCustomerEntity();
                mapping.setCouponId(coupon.getId()); // Lấy ID của coupon vừa lưu
                mapping.setCustomerId(customer.getId());
                mappings.add(mapping);
            }
            couponCustomerRepository.saveAll(mappings); // Lưu danh sách mapping
        }

        return "Tạo mã giảm giá thành công!";
    }

    @Override
    public Page<ListCouponDTO> searchCoupon(FindCouponDTO req) {
        Pageable pageable = PageRequest.of(req.getPage(), req.getSize());

        Page<CouponResponse> pageResponse = couponRepository.getCouponManagementRespone(pageable, req);

        Page<ListCouponDTO> pageDTO = pageResponse.map(couponResponse ->
                modelMapper.map(couponResponse, ListCouponDTO.class)
        );

        return pageDTO;
    }

    @Override
    public String updateCoupon(UpdateCouponDTO request) {
        // 1. Lấy coupon hiện tại
        CouponEntity coupon = couponRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giảm giá với ID: " + request.getId()));

        // 2. Validate cơ bản
        if (request.getValue() == null || request.getValue() <= 0) {
            throw new RuntimeException("Giá trị giảm giá không hợp lệ!");
        }

        if (request.getUnit() != null && request.getUnit() == 0 && request.getValue() > 100) {
            throw new RuntimeException("Phần trăm giảm giá không được lớn hơn 100%!");
        }

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new RuntimeException("Số lượng mã giảm giá phải lớn hơn 0!");
        }

        if (request.getStartDate() != null && request.getEndDate() != null &&
                request.getStartDate().after(request.getEndDate())) {
            throw new RuntimeException("Ngày bắt đầu không được lớn hơn ngày kết thúc!");
        }

        // 3. Kiểm tra code có bị trùng (nếu sửa code)
        if (!coupon.getCode().equals(request.getCode())) {
            if (couponRepository.findByCode(request.getCode()).isPresent()) {
                throw new RuntimeException("Code đã tồn tại!");
            }
            coupon.setCode(request.getCode());
        }

        // 4. Cập nhật thông tin cơ bản
        coupon.setName(request.getName());
        coupon.setValue(request.getValue());
        coupon.setUnit(request.getUnit());
        coupon.setMaxValue(request.getMaxValue());
        coupon.setMinCondition(request.getMinCondition());
        coupon.setQuantity(request.getQuantity());
        coupon.setStartDate(request.getStartDate());
        coupon.setEndDate(request.getEndDate());

        // 5. Xử lý type và liên kết khách hàng
        Integer newType = request.getType();
        List<CouponCustomerEntity> oldMappings = couponCustomerRepository.findByCouponId(coupon.getId());

        if (newType == 1) {
            // Public: xóa hết liên kết cũ nếu có
            if (!oldMappings.isEmpty()) {
                couponCustomerRepository.deleteAll(oldMappings);
            }
        } else if (newType == 0) {
            // Personal: validate danh sách khách hàng
            List<ListCustomerIdDTO> customerDetails = request.getCustomerDetail();
            if (customerDetails == null || customerDetails.isEmpty()) {
                throw new RuntimeException("Phải chọn ít nhất một khách hàng cho mã giảm giá cá nhân!");
            }

            for (ListCustomerIdDTO dto : customerDetails) {
                if (dto.getCustomerId() == null || dto.getCustomerId().isBlank()) {
                    throw new RuntimeException("CustomerId không được để trống!");
                }

                if (!customerRepository.existsById(dto.getCustomerId())) {
                    throw new RuntimeException("Khách hàng với ID " + dto.getCustomerId() + " không tồn tại!");
                }
            }

            // Xóa liên kết cũ
            if (!oldMappings.isEmpty()) {
                couponCustomerRepository.deleteAll(oldMappings);
            }

            // Thêm liên kết mới
            List<CouponCustomerEntity> newMappings = new ArrayList<>();
            for (ListCustomerIdDTO dto : customerDetails) {
                CouponCustomerEntity mapping = new CouponCustomerEntity();
                mapping.setCouponId(coupon.getId());
                mapping.setCustomerId(dto.getCustomerId());
                newMappings.add(mapping);
            }
            couponCustomerRepository.saveAll(newMappings);
        } else {
            throw new RuntimeException("Loại coupon không hợp lệ!");
        }

        coupon.setType(newType); // Cập nhật lại type

        // 6. Lưu lại coupon
        couponRepository.save(coupon);

        return "Cập nhật mã giảm giá thành công!";
    }

}
