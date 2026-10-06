package com.web.jewelry.dto.billHistoryManagement;

public interface BillHistoryResponse {
    String getId();
    String getBillId();
    Integer getStatus();
    String getNote();
    Long getCreatedDate();
}
