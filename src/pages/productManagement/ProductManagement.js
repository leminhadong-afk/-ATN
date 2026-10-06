import styles from "./ProductManagement.module.css";
import { ProductManagementApi } from "../../api/admin/productManagement/ProductManagementApi";
import {
  Space,
  Table,
  Button,
  Radio,
  Pagination,
  Select,
  message,
  Input,
  Tag,
  Card,
  Row,
  Col,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faSearch, faSync } from "@fortawesome/free-solid-svg-icons";
import { PlusOutlined } from "@ant-design/icons";

const ProductManagement = () => {
  const [listProduct, setListProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [name, setName] = useState("");
  const [status, setStatus] = useState("null");

  const [editingProductId, setEditingProductId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingStatus, setEditingStatus] = useState(null);

  const columns = [
    {
      title: "STT",
      dataIndex: "rowNum",
      key: "row",
      width: 80,
      align: 'center'
    },
    {
      title: "Mã sản phẩm",
      dataIndex: "productCode",
      key: "productCode",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
      width: 380,
      render: (text, record) =>
        editingProductId === record.id ? (
          <Input
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            placeholder="Nhập tên sản phẩm"
          />
        ) : (
          <span style={{ fontWeight: 500 }}>{text}</span>
        ),
    },
    {
      title: "Ngày thêm",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 120,
      render: (text) => (
        <span style={{ color: '#64748b' }}>
          {moment(text).format("DD/MM/YYYY")}
        </span>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      width: 80,
      align: 'center',
      render: (text) => (
        <span style={{
          fontWeight: 600,
          color: text > 0 ? '#10b981' : '#ef4444'
        }}>
          {text}
        </span>
      )
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      width: 120,
      render: (status, record) =>
        editingProductId === record.id ? (
          <Select
            value={editingStatus !== null ? editingStatus : undefined}
            onChange={(value) => setEditingStatus(value)}
            style={{ width: "100%" }}
            placeholder="Chọn trạng thái"
          >
            <Select.Option value={1}>Đang bán</Select.Option>
            <Select.Option value={0}>Dừng bán</Select.Option>
          </Select>
        ) : status == 1 ? (
          <Tag color="success" style={{ margin: 0 }}>
            Còn hàng
          </Tag>
        ) : (
          <Tag color="error" style={{ margin: 0 }}>
            Hết hàng
          </Tag>
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (text, record) => (
        <Space size="small">
          <Button
            type="text"
            onClick={() => navigate(`/product-detail-management/${record.id}`)}
            icon={<FontAwesomeIcon icon={faEye} />}
            title="Xem chi tiết"
          />

          {editingProductId === record.id ? (
            <>
              <Button
                type="primary"
                size="small"
                onClick={() => handleSave(record.id)}
              >
                Lưu
              </Button>
              <Button
                size="small"
                onClick={handleCancelEdit}
              >
                Hủy
              </Button>
            </>
          ) : (
            <Button
              type="primary"
              size="small"
              onClick={() => handleEdit(record)}
            >
              Sửa
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleEdit = (record) => {
    console.log(record.productName);

    setEditingProductId(record.id);
    setEditingName(record.productName);
    // Convert status to number to match Select.Option values (1 or 0)
    const statusNumber = typeof record.status === 'string'
      ? parseInt(record.status, 10)
      : record.status;
    setEditingStatus(statusNumber);
  };

  const handleSave = async (id) => {
    console.log(editingName);
    console.log(editingStatus);

    try {
      await ProductManagementApi.updateNameAndStatusProduct(
        id,
        editingName,
        editingStatus
      );
      setEditingProductId(null);
      fetchData(currentPage, pageSize);
      message.success("Cập nhật sản phẩm thành công!");
    } catch (error) {
      message.error("Có lỗi khi cập nhật sản phẩm!");
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
  };

  const fetchData = async (page = 1, size = 10) => {
    console.log(`Fetching page: ${page}, size: ${size}`);
    setLoading(true);
    const params = {
      name: name,
      status:
        status === "all" || status === "null"
          ? undefined
          : status === 1
            ? 1
            : status,
      page: page - 1,
      size: size,
    };

    try {
      const response = await ProductManagementApi.getProducts(params);
      console.log("Response data:", response.data);

      // Update status if totalQuantity is 0
      const updatedProducts = response.data.content.map((product) => {
        product.status = product.status.toString();
        if (product.totalQuantity === 0) {
          return { ...product, status: "0" }; // Set status to 0 (Dừng bán) if totalQuantity is 0
        }

        return product;
      });

      setListProduct(updatedProducts);
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

  // Xử lý khi người dùng thay đổi trang hoặc số lượng sản phẩm mỗi trang
  const handlePageChange = (page, size) => {
    setCurrentPage(page); // Cập nhật trang hiện tại
    setPageSize(size); // Cập nhật kích thước trang
  };

  const handleSearch = async () => {
    console.log(name);
    console.log("status");
    console.log(typeof status);
    console.log(status);
    const statusNumber = parseInt(status, 10);
    console.log("statusNumber:", statusNumber);
    console.log(typeof statusNumber);

    try {
      // Prepare the search parameters
      const params = {};

      // Chỉ thêm name nếu có giá trị
      if (name) {
        params.name = name;
      }

      // Chỉ thêm status nếu có giá trị khác "all" và "null"

      if (statusNumber === 0) {
        params.status = 0; // Truyền status là 0 cho "Dừng bán"
      } else if (statusNumber === 1) {
        params.status = statusNumber; // Truyền status là 1 cho "Đang bán"
      } else {
        params.name = ""; // Truyền status là 1 cho "Đang bán"
      }

      const response = await ProductManagementApi.getProducts(params);
      setListProduct(response.data.content);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  const handleRefresh = () => {
    setName(""); // Reset the name field
    setStatus("null"); // Reset the status field to the default value
    fetchData(); // Fetch the full product list again
  };

  const handleShowAddProduct = () => {
    navigate("/add-product-management");
  };

  return (
    <div className={styles.productContainer}>
      <Row justify="space-between" align="middle" className={styles.pageHeader}>
        <Col>
          <h1 className={styles.pageTitle}>Quản lý sản phẩm</h1>
        </Col>
        <Col>
          <Button
            icon={<PlusOutlined />}
            className={styles.btnAddProduct}
            onClick={handleShowAddProduct}
            type="primary"
          >
            Thêm sản phẩm mới
          </Button>
        </Col>
      </Row>

      <div className={styles.filterSection}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} lg={8}>
            <div className={styles.filterBlock}>
              <span className={styles.filterLabel}>Tìm kiếm:</span>
              <Input
                className={styles.inputSearch}
                placeholder="Nhập tên sản phẩm..."
                onChange={(e) => setName(e.target.value)}
                value={name}
                onPressEnter={handleSearch}
                prefix={<FontAwesomeIcon icon={faSearch} style={{ color: "#94a3b8" }} />}
                allowClear
              />
            </div>
          </Col>
          <Col xs={24} lg={10}>
            <div className={styles.filterBlock}>
              <span className={styles.filterLabel}>Trạng thái:</span>
              <div className={styles.radioGroupWrapper}>
                <Radio.Group
                  onChange={(e) => setStatus(e.target.value)}
                  value={status}
                  optionType="button"
                  buttonStyle="solid"
                >
                  <Radio.Button value="all">Tất cả</Radio.Button>
                  <Radio.Button value={1}>Đang bán</Radio.Button>
                  <Radio.Button value={0}>Dừng bán</Radio.Button>
                </Radio.Group>
              </div>
            </div>
          </Col>
          <Col xs={24} lg={6}>
            <div className={styles.actionButtonGroup}>
              <Button onClick={handleRefresh} icon={<FontAwesomeIcon icon={faSync} />} className={styles.actionBtn}>
                Làm mới
              </Button>
              <Button type="primary" onClick={handleSearch} icon={<FontAwesomeIcon icon={faSearch} />} className={styles.actionBtn}>
                Tìm kiếm
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      <div className={styles.tableWrapper}>
        <Table
          columns={columns}
          dataSource={listProduct}
          loading={loading}
          rowKey="id"
          pagination={false}
          scroll={{ x: "max-content" }}
        />
        <div className={styles.paginationWrapper}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalItems}
            onChange={handlePageChange}
            showSizeChanger
            pageSizeOptions={["10", "20", "50", "100"]}
            showTotal={(total) => `Hiển thị tổng số ${total} sản phẩm`}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
