import { useEffect, useState } from "react";
import styles from "./CreateCouponManagement.module.css";
import { Checkbox, DatePicker, Divider, Radio, Table, message } from "antd"; // Thêm message từ antd
import { CalendarOutlined } from "@ant-design/icons";
import { CustomerManagementApi } from "../../../api/admin/customerManagement/CustomerManagementApi";
// Giả sử bạn có file CouponManagementApi.js để gọi API coupon
import { CouponManagementApi } from "../../../api/admin/couponManagement/CouponManagementApi";
import dayjs from "dayjs"; // Sử dụng dayjs để xử lý ngày tháng dễ dàng hơn
import utc from "dayjs/plugin/utc"; // Import plugin UTC
import { useNavigate } from "react-router";

dayjs.extend(utc); // Sử dụng plugin UTC

const CreateCouponManagement = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false); // State cho nút submit
  const [listCustomer, setListCustomer] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Có thể không cần nếu dùng listSelectRow
  // const [selectedCustomers, setSelectedCustomers] = useState([]); // Có thể không cần

  const [listSelectRow, setListSelectRow] = useState([]); // Track selected rows as an array of customer IDs
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  // Form state variables
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minCondition, setMinCondition] = useState("");
  // Lưu trữ đối tượng dayjs thay vì chuỗi để dễ định dạng
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Existing state variables
  const [type, setType] = useState(1); // 1: Public, 0: Personal
  const [searchTerm, setSearchTerm] = useState(""); // State cho tìm kiếm khách hàng
  const [currentPage, setCurrentPage] = useState(1);
  const [unit, setUnit] = useState(0); // 0: percent (%), 1: amount (VND) - Đổi tên từ init

  const { RangePicker } = DatePicker;

  // --- Logic chọn khách hàng (handleSelectAllChange, handleCheckboxChange) giữ nguyên ---
  const handleSelectAllChange = (e) => {
    const isChecked = e.target.checked;
    setSelectAllChecked(isChecked);
    if (isChecked) {
      setListSelectRow(listCustomer.map((item) => item.id)); // Chọn tất cả ID
    } else {
      setListSelectRow([]); // Bỏ chọn tất cả
    }
  };

  const handleCheckboxChange = (record) => {
    const id = record.id;
    const isSelected = listSelectRow.includes(id);
    if (isSelected) {
      setListSelectRow(listSelectRow.filter((rowId) => rowId !== id)); // Bỏ chọn
    } else {
      setListSelectRow([...listSelectRow, id]); // Chọn
    }
    // Cập nhật lại trạng thái của checkbox "Chọn tất cả"
    setSelectAllChecked(
      listSelectRow.length + (isSelected ? -1 : 1) === listCustomer.length &&
        listCustomer.length > 0
    );
  };

  // Cập nhật useEffect để kiểm tra lại selectAllChecked khi listSelectRow thay đổi
  useEffect(() => {
    setSelectAllChecked(
      listCustomer.length > 0 && listSelectRow.length === listCustomer.length
    );
  }, [listSelectRow, listCustomer]);

  // --- State tìm kiếm khách hàng ---
  const [searchCustomerParams, setSearchCustomerParams] = useState({
    page: 0,
    size: 10,
    searchTerm: "", // Thêm state này nếu bạn muốn tìm kiếm KH
  });

  // Replace navigate with a simple function that logs the action
  const handleCancel = () => {
    navigate("/promotion-management");
  };

  // Handle form submission
  const handleSubmit = async () => {
    // --- Validation cơ bản ---
    if (!code || !name || !value || !quantity || !startDate || !endDate) {
      message.error(
        "Vui lòng nhập đầy đủ thông tin bắt buộc (Mã, Tên, Giá trị, Số lượng, Thời gian)."
      );
      return;
    }
    // Kiểm tra giá trị là số
    if (isNaN(Number(value)) || Number(value) <= 0) {
      message.error("Giá trị giảm giá phải là số và lớn hơn 0.");
      return;
    }
    if (unit === 0 && Number(value) > 100) {
      message.error("Giá trị giảm giá theo % không được vượt quá 100.");
      return;
    }
    if (maxValue && (isNaN(Number(maxValue)) || Number(maxValue) < 0)) {
      message.error("Giá trị tối đa phải là số và không âm.");
      return;
    }
    if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
      message.error("Số lượng phải là số nguyên và lớn hơn 0.");
      return;
    }
    if (
      minCondition &&
      (isNaN(Number(minCondition)) || Number(minCondition) < 0)
    ) {
      message.error("Điều kiện tối thiểu phải là số và không âm.");
      return;
    }
    if (type === 0 && listSelectRow.length === 0) {
      message.error("Vui lòng chọn ít nhất một khách hàng cho coupon cá nhân.");
      return;
    }

    // --- Định dạng dữ liệu cho API ---
    const formattedStartDate = startDate
      ? dayjs(startDate).utc().format()
      : null; // ISO 8601 UTC
    const formattedEndDate = endDate ? dayjs(endDate).utc().format() : null; // ISO 8601 UTC

    const customerDetailPayload =
      type === 0 // Chỉ gửi khi là coupon cá nhân
        ? listSelectRow.map((customerId) => ({ customerId: customerId }))
        : null; // Hoặc [] nếu backend yêu cầu mảng rỗng

    const payload = {
      code,
      name,
      value: Number(value),
      unit: unit, // Sử dụng tên 'unit' giống backend DTO
      maxValue: unit === 0 ? (maxValue ? Number(maxValue) : null) : null, // Chỉ gửi nếu là % và có giá trị
      quantity: parseInt(quantity, 10), // Chuyển sang số nguyên
      minCondition: minCondition ? Number(minCondition) : null, // Chỉ gửi nếu có giá trị
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      type: type,
      customerDetail: customerDetailPayload, // Đã định dạng
    };

    console.log("Sending Payload:", payload);
    setLoadingSubmit(true); // Bắt đầu loading

    try {
      // Gọi API để tạo coupon
      const response = await CouponManagementApi.create(payload);
      console.log("API Response:", response);
      message.success("Tạo phiếu giảm giá thành công!"); // Thông báo thành công
      // Có thể reset form hoặc chuyển hướng sau khi thành công
      // handleCancel(); // Ví dụ: Chuyển hướng về trang danh sách
      // Reset form (tùy chọn)
      setCode("");
      setName("");
      setValue("");
      setMaxValue("");
      setQuantity("");
      setMinCondition("");
      setStartDate(null);
      setEndDate(null);
      setType(1);
      setUnit(0);
      setListSelectRow([]);
      setSelectAllChecked(false);
    } catch (error) {
      console.error("Error creating coupon:", error);
      // Hiển thị lỗi cụ thể từ backend nếu có
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Đã xảy ra lỗi khi tạo phiếu giảm giá.";
      message.error(errorMessage); // Thông báo lỗi
    } finally {
      setLoadingSubmit(false); // Kết thúc loading
    }
  };

  // --- Columns cho bảng khách hàng (giữ nguyên) ---
  const columns = [
    {
      title: (
        <Checkbox
          onChange={handleSelectAllChange}
          checked={selectAllChecked}
          disabled={listCustomer.length === 0} // Disable nếu không có KH
        />
      ),
      key: "checkBox",
      render: (_, record) => (
        <Checkbox
          onChange={() => handleCheckboxChange(record)}
          checked={listSelectRow.includes(record.id)}
        />
      ),
      width: "5%",
    },
    {
      title: "Mã KH",
      dataIndex: "customerCode", // Giả sử có trường 'code' hoặc 'customerCode'
      key: "code",
      width: "15%",
    },
    {
      title: "Tên KH",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
      width: "25%",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "25%",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: "20%",
    },
  ];

  // --- Fetch dữ liệu khách hàng ---
  const fetchData = async (page = 1, size = 10, term = "") => {
    console.log(`Workspaceing page: ${page}, size: ${size}, term: ${term}`);
    setLoading(true);
    const params = {
      page: page - 1,
      size: size,
      searchTerm: term, // Thêm tham số tìm kiếm
      // deleteFlag: 0 // Chỉ lấy khách hàng đang hoạt động (tùy chọn)
    };

    try {
      const response = await CustomerManagementApi.search(params); // Sử dụng API search đúng
      console.log("Customer Response data:", response.data);
      setListCustomer(response.data?.content || []); // Đảm bảo data.content tồn tại
      setTotalItems(response.data?.totalElements || 0); // Đảm bảo totalElements tồn tại
      // Reset lựa chọn khi fetch lại dữ liệu (tránh giữ lựa chọn cũ)
      setListSelectRow([]);
      setSelectAllChecked(false);
    } catch (error) {
      console.error("Error fetching data: ", error);
      message.error("Lỗi khi tải danh sách khách hàng."); // Thông báo lỗi
      setListCustomer([]); // Đặt lại danh sách rỗng khi có lỗi
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // useEffect để fetch dữ liệu khi page, size, hoặc searchTerm thay đổi
  useEffect(() => {
    fetchData(currentPage, pageSize, searchTerm);
  }, [currentPage, pageSize, searchTerm]); // Thêm searchTerm vào dependency

  // --- Các hàm xử lý thay đổi input (handleVoucherTypeChange, handleDiscountTypeChange, handleSearchChange) ---
  const handleVoucherTypeChange = (newType) => {
    setType(newType);
    // Nếu chuyển sang public, xóa danh sách khách hàng đã chọn
    if (newType === 1) {
      setListSelectRow([]);
      setSelectAllChecked(false);
    }
  };

  const handleDiscountTypeChange = (newUnit) => {
    setUnit(newUnit);
    // Nếu đổi sang VND, xóa giá trị max value
    if (newUnit === 1) {
      setMaxValue("");
    }
  };

  // Xử lý thay đổi input tìm kiếm khách hàng
  const handleSearchTermChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setCurrentPage(1); // Reset về trang đầu tiên khi tìm kiếm
    // Không cần gọi fetchData ở đây vì useEffect sẽ tự động gọi khi searchTerm thay đổi
  };

  // Xử lý phân trang cho bảng khách hàng
  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    // fetchData sẽ được gọi bởi useEffect
  };

  return (
    <div className={styles.couponContainer}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <span
          className={styles.breadcrumbLink}
          onClick={() => navigate("/promotion-management")}
        >
          Phiếu giảm giá
        </span>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbItemActive}>
          Cập nhật phiếu giảm giá
        </span>
      </div>

      <div className={styles.formContainer}>
        <div className={styles.formSection}>
          {/* Bố cục 2 cột nếu là coupon cá nhân */}
          <div
            className={`${styles.mainLayout} ${
              type === 0 ? styles.twoColumnLayout : ""
            }`}
          >
            {/* Cột thông tin coupon */}
            <div className={`${styles.formColumn} ${styles.couponInfoColumn}`}>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Thông tin phiếu giảm giá</h2>
                <div className={styles.formDivider}></div>
              </div>

              {/* Mã và Tên */}
              <div className={styles.formGroupRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Mã phiếu giảm giá <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập mã phiếu (vd: SUMMER2025)"
                    className={styles.formControl}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())} // Tự động viết hoa
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Tên phiếu giảm giá{" "}
                    <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tên phiếu giảm giá"
                    className={styles.formControl}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Giá trị và Giá trị tối đa */}
              <div className={styles.formGroupRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Giá trị <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWithSelect}>
                    <input
                      type="number" // Đổi thành number để dễ validate
                      min="0"
                      placeholder={unit === 0 ? "10" : "100000"}
                      className={styles.formControlWithSelect}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                    />
                    <div className={styles.selectType}>
                      <select
                        className={styles.discountTypeSelect}
                        value={unit}
                        onChange={(e) =>
                          handleDiscountTypeChange(Number(e.target.value))
                        }
                      >
                        <option value={0}>%</option>
                        <option value={1}>VND</option>
                      </select>
                    </div>
                  </div>
                </div>
                {/* Chỉ hiển thị Max Value khi unit là % */}
                {unit === 0 && (
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Giá trị tối đa (VND)
                    </label>
                    <div className={styles.inputWithIcon}>
                      <input
                        type="number"
                        min="0"
                        placeholder="300000"
                        className={styles.formControl}
                        value={maxValue}
                        onChange={(e) => setMaxValue(e.target.value)}
                      />
                      <span className={styles.inputIcon}>đ</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Số lượng và Điều kiện */}
              <div className={styles.formGroupRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Số lượng <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWithIcon}>
                    <input
                      type="number"
                      min="1" // Số lượng ít nhất là 1
                      placeholder="20"
                      className={styles.formControl}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                    <span className={styles.inputIcon}>#</span>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Điều kiện tối thiểu (VND)
                  </label>
                  <div className={styles.inputWithIcon}>
                    <input
                      type="number"
                      min="0"
                      placeholder="100000"
                      className={styles.formControl}
                      value={minCondition}
                      onChange={(e) => setMinCondition(e.target.value)}
                    />
                    <span className={styles.inputIcon}>đ</span>
                  </div>
                </div>
              </div>

              {/* Thời gian áp dụng */}
              <div className={styles.datePickerWrapper}>
                <label className={styles.dateLabel}>
                  Thời gian áp dụng <span className={styles.required}>*</span>
                </label>
                <RangePicker
                  className={styles.datePicker}
                  format="DD/MM/YYYY HH:mm:ss" // Thêm giờ phút giây
                  showTime // Cho phép chọn giờ
                  placeholder={["Từ ngày", "Đến ngày"]}
                  allowClear
                  suffixIcon={<CalendarOutlined style={{ color: "#1890ff" }} />}
                  popupClassName={styles.datePopup}
                  style={{ width: "100%" }}
                  // Giá trị nhận vào là mảng [dayjsObject, dayjsObject]
                  value={
                    startDate && endDate
                      ? [dayjs(startDate), dayjs(endDate)]
                      : null
                  }
                  onChange={(dates) => {
                    // dates là mảng [dayjsObject1, dayjsObject2] hoặc null
                    if (dates && dates.length === 2) {
                      setStartDate(dates[0]); // Lưu đối tượng dayjs
                      setEndDate(dates[1]); // Lưu đối tượng dayjs
                    } else {
                      setStartDate(null);
                      setEndDate(null);
                    }
                  }}
                />
              </div>

              {/* Kiểu phiếu giảm giá */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Kiểu phiếu giảm giá</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioContainer}>
                    <input
                      type="radio"
                      name="voucherType" // Cùng name để chọn 1
                      value={1} // Public
                      checked={type === 1}
                      onChange={() => handleVoucherTypeChange(1)}
                    />
                    <span className={styles.radioCustom}></span>
                    Công khai
                  </label>
                  <label className={styles.radioContainer}>
                    <input
                      type="radio"
                      name="voucherType" // Cùng name
                      value={0} // Personal
                      checked={type === 0}
                      onChange={() => handleVoucherTypeChange(0)}
                    />
                    <span className={styles.radioCustom}></span>
                    Cá nhân
                  </label>
                </div>
              </div>
            </div>

            {/* Cột danh sách khách hàng (chỉ hiển thị khi type là cá nhân) */}
            {type === 0 && (
              <div
                className={`${styles.formColumn} ${styles.customerListColumn}`}
              >
                <h2 className={styles.cardTitle}>Danh sách khách hàng</h2>
                {/* Thêm ô tìm kiếm khách hàng */}
                <div className={styles.searchCustomer}>
                  <input
                    type="text"
                    placeholder="Tìm kiếm khách hàng (mã, tên, sđt, email)..."
                    value={searchTerm}
                    onChange={handleSearchTermChange}
                    className={styles.formControl}
                  />
                </div>
                <Table
                  columns={columns}
                  dataSource={listCustomer}
                  loading={loading}
                  rowKey="id"
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: totalItems,
                    showSizeChanger: true,
                    pageSizeOptions: ["5", "10", "20", "50"],
                  }}
                  onChange={handleTableChange} // Xử lý thay đổi trang/kích thước trang
                  scroll={{ y: 300 }} // Giới hạn chiều cao và cho phép cuộn
                  size="small"
                />
              </div>
            )}
          </div>

          {/* Nút bấm */}
          <div className={styles.buttonContainer}>
            <button
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={loadingSubmit} // Disable khi đang gửi
            >
              HỦY
            </button>
            <button
              className={styles.addButton}
              onClick={handleSubmit}
              disabled={loadingSubmit} // Disable khi đang gửi
              loading={loadingSubmit} // Thuộc tính loading của Antd Button (nếu dùng)
            >
              {loadingSubmit ? "ĐANG TẠO..." : "THÊM MỚI"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCouponManagement;
