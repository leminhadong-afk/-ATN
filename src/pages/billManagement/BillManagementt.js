import { faEye, faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  DatePicker,
  Input,
  Radio,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import styles from "./BillManagement.module.css";
import { Navigate, useNavigate } from "react-router";
import { BillManagementApi } from "../../api/admin/billManagement/BillManagementApi";
import dayjs from "dayjs";

const BillManagement = () => {
  const [listBill, setListBill] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const navigate = useNavigate();

  const [searchBill, setSearchBill] = useState({
    page: 0,
    size: 10,
    searchTerm: "",
  });
  const [status, setStatus] = useState(""); // default chọn "Tất cả"
  const [billType, setBillType] = useState(""); // default chọn "Tất cả"

  const { RangePicker } = DatePicker;
  const [datePaymentStart, setDatePaymentStart] = useState(null);
  const [datePaymentEnd, setDatePaymentEnd] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const dateFormat = "YYYY-MM-DD";
  const customFormat = (value) => `custom format: ${value.format(dateFormat)}`;

  const columns = [
    { title: "STT", dataIndex: "rowNum", key: "rowNum" },
    {
      title: "Mã hóa đơn",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Tổng sản phẩm",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      render: (text) => {
        return text !== undefined && text !== null ? text : 0; // Kiểm tra và trả về 0 nếu không có giá trị
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (totalAmount) => {
        return totalAmount?.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        });
      },
    },
    {
      title: "Tên khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      render: (text) => {
        // Kiểm tra nếu có dữ liệu thì render tên khách hàng, nếu không có dữ liệu thì hiển thị "Khách lẻ"
        return text ? text : "Khách lẻ";
      },
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (text) => {
        return text ? text : "-";
      },
    },
    {
      title: "Ngày tạo đơn",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (text) => moment(text).format("DD/MM/YYYY"),
    },
    {
      title: "Phân loại",
      key: "type",
      dataIndex: "type",
      render: (text) =>
        text === "OFFLINE" ? (
          <Tag color="blue" className={styles.largeTag}>
            Tại quầy
          </Tag>
        ) : text === "ONLINE" ? (
          <Tag color="yellow" className={styles.largeTag}>
            Online
          </Tag>
        ) : null,
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      render: (text) =>
        text === 0 ? (
          <Tag color="blue" className={styles.largeTag}>
            Chờ xác nhận
          </Tag>
        ) : text === 1 ? (
          <Tag color="brown" className={styles.largeTag}>
            Đã hoàn thành
          </Tag>
        ) : text === 2 ? (
          <Tag color="yellow" className={styles.largeTag}>
            Đang giao hàng
          </Tag>
        ) : text === 3 ? (
          <Tag color="green" className={styles.largeTag}>
            Đã giao
          </Tag>
        ) : text === 4 ? (
          <Tag color="red" className={styles.largeTag}>
            Đã hủy
          </Tag>
        ) : null,
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button
            onClick={() => navigate(`/bill-detail-management/${record.id}`)}
          >
            <FontAwesomeIcon icon={faEye} />
          </Button>
        </Space>
      ),
    },
  ];

  const fetchData = async (page = 1, size = 10, extraParams = {}) => {
    setLoading(true);
    const params = {
      page: page - 1,
      size: size,
      searchTerm: searchBill.searchTerm || undefined,
      phoneNumber: searchBill.phoneNumber || undefined,
      shippingCode: searchBill.shippingCode || undefined,
      status:
        status !== "" && status !== null ? parseInt(status, 10) : undefined,
      datePaymentStart: datePaymentStart,
      datePaymentEnd: datePaymentEnd,
      type: billType || undefined,
      ...extraParams,
    };

    try {
      const response = await BillManagementApi.search(params);
      setListBill(response.data.content);
      setTotalItems(response.data.totalElements);
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, pageSize);
    // eslint-disable-next-line
  }, [currentPage, pageSize]);

  // Lấy giá trị input
  const handleInputChange = (e) => {
    const { name, value } = e.target; // Lấy name và value của input
    setSearchBill((prevState) => ({
      ...prevState,
      [name]: value, // Cập nhật giá trị tương ứng với name của input
    }));
  };

  // Lấy giá trị ngày
  const handleRangeChange = (dates, dateStrings) => {
    setDateRange(dates);
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      // Format ngày theo YYYY-MM-DD để gửi lên backend
      // Ant Design DatePicker sử dụng dayjs, nên dùng dayjs để format
      const startDate = dayjs(dates[0]).format(dateFormat);
      const endDate = dayjs(dates[1]).format(dateFormat);
      setDatePaymentStart(startDate);
      setDatePaymentEnd(endDate);
    } else {
      setDatePaymentStart(null);
      setDatePaymentEnd(null);
    }
  };

  // btn search
  const handleSearch = async () => {
    setCurrentPage(1);
    fetchData(1, pageSize);
  };

  // btn refresh
  const handleRefresh = () => {
    setSearchBill({
      page: 0,
      size: 10,
      searchTerm: "",
      phoneNumber: "",
      shippingCode: "",
    });
    setStatus("");
    setBillType("");
    setDatePaymentStart(null);
    setDatePaymentEnd(null);
    setDateRange(null);
    setCurrentPage(1);
    fetchData(1, pageSize, {
      searchTerm: undefined,
      phoneNumber: undefined,
      shippingCode: undefined,
      status: undefined,
      type: undefined,
      datePaymentStart: undefined,
      datePaymentEnd: undefined,
    });
  };

  return (
    <div>
      <h1>Xử lý đơn hàng</h1>
      <div>
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "10px",
            padding: "10px",
            marginBottom: "20px",
            boxShadow: "0px 0px 5px 0px #ccc",
          }}
          className={styles.SearchContainer}
        >
          {/* Filter row: all in one line */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
            className={styles.FilterRow}
          >
            <Input
              style={{ width: 200 }}
              placeholder="Tìm kiếm (mã đơn, tên KH)..."
              name="searchTerm"
              value={searchBill.searchTerm}
              onChange={handleInputChange}
            />
            <Input
              style={{ width: 180 }}
              placeholder="Số điện thoại"
              name="phoneNumber"
              value={searchBill.phoneNumber}
              onChange={handleInputChange}
            />
            <Input
              style={{ width: 180 }}
              placeholder="Mã vận đơn"
              name="shippingCode"
              value={searchBill.shippingCode}
              onChange={handleInputChange}
            />
            <RangePicker
              style={{ minWidth: 220 }}
              format={dateFormat}
              value={dateRange}
              onChange={handleRangeChange}
              placeholder={["Start date", "End date"]}
            />
            <span style={{ marginLeft: 8 }}>Loại hóa đơn: </span>
            <Select
              style={{ width: 120 }}
              value={billType}
              onChange={setBillType}
              allowClear
              placeholder="Tất cả"
            >
              <Select.Option value="">Tất cả</Select.Option>
              <Select.Option value="OFFLINE">Tại quầy</Select.Option>
              <Select.Option value="ONLINE">Online</Select.Option>
            </Select>
            <span className={styles.statusLabel} style={{ marginLeft: 8 }}>
              Trạng thái:
            </span>
            <Radio.Group
              onChange={(e) => setStatus(e.target.value)}
              value={status}
              style={{ marginLeft: 4 }}
            >
              <Radio value="">Tất cả</Radio>
              <Radio value="0">Chờ xác nhận</Radio>
              <Radio value="1">Đã hoàn thành</Radio>
              <Radio value="2">Đang giao hàng</Radio>
              <Radio value="3">Đã giao hàng</Radio>
            </Radio.Group>
            <Button
              style={{ marginLeft: 16 }}
              type="primary"
              onClick={handleSearch}
            >
              Tìm kiếm
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={handleRefresh}
              icon={<FontAwesomeIcon icon={faSync} />}
            >
              Làm mới
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
          <Table
            loading={loading}
            columns={columns}
            dataSource={listBill}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalItems,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} hóa đơn`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
                fetchData(page, size);
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BillManagement;
