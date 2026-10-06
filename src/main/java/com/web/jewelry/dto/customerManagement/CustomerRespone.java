package com.web.jewelry.dto.customerManagement;

import java.util.Date;

public interface CustomerRespone {
    Long getRowNum();

    String getAvatar();

    String getCustomerId();

    String getCustomerCode();

    String getCustomerName();

    Date getDateOfBirth();

    String getEmail();

    String getPhoneNumber();

    String getAddress();

    String getSex();

    Integer getDeleteFlag();
}
