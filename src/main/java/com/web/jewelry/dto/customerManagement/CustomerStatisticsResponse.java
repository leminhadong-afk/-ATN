package com.web.jewelry.dto.customerManagement;

import java.util.List;

public interface CustomerStatisticsResponse {
    Long getTotalCustomersThisMonth();
    List<TopCustomerResponse> getTopCustomers();
}
