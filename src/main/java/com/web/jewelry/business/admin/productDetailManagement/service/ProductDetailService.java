package com.web.jewelry.business.admin.productDetailManagement.service;

import com.web.jewelry.dto.productDetailDTO.CreateProductDetailDTO;
import com.web.jewelry.dto.productDetailDTO.FindProductDetailDTO;
import com.web.jewelry.dto.productDetailDTO.ProductDetailListDTO;
import com.web.jewelry.dto.productDetailDTO.SaveListProductDetailDTO;
import com.web.jewelry.dto.productDetailDTO.UpdateProductDetailManagementDTO;
import com.web.jewelry.entity.ProductDetailEntity;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ProductDetailService {

    // get all
    Page<ProductDetailListDTO> getAllProductDetails (FindProductDetailDTO req);

    Page<ProductDetailListDTO> getProductCounterSale (FindProductDetailDTO req);


    // create a new ProductDetailService
    String createProductDetail (CreateProductDetailDTO createProductDetail);

    // update a ProductDetailService
    String updateProductDetail(UpdateProductDetailManagementDTO request);

    String deleteProductDetail(String id);

    List<ProductDetailEntity> getProductDetail ();

    String saveListProductDetail (List<SaveListProductDetailDTO> request);
}
