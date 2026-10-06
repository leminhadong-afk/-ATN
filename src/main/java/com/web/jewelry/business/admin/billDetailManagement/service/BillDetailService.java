package com.web.jewelry.business.admin.billDetailManagement.service;

import com.web.jewelry.business.admin.billDetailManagement.request.UpdateStatusBillDTO;
import com.web.jewelry.dto.billDetailManagement.CreateBillDetailDTO;
import com.web.jewelry.dto.billDetailManagement.ListBillDetailDTO;

import java.util.List;

public interface BillDetailService {
    List<ListBillDetailDTO> getBillDetails (String id, Integer deleteFlag);

    String createBillDetail (CreateBillDetailDTO request);

    String updateDeleteFlag (String id);

    String updateBillStatusAndHistory(UpdateStatusBillDTO dto);

    List<com.web.jewelry.dto.billDetailManagement.SoldProductSummaryDTO> getAllSoldProducts(Long startDate, Long endDate);
}
