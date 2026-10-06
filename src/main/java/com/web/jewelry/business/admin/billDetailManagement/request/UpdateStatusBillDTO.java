package com.web.jewelry.business.admin.billDetailManagement.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateStatusBillDTO {
    private String billId;
    private Integer status;
    private String notes;
}
