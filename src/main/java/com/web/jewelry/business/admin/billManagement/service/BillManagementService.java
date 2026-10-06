package com.web.jewelry.business.admin.billManagement.service;

import com.web.jewelry.dto.billManagement.FindBillDTO;
import com.web.jewelry.dto.billManagement.ListBillDTO;
import com.web.jewelry.entity.BillDetailEntity;
import com.web.jewelry.entity.BillEntity;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface BillManagementService {

    String createBill(BillEntity bill);

    Page<ListBillDTO> getBillResponse (FindBillDTO req);

    Optional<ListBillDTO> getInfoBill (String id);

    List<BillEntity> getBillWithStatus (Integer status, Integer deleteFlag, String type);

    List<BillEntity> getBillAvailable (Integer status, Integer deleteFlag, String type);


    String updateDeleteFlag (String id);

    String updateBill(BillEntity bill, List<BillDetailEntity> billDetails);

    Map<String, Object> adminCancelBill(String billId, String note);

    byte[] generateBillPDF(String billId) throws Exception;

}
