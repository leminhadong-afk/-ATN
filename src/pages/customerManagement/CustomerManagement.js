import React, { useEffect, useState } from "react";
import styles from "./CustomerManagement.module.css";
import {
  Button,
  Input,
  message,
  Popconfirm,
  Radio,
  Select,
  Table,
  Tag,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router";
import { CustomerManagementApi } from "../../api/admin/customerManagement/CustomerManagementApi";
import ModalCustomerDetail from "./addCustomer/modalCustomerDetail/ModalCustomerDetail";
import { PlusOutlined } from "@ant-design/icons";

const CustomerManagement = () => {
  const [listCustomer, setListCustomer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedCustomer, setSelectCustomer] = useState(null);
  const [deleteFlag, setDeleteFlag] = useState(null);
  const [sex, setSex] = useState(null);

  const [searchCustomer, setSearchCustomer] = useState({
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
      const response = await CustomerManagementApi.search(params);
      console.log("Response data:", response.data);
      setListCustomer(response.data.content);
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

  const handleOpenModal = (customer) => {
    console.log(customer);

    setSelectCustomer(customer); // Cập nhật nhân viên được chọn
    setIsModalOpen(true); // Mở modal
  };

  const handleModalClose = (refresh = false) => {
    setIsModalOpen(false);
    if (refresh) {
      fetchData(currentPage, pageSize); // Gọi lại API để load dữ liệu mới
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
      dataIndex: "customerCode",
      key: "customerCode",
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
                ? "Bạn chắc muốn dừng hoạt động khách hàng này chứ?"
                : "Bạn có chắc chắn muốn kích hoạt lại khách hàng này chứ?"
            }
            onConfirm={() => handleDeleteCustomer(record.id, record.deleteFlag)} // Confirm deletion
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
  const handleDeleteCustomer = async (id, deleteFlag) => {
    console.log(id);
    console.log(deleteFlag);

    try {
      if (deleteFlag === 1) {
        await CustomerManagementApi.updateDeleteFlagCustomer(id, 0);
        console.log("Status set to 0.");
      } else {
        await CustomerManagementApi.updateDeleteFlagCustomer(id, 1);
        console.log("Status set to 1.");
      }

      fetchData();
      message.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Error updating type:", error);
      message.error("Có lỗi xảy ra khi cập nhật thương hiệu.");
    }
  };

  const handleAddCustomer = () => {
    navigate("/add-customer-management");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target; // Lấy name và value của input
    setSearchCustomer((prevState) => ({
      ...prevState,
      [name]: value, // Cập nhật giá trị tương ứng với name của input
    }));
  };

  const handleSearch = async () => {
    console.log(searchCustomer);

    // Ép kiểu deleteFlag sang số, nếu deleteFlag là rỗng hoặc null thì để undefined
    const parsedDeleteFlag =
      deleteFlag !== "" && deleteFlag !== null
        ? parseInt(deleteFlag, 10)
        : undefined;
    console.log("deleteFlag: " + parsedDeleteFlag);

    // Ép kiểu sex sang số, nếu sex là null thì để undefined
    const parsedSex = sex !== null ? parseInt(sex, 10) : undefined;
    console.log("sex: " + parsedSex);

    const params = {
      searchTerm: searchCustomer.searchTerm,
      deleteFlag: parsedDeleteFlag,
      sex: parsedSex,
      page: searchCustomer.page,
      size: searchCustomer.size,
    };

    console.log(params);

    try {
      const response = await CustomerManagementApi.search(params);
      setListCustomer(response.data.content);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  const handleRefresh = () => {
    // Reset các state về giá trị mặc định
    setSearchCustomer({ searchTerm: "", page: 0, size: 10 });
    setDeleteFlag(null);
    setSex(null);
    fetchData(); // Fetch the full product list again
  };

  return (
    <div>
      <h1>Danh sách khách hàng</h1>

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
              value={searchCustomer.searchTerm}
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
            <Button icon={<PlusOutlined />}
            style={{
              backgroundColor: "orange",
              borderColor: "orange",
              color: "white",
            }} onClick={handleAddCustomer}>
              Thêm khách hàng
            </Button>
          </div>
          <Table
            loading={loading}
            columns={columns}
            dataSource={listCustomer}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalItems,
              onChange: handlePageChange,
            }}
          />
        </div>
      </div>

      <ModalCustomerDetail
        isModalOpen={isModalOpen}
        handleCancel={handleModalClose}
        customerDetail={selectedCustomer} // Truyền thông tin chi tiết nhân viên vào modal
      />
    </div>
  );
};

export default CustomerManagement;
