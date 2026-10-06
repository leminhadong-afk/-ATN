package com.web.jewelry.dto.couponManagement;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ListCouponDTO {
    private Long rowNum;

    private String id;

    private String name;

    private String code;

    private Double value;

    private Integer unit; // 0: %, 1: VND

    private Double maxValue;

    private Double minCondition;

    private Integer quantity;

    private String startDate;

    private String endDate;

    private Integer status; // 0: inactive, 1: active, 2: expired

    private Integer type;   // 0: personal, 1: public

    private List<ListCustomerIdDTO> customerId;
}
