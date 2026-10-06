package com.web.jewelry.dto.customerManagement;

import com.web.jewelry.business.common.base.PageableRequest;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FindCustomerDTO extends PageableRequest {
    private String searchTerm;

    private Integer sex;

    private Integer deleteFlag;

}
