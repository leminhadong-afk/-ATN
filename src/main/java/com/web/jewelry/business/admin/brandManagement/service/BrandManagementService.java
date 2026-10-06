package com.web.jewelry.business.admin.brandManagement.service;

import com.web.jewelry.dto.brandManagement.CreateBrandRequestDTO;
import com.web.jewelry.dto.brandManagement.UpdateBrandRequestDTO;
import com.web.jewelry.dto.brandManagement.UpdateDeleteFlagRequestDTO;
import com.web.jewelry.entity.BrandEntity;
import jakarta.validation.Valid;

import java.util.List;

public interface BrandManagementService {
    // create brand
    Boolean createBrand (@Valid CreateBrandRequestDTO request);

    // update brand
    Boolean updateBrandRequest ( UpdateBrandRequestDTO updateBrandRequestDTO);

    // delete brand
    String deleteBrandRequestDTO (String id);

    // get all brands
    List<BrandEntity> getAllBrand ();

    String updateDeleteFlag (UpdateDeleteFlagRequestDTO request);

    String updateStatus (String id, Integer status);

}
