package com.web.jewelry.business.admin.billHistoryManagement.service;

import com.web.jewelry.dto.billHistoryManagement.ListBillHistoryDTO;

import java.util.List;

public interface BillHistoryService {
    List<ListBillHistoryDTO> getBillHistory (String id);
}
