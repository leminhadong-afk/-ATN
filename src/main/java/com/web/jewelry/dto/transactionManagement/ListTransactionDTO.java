package com.web.jewelry.dto.transactionManagement;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ListTransactionDTO {
    private String id;
    private String billId;
    private Integer status;
    private Double money;
    private Long createdDate;
    private Integer typeMethod;
    private String employeeName;
    private Integer typeTransaction;
}
