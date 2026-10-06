package com.web.jewelry.dto.customerManagement;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerStatisticsResponseDTO {
    private Long totalCustomersThisMonth;
    private List<TopCustomerResponse> topCustomers;
}

