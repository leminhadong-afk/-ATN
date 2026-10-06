package com.web.jewelry.dto.billHistoryManagement;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ListBillHistoryDTO {

    private String id;
    private String billId;
    private Integer status;
    private String note;
    private Long createdDate;
}
