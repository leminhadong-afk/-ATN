import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Radio,
  DatePicker,
  Table,
  Space,
  Tag,
  Pagination,
  Empty,
  Tooltip,
  Spin,
  Badge,
  message,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  FilterOutlined,
  FileExcelOutlined,
  EyeOutlined,
  CalendarOutlined,
  TagOutlined,
  PercentageOutlined,
  InboxOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router";
import dayjs from "dayjs";
import moment from "moment";
import styles from "./PromotionManagement.module.css";
import { CouponManagementApi } from "../../api/admin/couponManagement/CouponManagementApi";

const { RangePicker } = DatePicker;

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchParams, setSearchParams] = useState({
    searchTerm: "",
    status: "",
    startDate: null,
    endDate: null,
  });

  const navigate = useNavigate();

  // Initial data fetch
  useEffect(() => {
    fetchPromotions(currentPage, pageSize);
  }, []);

  // Fetch data from API
  const fetchPromotions = async (page = 1, size = 10, params = {}) => {
    setLoading(true);

    try {
      const apiParams = {
        page: page - 1,
        size: size,
        ...params,
      };

      const response = await CouponManagementApi.searchCoupon(apiParams);

      if (response.data) {
        // Group coupons by code to remove duplicates
        const groupedCoupons = response.data.content.reduce((acc, coupon) => {
          const existingCoupon = acc.find((c) => c.code === coupon.code);

          if (existingCoupon) {
            // If coupon already exists, just update the quantity
            existingCoupon.quantity =
              (existingCoupon.quantity || 0) + (coupon.quantity || 1);
          } else {
            // If coupon doesn't exist, add it to the accumulator
            acc.push({
              ...coupon,
              quantity: coupon.quantity || 1,
            });
          }
          return acc;
        }, []);

        // Sort grouped coupons by creation date (newest first)
        groupedCoupons.sort(
          (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
        );

        // Add row numbers
        const couponsWithRowNum = groupedCoupons.map((coupon, index) => ({
          ...coupon,
          rowNum: (page - 1) * size + index + 1,
        }));

        setPromotions(couponsWithRowNum);
        setTotalItems(groupedCoupons.length);
      } else {
        setPromotions([]);
        setTotalItems(0);
        message.error("Không thể tải dữ liệu khuyến mãi");
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
      message.error("Đã xảy ra lỗi khi tải dữ liệu khuyến mãi");
      setPromotions([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);

    const params = {
      searchTerm: searchParams.searchTerm,
      status:
        searchParams.status !== ""
          ? parseInt(searchParams.status, 10)
          : undefined,
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
    };

    fetchPromotions(page, size, params);
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchParams({
      ...searchParams,
      searchTerm: e.target.value,
    });
  };

  // Handle status change
  const handleStatusChange = (e) => {
    setSearchParams({
      ...searchParams,
      status: e.target.value,
    });
  };

  // Handle date range change
  const handleDateRangeChange = (dates) => {
    setSearchParams({
      ...searchParams,
      startDate: dates ? dates[0].format("YYYY-MM-DD") : null,
      endDate: dates ? dates[1].format("YYYY-MM-DD") : null,
    });
  };

  // Handle search button click
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page

    const params = {
      searchTerm: searchParams.searchTerm,
      status:
        searchParams.status !== ""
          ? parseInt(searchParams.status, 10)
          : undefined,
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
    };

    console.log("log date:");

    console.log("Start Date:", typeof searchParams.startDate);

    fetchPromotions(1, pageSize, params);
  };

  // Navigate to create promotion page
  const handleCreateCoupon = () => {
    navigate("/create-coupon-management");
  };

  // Handle export to Excel
  const handleExportExcel = () => {
    message.info("Đang xuất file Excel...");
    // Implement actual export functionality here
  };

  // View promotion details
  const viewCouponDetails = (couponId) => {
    console.log("couponId: ", couponId);

    navigate(`/coupon-detail-management/${couponId}`);
  };

  // Table columns configuration
  const columns = [
    {
      title: "STT",
      dataIndex: "rowNum",
      key: "rowNum",
      width: 55,
      align: "center",
      className: styles.tableCell,
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Mã giảm giá",
      dataIndex: "code",
      key: "code",
      className: styles.tableCell,
      render: (text) => <span className={styles.codeCell}>{text}</span>,
    },
    {
      title: "Tên KM",
      dataIndex: "name",
      key: "name",
      className: styles.tableCell,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Kiểu",
      dataIndex: "type",
      key: "type",
      className: styles.tableCellType,
      ellipsis: { showTitle: false },
      render: (value) => {
        const isPublic = value === 1;
        const label = isPublic ? "Công khai" : "Cá nhân";
        const color = isPublic ? "green" : "blue";

        return (
          <Tooltip placement="topLeft" title={label}>
            <Tag color={color}>{label}</Tag>
          </Tooltip>
        );
      },
    },

    {
      title: "Giảm giá",
      dataIndex: "value",
      key: "value",
      align: "center",
      className: styles.tableCell,
      render: (value, record) => {
        if (record.unit === 1) {
          return (
            <Tooltip title="Giảm giá cố định">
              <span className={styles.value}>{value.toLocaleString()}₫</span>
            </Tooltip>
          );
        } else if (record.unit === 0) {
          return (
            <Tooltip title="Giảm giá theo phần trăm">
              <span className={styles.discountPercentage}>{value}%</span>
            </Tooltip>
          );
        } else {
          return value;
        }
      },
    },

    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
      className: styles.tableCell,
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      className: styles.tableCell,
      render: (text) => (
        <Tooltip title={`Bắt đầu: ${moment(text).format("DD-MM-YYYY")}`}>
          <Space>
            <CalendarOutlined />
            <span>{moment(text).format("DD-MM-YYYY")}</span>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      className: styles.tableCell,
      render: (text) => (
        <Tooltip title={`Kết thúc: ${moment(text).format("DD-MM-YYYY")}`}>
          <Space>
            <CalendarOutlined />
            <span>{moment(text).format("DD-MM-YYYY")}</span>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      align: "center",
      className: styles.tableCell,
      render: (status) => {
        const isActive = status === 1;
        const label = isActive ? "Đang diễn ra" : "Đã hết hạn";
        const className = isActive
          ? `${styles.statusTag} ${styles.activeTag}`
          : `${styles.statusTag} ${styles.expiredTag}`;

        return <span className={className}>{label}</span>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      align: "center",
      className: styles.tableCell,
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            className={styles.actionButton}
            onClick={() => viewCouponDetails(record.id)}
            icon={<EyeOutlined />}
          />
        </Tooltip>
      ),
    },
  ];

  // Empty state component
  const EmptyState = () => (
    <div className={styles.emptyState}>
      <PercentageOutlined className={styles.emptyIcon} />
      <h3 className={styles.emptyTitle}>Không tìm thấy mã khuyến mãi</h3>
      <p className={styles.emptyDescription}>
        Không có mã khuyến mãi nào phù hợp với tiêu chí tìm kiếm của bạn.
      </p>
      <Button type="primary" onClick={handleCreateCoupon}>
        Tạo mã khuyến mãi mới
      </Button>
    </div>
  );

  return (
    <div className={styles.pageWrapper}>
      {/* Page title */}
      <div className={styles.pageTitle}>
        <PercentageOutlined className={styles.pageIcon} />
        <span>Quản lý khuyến mãi</span>
      </div>

      {/* Search and filter card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <FilterOutlined className={styles.cardIcon} />
            Tìm kiếm và lọc
          </h2>
          <Button
            className={styles.addButton}
            icon={<PlusOutlined />}
            onClick={handleCreateCoupon}
          >
            Tạo mã giảm giá
          </Button>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.filterSection}>
            {/* Search input row */}
            <div className={styles.filterRow}>
              <div className={styles.searchInputWrapper}>
                <Input
                  className={styles.searchInput}
                  placeholder="Tìm kiếm theo mã hoặc tên khuyến mãi..."
                  prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                  value={searchParams.searchTerm}
                  onChange={handleSearchInputChange}
                  allowClear
                />
              </div>
            </div>

            {/* Date picker and status filter row */}
            <div className={styles.filterRow}>
              <div className={styles.datePickerWrapper}>
                <RangePicker
                  className={styles.datePicker}
                  format="DD/MM/YYYY"
                  placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
                  onChange={handleDateRangeChange}
                  allowClear
                />
              </div>

              <div className={styles.statusFilter}>
                <span className={styles.statusLabel}>Trạng thái:</span>
                <Radio.Group
                  className={styles.radioGroup}
                  value={searchParams.status}
                  onChange={handleStatusChange}
                  optionType="button"
                  buttonStyle="solid"
                >
                  <Radio.Button value="">Tất cả</Radio.Button>
                  <Radio.Button value="1">Đang diễn ra</Radio.Button>
                  <Radio.Button value="0">Đã hết hạn</Radio.Button>
                </Radio.Group>
              </div>

              <div className={styles.actionButtonsWrapper}>
                <Button
                  className={styles.searchButton}
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                >
                  Tìm kiếm
                </Button>
                <Button
                  className={styles.exportButton}
                  icon={<FileExcelOutlined />}
                  onClick={handleExportExcel}
                >
                  Xuất Excel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data table card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <TagOutlined className={styles.cardIcon} />
            Danh sách mã khuyến mãi
          </h2>
          <Badge
            count={totalItems}
            style={{ backgroundColor: "#4f46e5" }}
            overflowCount={999}
          />
        </div>

        <div className={styles.tableWrapper}>
          <Table
            className={styles.table}
            columns={columns}
            dataSource={promotions}
            rowKey="id"
            pagination={false}
            loading={loading}
            locale={{
              emptyText: <EmptyState />,
            }}
            rowClassName={styles.tableRow}
            bordered={false}
          />
        </div>

        {promotions.length > 0 && (
          <div className={styles.paginationWrapper}>
            <div className={styles.paginationInfo}>
              Hiển thị {Math.min((currentPage - 1) * pageSize + 1, totalItems)}{" "}
              - {Math.min(currentPage * pageSize, totalItems)} trên tổng số{" "}
              {totalItems} mã khuyến mãi
            </div>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalItems}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={["10", "20", "50", "100"]}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionManagement;
