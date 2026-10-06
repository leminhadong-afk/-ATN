import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./ModalAddProduct.module.css";
import {
  Button,
  Modal,
  Table,
  Input,
  Slider,
  Select,
  Upload,
  Spin,
  Pagination,
  message,
} from "antd";
import React, { useEffect, useState } from "react";
import { SizeManagementApi } from "../../../api/admin/sizeManagement/SizeManagementApi";
import { MaterialManagementApi } from "../../../api/admin/materialManagement/MaterialManagementApi";
import { ColorManagementApi } from "../../../api/admin/colorManagemnet/ColorManagementApi";
import { TypeProductManagementApi } from "../../../api/admin/typeProduct/TypeProductManagementApi";
import { BrandManagementApi } from "../../../api/admin/brandManagement/BrandManagementApi";
import { ProductDetailManagementApi } from "../../../api/admin/productDetailManagement/productDetailManagementApi";
import { FileUploadApi } from "../../../api/admin/fileUpload/FileUploadApi";
import ModalConfirmAddProductBill from "./modalConfirmAddProductBill/ModalConfirmAddProductBill";

const ModalAddProduct = ({
  isModalOpen,
  handleCancel,
  onProductsSelected,
  billIdSelected,
  getBillDetails,
}) => {
  const [brandOptions, setBrandOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);

  // Thêm useState để lưu các lựa chọn option
  const [searchText, setSearchText] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const [loading, setLoading] = useState(true);
  const [listProductDetails, setListProductDetails] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [listSelectRow, setListSelectRow] = useState([]);

  const [listProductSelected, setListProductSelected] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState([]);

  const [isModalOpendExtra, setIsModalOpenExtra] = useState(false);

  const handleOpenModalExtra = (product) => {
    setSelectedProduct(product);
    console.log("selectedProduct");

    console.log(selectedProduct);

    setIsModalOpenExtra(true);
  };

  const handleModalCloseExtra = () => {
    setIsModalOpenExtra(false);
  };

  const getBrand = async () => {
    try {
      const response = await BrandManagementApi.getBrands();
      setBrandOptions(
        response.data.map((brand) => ({
          value: brand.id,
          label: brand.name,
        }))
      );
      console.log(response.data);
    } catch (error) {
      console.error("Failed to fetch brands", error);
    }
  };

  const getProductType = async () => {
    try {
      const response = await TypeProductManagementApi.getTypeOfJewelry();
      setTypeOptions(
        response.data.map((TypeProduct) => ({
          value: TypeProduct.id,
          label: TypeProduct.name,
        }))
      );
      console.log(response.data);
    } catch (error) {
      console.error("Failed to fetch type of shoe", error);
    }
  };

  const getColor = async () => {
    try {
      const response = await ColorManagementApi.getColor();
      setColorOptions(
        response.data.map((color) => ({
          value: color.id,
          label: color.name,
        }))
      );
      console.log(response.data);
    } catch (error) {
      console.error("Failed to fetch type of shoe", error);
    }
  };

  const getMaterial = async () => {
    try {
      const response = await MaterialManagementApi.getMaterial();
      setMaterialOptions(
        response.data.map((material) => ({
          value: material.id,
          label: material.name,
        }))
      );
      console.log(response.data);
    } catch (error) {
      console.error("Failed to fetch material", error);
    }
  };

  const getSize = async () => {
    try {
      const response = await SizeManagementApi.getSize();
      setSizeOptions(
        response.data.map((size) => ({
          value: size.id,
          label: size.name,
        }))
      );
      console.log(response.data);
    } catch (error) {
      console.error("Failed to fetch size", error);
    }
  };

  useEffect(() => {
    getProductType();
    getBrand();
    getColor();
    getMaterial();
    getSize();
  }, []);

  const handleOk = async () => {
    handleCancel(); // Đóng modal
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "rowNum",
      key: "rowNum",
    },
    {
      title: "Ảnh",
      dataIndex: "urlImg",
      key: "urlImg",
      render: (value, record) =>
        listSelectRow.includes(record.productDetailId) ? (
          <Upload
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            action="/upload" // URL upload của bạn
            maxCount={1}
            onChange={({ file }) => handleFileChange(file, record)}
          >
            {loading ? ( // Kiểm tra trạng thái loading
              <div>
                <Spin /> {/* Biểu tượng loading */}
              </div>
            ) : value ? (
              <img
                src={value}
                alt="product-img"
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <div>Upload</div>
            )}
          </Upload>
        ) : (
          <img src={value} width={150} />
        ),
    },
    {
      title: "Mã SP",
      dataIndex: "productCode",
      key: "productCode",
    },
    {
      title: "Tên SP",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Thương hiệu",
      dataIndex: "brandName",
      key: "brandName",
    },
    {
      title: "Loại trang sức",
      dataIndex: "typeName",
      key: "typeName",
    },
    {
      title: "Chất liệu",
      dataIndex: "materialName",
      key: "materialName",
    },
    {
      title: "Màu sắc",
      dataIndex: "colorName",
      key: "colorName",
    },
    {
      title: "Size",
      dataIndex: "sizeName",
      key: "sizeName",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Giá sản phẩm",
      dataIndex: "price",
      key: "price",
      render: (text, record) =>
        listSelectRow.includes(record.productDetailId) ? (
          <Input
            key={`price-${record.productDetailId}`} // Thêm key duy nhất
            value={record.price}
            onChange={(e) => handleEditChange(e, record, "price")}
            type="number"
          />
        ) : (
          <span>{new Intl.NumberFormat("vi-VN").format(record.price)} VND</span>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (text, record) => {
        if (record.quantity === 0) {
          return <span style={{ color: "#e53e3e", fontWeight: "bold" }}>Hết hàng</span>;
        }

        return listSelectRow.includes(record.productDetailId) ? (
          <Select
            key={`status-${record.productDetailId}`}
            value={record.status}
            style={{ width: 120 }}
          >
            <Select.Option value="1">Đang bán</Select.Option>
            <Select.Option value="0">Ngừng bán</Select.Option>
          </Select>
        ) : (
          <span>{record.status === "1" ? "Đang bán" : "Ngừng bán"}</span>
        );
      },
    },
    {
      title: "Thao tác",
      dataIndex: "action",
      key: "action",
      render: (_, record) => (
        <div>
          <Button
            type="primary"
            size="medium"
            onClick={() => {
              if (record.quantity === 0 || record.status === "0") {
                message.warning("Hiện tại sản phẩm này đang hết!");
              } else {
                handleOpenModalExtra(record);
              }
            }}
            className={styles.chooseButton}
          >
            Chọn
          </Button>
        </div>
      ),
    },
  ];

  // Hàm xử lý khi người dùng chọn sản phẩm
  const handleSelectProduct = (product) => {
    setListProductSelected((prevSelected) => {
      const isAlreadySelected = prevSelected.some(
        (item) => item.productDetailId === product.productDetailId
      );
      if (isAlreadySelected) {
        return prevSelected;
      }

      const updatedSelected = [...prevSelected, product];
      onProductsSelected([product]); // Gửi sản phẩm vừa chọn ngay lập tức
      return updatedSelected;
    });
    console.log("List product Selected");

    console.log(listProductSelected);
  };

  const handleEditChange = (e, record, field) => {
    let value = e.target.value;

    // Ensure that the value is the correct type
    if (field === "quantity" || field === "price") {
      value = value === "" ? 0 : Number(value);
      if (isNaN(value)) {
        value = 0;
      }
    }

    // Update the product details in state
    setListProductDetails((prev) =>
      prev.map((item) =>
        item.productDetailId === record.productDetailId && item[field] !== value
          ? { ...item, [field]: value } // Update field value
          : item
      )
    );
  };

  const handleInputChange = (event) => {
    setSearchText(event.target.value);
    console.log("Input value:", event.target.value);
  };

  // Hàm để log ra ID khi thay đổi lựa chọn
  const handleSelectChange = (type, value) => {
    switch (type) {
      case "brand":
        setSelectedBrand(value);
        console.log("Selected Brand ID:", value);
        break;
      case "type":
        setSelectedType(value);
        console.log("Selected Type ID:", value);
        break;
      case "material":
        setSelectedMaterial(value);
        console.log("Selected Material ID:", value);
        break;
      case "color":
        setSelectedColor(value);
        console.log("Selected Color ID:", value);
        break;
      case "size":
        setSelectedSize(value);
        console.log("Selected Size ID:", value);
        break;
      case "status":
        setSelectedStatus(value);
        console.log("Selected Status ID:", value);
        break;
      default:
        break;
    }
  };

  // search price
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [displayPriceRange, setDisplayPriceRange] = useState([
    "0 VND",
    "5,000,000 VND",
  ]);

  // Format number to currency with "VND"
  const formatCurrency = (value) => {
    return `${new Intl.NumberFormat("vi-VN").format(value)} VND`;
  };

  const handleSliderChange = (value) => {
    setPriceRange(value);
    setDisplayPriceRange([formatCurrency(value[0]), formatCurrency(value[1])]);
  };

  // Handle input change without formatting immediately
  const handleMinInputChange = (e) => {
    const newMin = Number(e.target.value.replace(/[^0-9]/g, ""));
    setPriceRange([newMin, priceRange[1]]);
    setDisplayPriceRange([e.target.value, displayPriceRange[1]]);
  };

  const handleMaxInputChange = (e) => {
    const newMax = Number(e.target.value.replace(/[^0-9]/g, ""));
    setPriceRange([priceRange[0], newMax]);
    setDisplayPriceRange([displayPriceRange[0], e.target.value]);
  };

  // Format the value on blur
  const handleMinInputBlur = () => {
    setDisplayPriceRange([formatCurrency(priceRange[0]), displayPriceRange[1]]);
  };

  const handleMaxInputBlur = () => {
    setDisplayPriceRange([displayPriceRange[0], formatCurrency(priceRange[1])]);
  };

  // Xử lý khi người dùng thay đổi trang hoặc số lượng sản phẩm mỗi trang
  const handlePageChange = (page, size) => {
    setCurrentPage(page); // Cập nhật trang hiện tại
    setPageSize(size); // Cập nhật kích thước trang
  };

  useEffect(() => {
    if (isModalOpen) fetchData();
  }, [isModalOpen]);

  // get data product details
  const fetchData = async () => {
    setLoading(true);

    try {
      const params = {
        page: currentPage - 1,
        size: pageSize,
        brandId: selectedBrand || null,
        typeId: selectedType || null,
        materialId: selectedMaterial || null,
        colorId: selectedColor || null,
        sizeId: selectedSize || null,
        status: selectedStatus || null,
        productCode: searchText || null,
        minPrice: priceRange[0] || null,
        maxPrice: priceRange[1] || null,
      };
      console.log(params);

      const response = await ProductDetailManagementApi.getProductDetails(
        params
      );

      // Chuyển đổi status từ số thành chuỗi
      const updatedData = response.data.content.map((item) => ({
        ...item,
        status: item.status.toString(),
      }));

      console.log("updateData");

      console.log(updatedData);

      setListProductDetails(updatedData);
      setTotalItems(response.data.totalElements);
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setSearchText("");
    setSelectedBrand(null);
    setSelectedType(null);
    setSelectedMaterial(null);
    setSelectedColor(null);
    setSelectedSize(null);
    setSelectedStatus(null);
    setCurrentPage(1);
    fetchData(1, pageSize);
  };

  useEffect(() => {
    fetchData(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleFileChange = (file, record) => {
    setListProductDetails((prevList) =>
      prevList.map((item) =>
        item.productDetailId === record.productDetailId
          ? { ...item, file: file.originFileObj }
          : item
      )
    );
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("multipartFile", file);

    // Bắt đầu quá trình upload
    setLoading(true);

    try {
      const response = await FileUploadApi.uploadFileImage(formData);
      setLoading(false);
      return response.data; // Return image URL directly from response data
    } catch (error) {
      setLoading(false);
      console.error("Upload failed:", error);
      throw error; // Rethrow error to handle in handleAddProduct
    }
  };

  return (
    <Modal
      title="Tìm kiếm sản phẩm"
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      width={1300}
      style={{ top: 0, left: 0, transform: "translate(0, 0)" }}
    >
      <div className={styles.modalContentWrapper}>
        <div className={styles.containerSearch}>
          <div className={styles.inputSearch}>
            <Input
              style={{
                marginRight: "10px",
                height: "33px",
              }}
              placeholder="Nhập mã sản phẩm ..."
              value={searchText}
              onChange={handleInputChange}
            ></Input>
            <div
              style={{
                width: "1000px",
                display: "flex",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              {/* Minimum price input */}
              <Input
                type="text"
                value={displayPriceRange[0]}
                onChange={handleMinInputChange}
                onBlur={handleMinInputBlur}
                style={{ width: "120px", marginRight: "8px" }}
              />

              {/* Slider */}
              <Slider
                range
                min={0}
                max={5000000}
                step={1000}
                value={priceRange}
                onChange={handleSliderChange}
                tooltip={{ formatter: formatCurrency }}
                style={{ flex: 1, marginRight: "8px" }}
              />

              {/* Maximum price input */}
              <Input
                type="text"
                value={displayPriceRange[1]}
                onChange={handleMaxInputChange}
                onBlur={handleMaxInputBlur}
                style={{ width: "120px" }}
              />
            </div>
          </div>

          <div className={styles.selectSearch}>
            <div>
              <label>Brand: </label>
              <Select
                placeholder="Thương hiệu..."
                options={brandOptions}
                onChange={(value) => handleSelectChange("brand", value)}
                value={selectedBrand}
                allowClear
              ></Select>
            </div>
            <div>
              <label>Loại trang sức: </label>
              <Select
                placeholder="Loại trang sức..."
                options={typeOptions}
                onChange={(value) => handleSelectChange("type", value)}
                value={selectedType}
                allowClear
              />
            </div>
            <div>
              <label>Chất liệu: </label>
              <Select
                placeholder="Chất liệu..."
                options={materialOptions}
                onChange={(value) => handleSelectChange("material", value)}
                value={selectedMaterial}
                allowClear
              ></Select>
            </div>
            <div>
              <label>Màu sắc: </label>
              <Select
                placeholder="Màu sắc..."
                options={colorOptions}
                onChange={(value) => handleSelectChange("color", value)}
                value={selectedColor}
                allowClear
              ></Select>
            </div>

            <div>
              <label>Kích cỡ: </label>
              <Select
                placeholder="Kích cỡ..."
                options={sizeOptions}
                onChange={(value) => handleSelectChange("size", value)}
                value={selectedSize}
                allowClear
              ></Select>
            </div>
          </div>

          <div className={styles.ButtonSearch}>
            <Button type="primary" onClick={fetchData}>
              Tìm kiếm
            </Button>
            <Button onClick={handleRefresh}>Làm mới</Button>
          </div>

          <Table
            columns={columns}
            dataSource={listProductDetails}
            loading={loading}
            rowKey="productDetailId"
            pagination={false}
          />
        </div>

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

        <ModalConfirmAddProductBill
          isModalOpendExtra={isModalOpendExtra}
          handleCancelExtra={handleModalCloseExtra}
          selectedProduct={selectedProduct}
          billIdSelectedDetail={billIdSelected}
          getBillDetails={getBillDetails}
          fetchData={fetchData}
        />
      </div>
    </Modal>
  );
};

export default ModalAddProduct;
