package com.web.jewelry.business.admin.materialManagement.service;

import com.web.jewelry.entity.MaterialEntity;
import jakarta.validation.Valid;

import java.util.List;

public interface MaterialManagementService {
    // create a new material management service
    String createMaterial (@Valid MaterialEntity materialEntity);

    // update a material management service
    String updateMaterial (@Valid MaterialEntity materialEntity);

    // delete a material management service
    String deleteMaterial (String id);

    // get all material management services
    List<MaterialEntity> getAllMaterialServices();

    String updateDeleteFlagMaterial(String id, Integer deleteFlag);

    String updateStatusMaterial (String id, Integer status);
}
