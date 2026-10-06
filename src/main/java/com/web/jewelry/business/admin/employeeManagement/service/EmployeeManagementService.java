package com.web.jewelry.business.admin.employeeManagement.service;

import com.web.jewelry.dto.employeeManagement.CreateEmployeeDTO;
import com.web.jewelry.dto.employeeManagement.FindEmployeeDTO;
import com.web.jewelry.dto.employeeManagement.ListEmployeeDTO;
import com.web.jewelry.dto.employeeManagement.UpdateEmployeeDTO;
import org.springframework.data.domain.Page;

public interface EmployeeManagementService {
    String createEmployee (CreateEmployeeDTO request);

    String updateEmployee (UpdateEmployeeDTO request);

    Page<ListEmployeeDTO> searchEmployees (FindEmployeeDTO req);

    Page<ListEmployeeDTO> searchEmployeesAllInOne (FindEmployeeDTO req);

    String updateStatusEmployee (String id, Integer deleteFlag);
}
