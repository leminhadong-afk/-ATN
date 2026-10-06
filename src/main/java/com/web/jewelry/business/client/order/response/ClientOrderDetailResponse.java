package com.web.jewelry.business.client.order.response;

import com.web.jewelry.dto.billManagement.BillResponse;
import com.web.jewelry.entity.BillDetailEntity;
import com.web.jewelry.entity.BillHistoryEntity;
import com.web.jewelry.entity.ProductDetailEntity;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class ClientOrderDetailResponse {
    private BillResponse bill;
    private List<BillDetailEntity> billDetails;
    private List<BillHistoryEntity> timeline;
    private List<ProductDetailEntity> productDetails;
    private Double totalAmount;
    private Double finalAmount;
}