package com.web.jewelry.dto.customerManagement;

import java.util.Date;

public interface CustomerNameResponse {
    String getCustomerName();

    String getAvatar();

    String getCustomerId();

    String getCustomerCode();

    Date getDateOfBirth();

    String getEmail();

    String getPhoneNumber();

    String getAddress();

    String getSex();

    Integer getDeleteFlag();
}
