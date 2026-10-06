package com.web.jewelry.business.admin.productManagement.service;

import com.web.jewelry.dto.productManagement.CreateProductManagementDTO;
import com.web.jewelry.dto.productManagement.FindProductManagementDTO;
import com.web.jewelry.dto.productManagement.ProductListDTO;
import com.web.jewelry.dto.productManagement.ProductStatisticsResponse;
import com.web.jewelry.dto.productManagement.ProductStatsDTO;
import com.web.jewelry.dto.productManagement.UpdateProductManagementDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ProductManagementService {
    String createProduct(CreateProductManagementDTO request);

    String updateProduct(UpdateProductManagementDTO request);

    String deleteProduct(String id);

    Page<ProductListDTO> getProductManagementResponse (FindProductManagementDTO req);

    String updateStatus (String id, Integer status);

    // update name and status
    String updateNameAndStatus(String id, String name, Integer status);

    ProductStatsDTO getProductStatistics();

    List<ProductStatisticsResponse> getTopMostSoldProducts();
}
