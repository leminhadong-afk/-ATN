package com.web.jewelry.dto.employeeManagement;

import com.web.jewelry.business.common.base.PageableRequest;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FindEmployeeDTO extends PageableRequest {

    private String searchTerm;

    private Integer sex;

    private Integer role;

    private Integer deleteFlag;
}
