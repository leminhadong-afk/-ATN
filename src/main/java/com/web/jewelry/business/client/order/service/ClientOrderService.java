package com.web.jewelry.business.client.order.service;

import com.web.jewelry.dto.billManagement.BillResponse;
import java.util.List;

import com.web.jewelry.business.client.order.response.ClientOrderDetailResponse;

public interface ClientOrderService {
    List<BillResponse> getCurrentCustomerBills();

    ClientOrderDetailResponse getOrderDetailById(String billId);

    void cancelOrder(String billId, String reason);

    byte[] generateOrderPDF(String billId) throws Exception;
}
