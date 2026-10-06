import { Button, Input, message, Popconfirm, Space, Table, Tag, Row, Col } from "antd";
import styles from "./brandManagement.module.css";
import { useEffect, useState } from "react";
import { BrandManagementApi } from "../../api/admin/brandManagement/BrandManagementApi";
import moment from "moment";
import ModalAddBrand from "./ModalAddBrand"; // Import your ModalAddBrand component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrash, faTrademark } from "@fortawesome/free-solid-svg-icons";
import { PlusOutlined } from "@ant-design/icons";

const BrandManagement = () => {
  const [editingKey, setEditingKey] = useState(""); // Track which row is being edited
  const [newName, setNewName] = useState(""); // Track new name input
  const [statusCurrent, setStatusCurrent] = useState("");

  const [listBrand, setListBrand] = useState([]); // Full list of brands
  const [filteredBrands, setFilteredBrands] = useState([]); // Filtered list for display
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState(""); // Track search input
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const handleDeleteBrand = async (id, currentStatus) => {
    console.log("Function triggered");
    console.log("ID:", id);
    console.log("Current Status:", currentStatus);

    const deleteFlagData = {
      id,
      deleteFlag: currentStatus === 1 ? 1 : 0,
    };

    try {
      if (currentStatus === 1) {
        await BrandManagementApi.updateStatus(id, 0);
        await BrandManagementApi.updateDeleteFlag(deleteFlagData);
        console.log("Status set to inactive and deleteFlag set to 1.");
      } else {
        await BrandManagementApi.updateStatus(id, 1);
        await BrandManagementApi.updateDeleteFlag(deleteFlagData);
        console.log("Status set to active and deleteFlag set to 0.");
      }

      // Optional: Refresh the data after updating
      fetchData(); // Make sure fetchData is defined and fetches the updated brand list
      message.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Error updating brand:", error);
      message.error("Có lỗi xảy ra khi cập nhật thương hiệu.");
    }
  };

  const columns = [
    { title: "STT", dataIndex: "rowNum", key: "row" },
    {
      title: "Tên hãng",
      dataIndex: "name",
      key: "name",
      render: (text, record) => {
        const editable = editingKey === record.id; // Check if the current row is being edited
        return editable ? (
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onPressEnter={() => handleSave(record.id)} // Save on Enter key press
          />
        ) : (
          <span>{text}</span>
        );
      },
    },

    {
      title: "Ngày thêm",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (text) => moment(text).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (text) => (
        <Tag color={text === 1 ? "green" : "red"} className={styles.largeTag}>
          {text === 1 ? "Đang hoạt động" : "Ngừng hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          {editingKey === record.id ? (
            <>
              <Button type="primary" onClick={() => handleSave(record.id)}>
                Save
              </Button>
              <Button onClick={() => setEditingKey("")}>Cancel</Button>
            </>
          ) : (
            <Button onClick={() => handleEdit(record)}>
              <FontAwesomeIcon icon={faEye} />
            </Button>
          )}
          <Popconfirm
            title={
              record.status === 1
                ? "Bạn chắc muốn dừng hoạt động thương hiệu này chứ?"
                : "Bạn có chắc chắn muốn kích hoạt lại thương hiệu này chứ?"
            }
            onConfirm={() => handleDeleteBrand(record.id, record.status)}
            onCancel={() => console.log("Delete canceled")}
            okText="Có"
            cancelText="Không"
          >
            {/* Replace the Delete button with the Font Awesome icon */}
            <Button
              icon={<FontAwesomeIcon icon={faTrash} style={{ color: "red" }} />}
            ></Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Fetch data once on initial load
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await BrandManagementApi.getBrands();
      const brandsWithRowNum = response.data.map((item, index) => ({
        ...item,
        name: item.name.toUpperCase(),
        rowNum: index + 1,
      }));
      setListBrand(brandsWithRowNum);
      setFilteredBrands(brandsWithRowNum); // Initially, all brands are displayed
      setPagination((prev) => ({
        ...prev,
        total: response.data.totalElements,
      }));
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle search input changes
  const handleSearchInputChange = (e) => {
    const searchValue = e.target.value;
    setSearchText(searchValue);
    if (searchValue.trim() === "") {
      setFilteredBrands(listBrand); // Reset to full list when search is empty
    } else {
      const filteredData = listBrand.filter((brand) =>
        brand.name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredBrands(filteredData);
    }
  };

  // Handle pagination changes
  const handleTableChange = (pagination) => {
    setPagination({
      ...pagination,
      current: pagination.current,
    });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleEdit = (record) => {
    console.log(record.id);
    console.log(record.name);
    console.log(record.status);

    setEditingKey(record.id);
    setNewName(record.name);
    setStatusCurrent(record.status);
  };

  const handleSave = async (id) => {
    // Construct the brandData object with the necessary fields
    const brandData = {
      id: id, // Pass the id of the brand to be updated
      name: newName, // Use the updated name from the input
      status: statusCurrent, // Include the current status if needed
    };

    console.log(brandData);

    try {
      // Call the updateBrands API with the brandData object
      await BrandManagementApi.updateBrands(brandData); // Gọi API với brandData

      // Update the local state to reflect the change
      const updatedList = listBrand.map(
        (item) =>
          item.id === id
            ? { ...item, name: newName, status: statusCurrent }
            : item // Update both name and status if necessary
      );

      // Update the state with the new brand list
      setListBrand(updatedList);
      setFilteredBrands(updatedList);
      setEditingKey(""); // Reset editing state

      // Show a success message to the user
      message.success("Thương hiệu đã được cập nhật thành công!");
    } catch (error) {
      console.error("Error updating brand:", error);
      message.error("Có lỗi xảy ra khi cập nhật thương hiệu!"); // Show error message
    }
  };

  return (
    <div className={styles.brandContainer}>
      <Row justify="space-between" align="middle" className={styles.pageHeader}>
        <Col>
          <h1 className={styles.pageTitle}>
            <FontAwesomeIcon icon={faTrademark} style={{ marginRight: '12px', color: '#1a365d' }} /> Quản lý Thương hiệu
          </h1>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className={styles.btnAddBrand}
            onClick={handleOpenModal}
          >
            Thêm thương hiệu mới
          </Button>
        </Col>
      </Row>

      <div className={styles.filterSection}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} lg={16}>
            <div className={styles.filterBlock}>
              <span className={styles.filterLabel}>Tìm kiếm:</span>
              <Input
                placeholder="Nhập tên thương hiệu để tìm kiếm..."
                value={searchText}
                onChange={handleSearchInputChange}
                className={styles.inputSearch}
              />
            </div>
          </Col>
        </Row>
      </div>

      <div className={styles.tableWrapper}>
        <Table
          columns={columns}
          dataSource={filteredBrands}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Hiển thị tổng số ${total} thương hiệu`
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </div>

      <ModalAddBrand
        isModalOpen={isModalOpen}
        handleCancel={handleModalClose}
        onBrandAdded={fetchData}
      />
    </div>
  );
};

export default BrandManagement;
