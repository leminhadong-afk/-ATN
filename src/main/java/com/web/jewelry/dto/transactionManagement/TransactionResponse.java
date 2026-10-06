package com.web.jewelry.dto.transactionManagement;

public interface TransactionResponse {
    String getId();
    String getBillId();
    Integer getStatus();
    Double getMoney();
    String getCreatedDate();
    Integer getTypeMethod();
    String getEmployeeName();
    Integer getTypeTransaction();
}
