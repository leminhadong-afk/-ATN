import React, { useEffect, useState } from "react";
import moment from "moment";
import { Button, Input, Space, Table, message, Popconfirm, Tag, Row, Col } from "antd";
import styles from "./MaterialManagement.module.css";
import { MaterialManagementApi } from "../../api/admin/materialManagement/MaterialManagementApi";
import ModalAddMaterial from "./ModalAddMaterial";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCogs, faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import { PlusOutlined } from "@ant-design/icons";

const MaterialManagement = () => {
  const [listMaterial, setListMaterial] = useState([]); // Full list of Materials
  const [filteredMaterials, setFilteredMaterials] = useState([]); // Filtered list for display
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState(""); // Track search input
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [editingKey, setEditingKey] = useState(""); // Track which row is being edited
  const [newName, setNewName] = useState(""); // Track new name input
  const [isModalOpen, setIsModalOpen] = useState(false);


  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // Fetch data once on initial load
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await MaterialManagementApi.getMaterial();
      const materialsWithRowNum = response.data.map((item, index) => ({
        ...item,
        rowNum: index + 1,
      }));
      setListMaterial(materialsWithRowNum);
      setFilteredMaterials(materialsWithRowNum); // Initially, all materials are displayed
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
      setFilteredMaterials(listMaterial); // Reset to full list when search is empty
    } else {
      const filteredData = listMaterial.filter((material) =>
        material.name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredMaterials(filteredData);
    }
  };

  // Handle pagination changes
  const handleTableChange = (pagination) => {
    setPagination({
      ...pagination,
      current: pagination.current,
    });
  };

  // Handle Delete Material
  const handleDeleteMaterial = async (id, statusCurrent) => {
    console.log(id);
    console.log(statusCurrent);

    try {
      if (statusCurrent === 1) {
        await MaterialManagementApi.updateStatusMaterial(id, 0);
        console.log("Status set to inactive and deleteFlag set to 1.");
      } else {
        await MaterialManagementApi.updateStatusMaterial(id, 1);
        console.log("Status set to active and deleteFlag set to 0.");
      }

      fetchData();
      message.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Error updating brand:", error);
      message.error("Có lỗi xảy ra khi cập nhật thương hiệu.");
    }
  };

  // Handle Edit Material
  const handleEdit = (record) => {
    setEditingKey(record.id);
    setNewName(record.name);
  };

  // Handle Save after editing
  const handleSave = async (id) => {
    const materialData = {
      id: id,
      name: newName,
    };

    try {
      await MaterialManagementApi.updateMaterial(id, materialData); // Call API to update material
      const updatedList = listMaterial.map(
        (item) => (item.id === id ? { ...item, name: newName } : item) // Update the list with new name
      );
      setListMaterial(updatedList);
      setFilteredMaterials(updatedList);
      setEditingKey(""); // Reset editing state
      message.success("Chất liệu đã được cập nhật thành công!"); // Success message
    } catch (error) {
      console.error("Error updating material:", error);
      message.error("Có lỗi xảy ra khi cập nhật chất liệu!"); // Error message
    }
  };

  const columns = [
    { title: "STT", dataIndex: "rowNum", key: "row" },
    {
      title: "Tên chất liệu",
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
            onConfirm={() => handleDeleteMaterial(record.id, record.status)} // Confirm deletion
            onCancel={() => console.log("Delete canceled")}
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

  return (
    <div className={styles.materialContainer}>
      <Row justify="space-between" align="middle" className={styles.pageHeader}>
        <Col>
          <h1 className={styles.pageTitle}>
            <FontAwesomeIcon icon={faCogs} style={{ marginRight: '12px', color: '#1a365d' }} /> Quản lý Chất liệu
          </h1>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className={styles.btnAddMaterial}
            onClick={handleOpenModal}
          >
            Thêm chất liệu mới
          </Button>
        </Col>
      </Row>

      <div className={styles.filterSection}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} lg={16}>
            <div className={styles.filterBlock}>
              <span className={styles.filterLabel}>Tìm kiếm:</span>
              <Input
                placeholder="Nhập tên chất liệu để tìm kiếm..."
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
          dataSource={filteredMaterials}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Hiển thị tổng số ${total} chất liệu`
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </div>

      <ModalAddMaterial
        isModalOpen={isModalOpen}
        handleCancel={handleModalClose}
        onMaterialAdded={fetchData}
      />
    </div>
  );
};

export default MaterialManagement;
