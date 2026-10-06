import React, { useEffect, useState } from "react";
import styles from "./EmployeeManagement.module.css";
import {
  Button,
  Input,
  message,
  Pagination,
  Popconfirm,
  Radio,
  Select,
  Table,
  Tag,
} from "antd";
import { EmployeeManagementApi } from "../../api/admin/employeeManagement/EmployeeManagementApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router";
import ModalEmployeeDetail from "./modalEmployeeDetail/ModalEmployeeDetail";
import { Search } from "@mui/icons-material";
import { PlusOutlined } from "@ant-design/icons";

const EmployeeManagement = () => {
  const [listEmployees, setListEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleteFlag, setDeleteFlag] = useState(null);
  const [sex, setSex] = useState(null);
  const [role, setRole] = useState(null);

  const [searchEmployee, setSearchEmployee] = useState({
    page: 0,
    size: 10,
    searchTerm: "",
  });

  const navigate = useNavigate();

  const fetchData = async (page = 1, size = 10) => {
    console.log(`Fetching page: ${page}, size: ${size}`);
    setLoading(true);
    const params = {
      page: page - 1,
      size: size,
    };

    try {
      const response = await EmployeeManagementApi.searchByData(params);
      console.log("Response data:", response.data);
      setListEmployees(response.data.content);
      setTotalItems(response.data.totalElements);
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (employee) => {
    setSelectedEmployee(employee); // Cập nhật nhân viên được chọn
    console.log("Selected Employee Data:", employee);
    setIsModalOpen(true); // Mở modal
  };

  const handleModalClose = async (refresh = false) => {
    setIsModalOpen(false);
    if (refresh) {
      // Fetch lại data
      const params = {
        page: currentPage - 1,
        size: pageSize,
      };
      try {
        const response = await EmployeeManagementApi.searchByData(params);
        setListEmployees(response.data.content);
        setTotalItems(response.data.totalElements);
        
        // Update selectedEmployee với data mới từ response nếu có
        if (selectedEmployee) {
          const updatedEmployee = response.data.content.find(
            (emp) => emp.employeeCode === selectedEmployee.employeeCode
          );
          if (updatedEmployee) {
            setSelectedEmployee(updatedEmployee);
            console.log("Updated selectedEmployee with new data:", updatedEmployee);
          }
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    }
  };

  const columns = [
    { title: "STT", dataIndex: "rowNum", key: "row" },
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mã nhân viên",
      dataIndex: "employeeCode",
      key: "employeeCode",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Giới tính",
      dataIndex: "sex",
      key: "sex",
      render: (sex) => (sex === 1 ? "Nam" : "Nữ"),
    },
    {
      title: "Chức vụ",
      dataIndex: "role",
      key: "role",
      render: (role) => (role === 1 ? "Nhân viên" : "Quản lý"),
    },
    {
      title: "Trạng thái",
      dataIndex: "deleteFlag",
      key: "deleteFlag",
      render: (deleteFlag) =>
        deleteFlag === 0 ? (
          <Tag color="green">Đang hoạt động</Tag>
        ) : (
          <Tag color="red">Dừng hoạt động</Tag>
        ),
    },
    {
      title: "Thao tác",
      dataIndex: "action",
      key: "action",
      render: (text, record) => (
        <div>
          <Button
            size="small"
            onClick={() => handleOpenModal(record)}
            style={{
              marginLeft: "10px",
              borderRadius: "5px",
              margin: "10px",
              padding: "10px",
            }}
          >
            <FontAwesomeIcon icon={faEye} />
          </Button>
          <Popconfirm
            title={
              record.deleteFlag === 0
                ? "Bạn chắc muốn dừng hoạt động nhân sự này chứ?"
                : "Bạn có chắc chắn muốn kích hoạt lại nhân sự này chứ?"
            }
            onConfirm={() => handleDeleteEmployee(record.id, record.deleteFlag)} // Confirm deletion
            okText="Có"
            cancelText="Không"
          >
            <Button
              icon={<FontAwesomeIcon icon={faTrash} style={{ color: "red" }} />}
            ></Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Handle delete function
  const handleDeleteEmployee = async (id, deleteFlag) => {
    console.log(id);
    console.log(deleteFlag);

    try {
      if (deleteFlag === 1) {
        await EmployeeManagementApi.updateDeleteFlagEmployee(id, 0);
        console.log("Status set to 0.");
      } else {
        await EmployeeManagementApi.updateDeleteFlagEmployee(id, 1);
        console.log("Status set to 1.");
      }

      fetchData();
      message.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Error updating type:", error);
      message.error("Có lỗi xảy ra khi cập nhật thương hiệu.");
    }
  };

  const handleAddEmployee = () => {
    navigate("/add-employee-management");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target; // Lấy name và value của input
    setSearchEmployee((prevState) => ({
      ...prevState,
      [name]: value, // Cập nhật giá trị tương ứng với name của input
    }));
  };

  const handleSearch = async () => {
    console.log(searchEmployee);

    // Ép kiểu deleteFlag sang số, nếu deleteFlag là rỗng hoặc null thì để undefined
    const parsedDeleteFlag =
      deleteFlag !== "" && deleteFlag !== null
        ? parseInt(deleteFlag, 10)
        : undefined;
    console.log("deleteFlag: " + parsedDeleteFlag);

    // Ép kiểu sex sang số, nếu sex là null thì để undefined
    const parsedSex = sex !== null ? parseInt(sex, 10) : undefined;
    console.log("sex: " + parsedSex);

    // Ép kiểu role sang số, nếu role là null thì để undefined
    const parsedRole = role !== null ? parseInt(role, 10) : undefined;
    console.log("role: " + parsedRole);

    const params = {
      searchTerm: searchEmployee.searchTerm,
      deleteFlag: parsedDeleteFlag,
      sex: parsedSex,
      role: parsedRole,
      page: searchEmployee.page,
      size: searchEmployee.size,
    };

    console.log(params);

    try {
      const response = await EmployeeManagementApi.searchByData(params);
      setListEmployees(response.data.content);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  const handleRefresh = () => {
    // Reset các state về giá trị mặc định
    setSearchEmployee({ searchTerm: "", page: 0, size: 10 });
    setDeleteFlag(null);
    setSex(null);
    setRole(null);
    fetchData(); // Fetch the full product list again
  };

  return (
    <div>
      <h1>Danh sách nhân viên</h1>

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "10px",
          padding: "10px",
          marginBottom: "20px",
          boxShadow: "0px 0px 5px 0px #ccc",
        }}
      >
        <div className={styles.header}>
          <div className={styles.searchContainer}>
            {/* Input tìm kiếm */}
            <Input
              className={styles.inputSearch}
              placeholder="Tìm kiếm ..."
              name="searchTerm" // Đặt name cho input
              value={searchEmployee.searchTerm}
              onChange={handleInputChange}
            />

            {/* Tùy chọn trạng thái */}
            <div className={styles.radioContainer}>
              <span className={styles.statusLabel}>Trạng thái: </span>
              <Radio.Group
                onChange={(e) => setDeleteFlag(e.target.value)}
                value={deleteFlag}
              >
                <Radio value="">Tất cả</Radio>
                <Radio value="0">Đang hoạt động</Radio>
                <Radio value="1">Ngừng hoạt động</Radio>
              </Radio.Group>
            </div>
          </div>
        </div>

        <div>
          <div className={styles.selectSearch}>
            <div>
              <label>Giới tính: </label>
              <Select
                placeholder="Giới tính..."
                options={[
                  { value: 1, label: "Nam" },
                  { value: 0, label: "Nữ" },
                ]}
                onChange={(value) => setSex(value)}
                value={sex}
                allowClear
              ></Select>
            </div>
            <div>
              <label>Chức vụ: </label>
              <Select
                placeholder="Trạng thái..."
                options={[
                  { value: 1, label: "Nhân viên" },
                  { value: 0, label: "Quản lý" },
                ]}
                onChange={(value) => setRole(value)}
                value={role}
                allowClear
              ></Select>
            </div>
          </div>
        </div>

        <div className={styles.containerSearchReset}>
          <Button
            className={styles.btnRefreshProduct}
            onClick={handleRefresh}
            style={{ marginLeft: "8px" }} // Add some margin for spacing
          >
            Refresh
          </Button>
          <Button
            className={styles.btnSearchProduct}
            type="primary"
            onClick={handleSearch}
          >
            Tìm kiếm
          </Button>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "10px",
          padding: "10px",
          marginBottom: "20px",
          boxShadow: "0px 0px 5px 0px #ccc",
        }}
      >
        <div className={styles.employeeContainer}>
          <div className={styles.AddEmployeeBtnContainer}>
            <Button
              icon={<PlusOutlined />}
              style={{
                backgroundColor: "orange",
                borderColor: "orange",
                color: "white",
              }}
              onClick={handleAddEmployee}
            >
              Thêm nhân viên
            </Button>
          </div>
          <Table
            loading={loading}
            columns={columns}
            dataSource={listEmployees}
            rowKey="id"
            pagination={false}
          />

          <Pagination
            style={{
              padding: "20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
            }}
            simple
            current={currentPage}
            pageSize={pageSize}
            total={totalItems}
            onChange={handlePageChange}
            showSizeChanger
            pageSizeOptions={["10", "20", "50", "100"]}
          />
        </div>
      </div>

      <ModalEmployeeDetail
        isModalOpen={isModalOpen}
        handleCancel={handleModalClose}
        employeeDetail={selectedEmployee} // Truyền thông tin chi tiết nhân viên vào modal
      />
    </div>
  );
};

export default EmployeeManagement;
