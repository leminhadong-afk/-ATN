package com.web.jewelry.business.admin.productAnalysisManagment.impl;

import com.web.jewelry.business.admin.productAnalysisManagment.service.ProductAnalysisService;
//import com.web.jewelry.entity.ProductAnalysisEntity;
//import com.web.jewelry.repository.ProductAnalysisRepository;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@Service
@AllArgsConstructor
@Validated
public class ProductAnalysisServiceImpl implements ProductAnalysisService {

//    private final ProductAnalysisRepository productAnalysisRepository;
    private final ModelMapper modelMapper;

//    @Override
//    public Page<AnalystManagementDTO> getBestSaleProduct(Pageable pageable) {
//        try {
//            Page<ProductAnalysisEntity> entityPage = productAnalysisRepository.getTopSellingProducts(pageable);
//            return entityPage.map(entity -> modelMapper.map(entity, AnalystManagementDTO.class));
//        } catch (Exception e) {
//            throw new RuntimeException("Lỗi khi lấy danh sách sản phẩm bán chạy: " + e.getMessage());
//        }
//    }
}