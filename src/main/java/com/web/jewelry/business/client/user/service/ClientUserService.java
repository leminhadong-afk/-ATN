package com.web.jewelry.business.client.user.service;

import com.web.jewelry.business.client.user.response.CustomerInfoResponse;
import com.web.jewelry.dto.customerManagement.UpdateCustomerInfoDTO;

public interface ClientUserService {
    CustomerInfoResponse getCustomerInfo();
    String updateCustomerInfo(UpdateCustomerInfoDTO request);
}
