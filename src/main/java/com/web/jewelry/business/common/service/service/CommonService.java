package com.web.jewelry.business.common.service.service;

import com.web.jewelry.entity.EmployeeEntity;
import com.web.jewelry.entity.CustomerEntity;

public interface CommonService {

    EmployeeEntity getCurrentEmployee();

    CustomerEntity getCurrentCustomer();
}
