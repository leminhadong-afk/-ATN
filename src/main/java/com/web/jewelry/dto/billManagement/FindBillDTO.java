package com.web.jewelry.dto.billManagement;

import com.web.jewelry.business.common.base.PageableRequest;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class FindBillDTO extends PageableRequest {

    private String searchTerm;

    private String datePaymentStart;

    private String type;

    private Integer status;

    private String datePaymentEnd;

}
