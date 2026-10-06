package com.web.jewelry.business.admin.sizeManagement.service;

import com.web.jewelry.entity.SizeEntity;
import jakarta.validation.Valid;

import java.util.List;

public interface SizeManagementService {
    // create a new size management service
    String createSize(@Valid SizeEntity size);

    // update an existing size management service
    String updateSize(@Valid SizeEntity size);

    String updateDeleteFlagSize(String id, Integer deleteFlag);

    // delete an existing size management service
    String deleteSize(String id);

    // get all size (optionally filter by typeProductId)
    List<SizeEntity> getAllSize(String typeProductId);
}
