package com.web.jewelry.business.admin.customerManagement.service;

import com.web.jewelry.dto.customerManagement.CreateCustomerDTO;
import com.web.jewelry.dto.customerManagement.CustomerNameResponse;
import com.web.jewelry.dto.customerManagement.CustomerStatisticsResponseDTO;
import com.web.jewelry.dto.customerManagement.FindByNameDTO;
import com.web.jewelry.dto.customerManagement.FindCustomerDTO;
import com.web.jewelry.dto.customerManagement.ListCustomerDTO;
import com.web.jewelry.dto.customerManagement.UpdateCustomerDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public interface CustomerManagementService {
    String createCustomer (CreateCustomerDTO request);

    String updateCustomer (UpdateCustomerDTO request);

    Page<ListCustomerDTO> searchCustomer (FindCustomerDTO req);

    String updateStatusCustomer (String id, Integer deleteFlag);

    List<CustomerNameResponse> searchByName (FindByNameDTO name);

    CustomerStatisticsResponseDTO getCustomerStatistics(String startDate, String endDate);
}
