import { Button, Input, message, Popconfirm, Space, Table, Tag } from "antd/es";
import styles from "./TypeProductManagement.module.css"; // Adjust the styles accordingly
import { useEffect, useState } from "react";
import { TypeProductManagementApi } from "../../api/admin/typeProduct/TypeProductManagementApi";
import moment from "moment";
import ModalAddTypeProduct from "./ModalAddTypeProduct"; // Import your ModalAddTypeProduct component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import { PlusOutlined } from "@ant-design/icons";

const TypeProductManagement = () => {
  const [editingKey, setEditingKey] = useState(""); // Track which row is being edited
  const [newName, setNewName] = useState(""); // Track new name input

  const [listTypeProduct, setListTypeProduct] = useState([]); // Full list of jewelry types
  const [filteredTypes, setFilteredTypes] = useState([]); // Filtered list for display
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState(""); // Track search input
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Function to fetch jewelry types
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await TypeProductManagementApi.getTypeOfJewelry(); // Adjust API call
      const typesWithRowNum = response.data.map((item, index) => ({
        ...item,
        rowNum: index + 1,
      }));
      setListTypeProduct(typesWithRowNum);
      setFilteredTypes(typesWithRowNum); // Initially, all types are displayed
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

  const handleSearchInputChange = (e) => {
    const searchValue = e.target.value;
    setSearchText(searchValue);
    if (searchValue.trim() === "") {
      setFilteredTypes(listTypeProduct); // Reset to full list when search is empty
    } else {
      const filteredData = listTypeProduct.filter((type) =>
        type.name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredTypes(filteredData);
    }
  };

  const handleEdit = (record) => {
    setEditingKey(record.id);
    setNewName(record.name);
  };

  const handleSave = async (id) => {
    const typeData = { id, name: newName };

    try {
      await TypeProductManagementApi.updateTypeOfJewelry(id, typeData); // Call API with id and data
      const updatedList = listTypeProduct.map((item) =>
        item.id === id ? { ...item, name: newName } : item
      );
      setListTypeProduct(updatedList);
      setFilteredTypes(updatedList);
      setEditingKey(""); // Reset editing state
      message.success("Loại trang sức đã được cập nhật thành công!"); // Show success message
    } catch (error) {
      console.error("Error updating type of jewelry:", error);
      message.error("Có lỗi xảy ra khi cập nhật loại trang sức!"); // Show error message
    }
  };

  // Handle delete function
  const handleDeleteType = async (id, status) => {
    console.log(id);
    console.log(status);

    try {
      if (status === 1) {
        await TypeProductManagementApi.updateStatusTypeOfJewelry(id, 0);
        console.log("Status set to 0.");
      } else {
        await TypeProductManagementApi.updateStatusTypeOfJewelry(id, 1);
        console.log("Status set to 1.");
      }

      fetchData();
      message.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Error updating type:", error);
      message.error("Có lỗi xảy ra khi cập nhật thương hiệu.");
    }
  };

  const columns = [
    { title: "STT", dataIndex: "rowNum", key: "row" },
    {
      title: "Tên loại trang sức",
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
            onConfirm={() => handleDeleteType(record.id, record.status)} // Confirm deletion
            okText="Có"
            cancelText="Không"
          >
            <Button
              icon={<FontAwesomeIcon icon={faTrash} style={{ color: "red" }} />}
            ></Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={styles.TypeProductContainer}>
      <div className={styles.headerTypeProductContainer}>
        <h1><FontAwesomeIcon icon={faBox} style={{ marginRight: '12px' }} /> Quản lý Loại trang sức</h1>
      </div>

      <div className={styles.TypeProductSearch}>
        <Input
          placeholder="Tìm kiếm loại trang sức..."
          value={searchText}
          onChange={handleSearchInputChange}
          className={styles.inputSearch}
          style={{ width: "100%", maxWidth: "500px" }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className={styles.btnAddTypeProduct}
          onClick={handleOpenModal}
        >
          Thêm loại trang sức
        </Button>
      </div>

      <div className={styles.tableCard}>
        <Table
          columns={columns}
          dataSource={filteredTypes}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
          }}
        />
      </div>

      <ModalAddTypeProduct
        isModalOpen={isModalOpen}
        handleCancel={handleModalClose}
        onTypeProductAdded={fetchData}
      />
    </div>
  );
};

export default TypeProductManagement;
