package com.web.jewelry.dto.billManagement;

public interface BillResponse {

    String getId();

    Integer getRowNum();

    String getBillCode();

    String getType();

    Double getTotalAmount();

    Integer getTotalQuantity();

    Integer getIsPaid();

    String getDatePayment();

    String getAddress();

    Integer getStatus();

    String getEmployeeName();

    String getCustomerName();

    Long getCreatedDate();

    String getPhonenumber();

    String getRecipient();
}
