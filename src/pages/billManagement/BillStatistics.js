import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  DatePicker,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Select,
  Space,
  Table,
  Tag,
  Modal,
  Empty,
  Button,
} from "antd";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { BillManagementApi } from "../../api/admin/billManagement/BillManagementApi";
import moment from "moment";
import styles from "./BillStatistics.module.css";

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const { RangePicker } = DatePicker;
const { Title: AntTitle, Text } = Typography;

const BillStatistics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([]);
  const [period, setPeriod] = useState("month"); // day, week, month, year

  // Thống kê tổng quan
  const [overviewStats, setOverviewStats] = useState({
    totalBills: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    successRate: 0,
    cancelledRate: 0,
  });

  // Thống kê theo trạng thái
  const [statusStats, setStatusStats] = useState({
    pending: 0,
    completed: 0,
    shipping: 0,
    delivered: 0,
    cancelled: 0,
  });

  // Thống kê theo loại
  const [typeStats, setTypeStats] = useState({
    online: 0,
    offline: 0,
  });

  // Dữ liệu biểu đồ
  const [revenueChartData, setRevenueChartData] = useState({
    labels: [],
    revenues: [],
    orders: [],
  });

  // Top đơn hàng
  const [topOrders, setTopOrders] = useState([]);

  // Tất cả bills để filter
  const [allBills, setAllBills] = useState([]);

  // Modal chi tiết
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [detailModalTitle, setDetailModalTitle] = useState("");
  const [detailBills, setDetailBills] = useState([]);
  const [detailModalLoading, setDetailModalLoading] = useState(false);
  const [detailModalPagination, setDetailModalPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [currentFilterStatus, setCurrentFilterStatus] = useState(null);

  const navigate = useNavigate();

  // Bộ màu
  const colors = {
    primary: "#4F46E5",
    success: "#10B981",
    danger: "#F43F5E",
    warning: "#F59E0B",
    info: "#3B82F6",
    purple: "#7C3AED",
  };

  // Fetch dữ liệu thống kê
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);

        const params = {
          page: 0,
          size: 1000, // Lấy nhiều để tính toán
          datePaymentStart: dateRange && dateRange.length === 2 && dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : undefined,
          datePaymentEnd: dateRange && dateRange.length === 2 && dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : undefined,
        };

        const response = await BillManagementApi.search(params);
        const bills = response.data.content || [];
        const totalElements = response.data.totalElements || 0;

        // Lưu tất cả bills để dùng cho modal chi tiết
        setAllBills(bills);

        // Tính toán thống kê tổng quan
        const totalRevenue = bills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
        const completedBills = bills.filter((b) => b.status === 1 || b.status === 3).length;
        const cancelledBills = bills.filter((b) => b.status === 4).length;
        const averageOrderValue = totalElements > 0 ? totalRevenue / totalElements : 0;
        const successRate = totalElements > 0 ? (completedBills / totalElements) * 100 : 0;
        const cancelledRate = totalElements > 0 ? (cancelledBills / totalElements) * 100 : 0;

        setOverviewStats({
          totalBills: totalElements,
          totalRevenue,
          averageOrderValue,
          successRate: parseFloat(successRate.toFixed(2)),
          cancelledRate: parseFloat(cancelledRate.toFixed(2)),
        });

        // Thống kê theo trạng thái
        setStatusStats({
          pending: bills.filter((b) => b.status === 0).length,
          completed: bills.filter((b) => b.status === 1).length,
          shipping: bills.filter((b) => b.status === 2).length,
          delivered: bills.filter((b) => b.status === 3).length,
          cancelled: bills.filter((b) => b.status === 4).length,
        });

        // Thống kê theo loại
        setTypeStats({
          online: bills.filter((b) => b.type === "ONLINE").length,
          offline: bills.filter((b) => b.type === "OFFLINE").length,
        });

        // Chuẩn bị dữ liệu biểu đồ doanh thu theo thời gian
        const groupedByDate = {};
        bills.forEach((bill) => {
          const date = moment(bill.createdDate).format("DD/MM/YYYY");
          if (!groupedByDate[date]) {
            groupedByDate[date] = { revenue: 0, orders: 0 };
          }
          groupedByDate[date].revenue += bill.totalAmount || 0;
          groupedByDate[date].orders += 1;
        });

        const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
          return moment(a, "DD/MM/YYYY").valueOf() - moment(b, "DD/MM/YYYY").valueOf();
        });

        setRevenueChartData({
          labels: sortedDates,
          revenues: sortedDates.map((date) => groupedByDate[date].revenue),
          orders: sortedDates.map((date) => groupedByDate[date].orders),
        });

        // Top đơn hàng giá trị cao nhất
        const sortedBills = [...bills]
          .sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0))
          .slice(0, 10);
        setTopOrders(sortedBills);
      } catch (error) {
        console.error("Error fetching statistics: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [dateRange]);

  // Dữ liệu biểu đồ doanh thu
  const revenueChartDataConfig = {
    labels: revenueChartData.labels,
    datasets: [
      {
        label: "Doanh thu (VND)",
        data: revenueChartData.revenues,
        backgroundColor: `${colors.primary}40`,
        borderColor: colors.primary,
        borderWidth: 2,
        yAxisID: "y",
      },
      {
        label: "Số đơn hàng",
        data: revenueChartData.orders,
        backgroundColor: `${colors.success}40`,
        borderColor: colors.success,
        borderWidth: 2,
        yAxisID: "y1",
        type: "line",
      },
    ],
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Doanh thu (VND)",
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Số đơn hàng",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Doanh thu và số lượng đơn hàng theo thời gian",
      },
    },
  };

  // Dữ liệu biểu đồ tròn - Phân bố theo trạng thái
  const statusPieData = {
    labels: [
      "Chờ xác nhận",
      "Đã hoàn thành",
      "Đang giao hàng",
      "Đã giao",
      "Đã hủy",
    ],
    datasets: [
      {
        data: [
          statusStats.pending,
          statusStats.completed,
          statusStats.shipping,
          statusStats.delivered,
          statusStats.cancelled,
        ],
        backgroundColor: [
          colors.info,
          colors.success,
          colors.warning,
          colors.primary,
          colors.danger,
        ],
        borderWidth: 1,
      },
    ],
  };

  // Dữ liệu biểu đồ tròn - Online vs Offline
  const typePieData = {
    labels: ["Online", "Tại quầy"],
    datasets: [
      {
        data: [typeStats.online, typeStats.offline],
        backgroundColor: [colors.warning, colors.info],
        borderWidth: 1,
      },
    ],
  };

  // Hàm xử lý click vào số liệu thống kê
  const handleStatisticClick = (filterType, title) => {
    setCurrentFilterStatus(filterType);
    setDetailModalTitle(title);
    setIsDetailModalVisible(true);
    setDetailModalPagination({
      current: 1,
      pageSize: 10,
      total: 0,
    });
    filterBillsByType(filterType, 1, 10);
  };

  // Hàm filter bills theo loại
  const filterBillsByType = (filterType, page = 1, size = 10) => {
    setDetailModalLoading(true);
    
    let filteredBills = [];
    
    switch (filterType) {
      case "all":
        filteredBills = allBills;
        break;
      case "completed":
        // Đơn thành công: status = 1 (Đã hoàn thành) hoặc status = 3 (Đã giao)
        filteredBills = allBills.filter((b) => b.status === 1 || b.status === 3);
        break;
      case "pending":
        filteredBills = allBills.filter((b) => b.status === 0);
        break;
      case "shipping":
        filteredBills = allBills.filter((b) => b.status === 2);
        break;
      case "cancelled":
        filteredBills = allBills.filter((b) => b.status === 4);
        break;
      default:
        filteredBills = allBills;
    }

    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedBills = filteredBills.slice(startIndex, endIndex);

    setDetailBills(paginatedBills);
    setDetailModalPagination({
      current: page,
      pageSize: size,
      total: filteredBills.length,
    });
    setDetailModalLoading(false);
  };

  // Xử lý thay đổi pagination trong modal
  const handleDetailModalTableChange = (pagination) => {
    filterBillsByType(currentFilterStatus, pagination.current, pagination.pageSize);
  };

  // Đóng modal
  const handleDetailModalClose = () => {
    setIsDetailModalVisible(false);
    setDetailBills([]);
    setCurrentFilterStatus(null);
  };

  // Cột cho bảng chi tiết đơn hàng
  const detailBillColumns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => (
        <span>
          {(detailModalPagination.current - 1) * detailModalPagination.pageSize + index + 1}
        </span>
      ),
    },
    {
      title: "Mã hóa đơn",
      dataIndex: "code",
      key: "code",
      width: 150,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      width: 180,
      render: (text) => text || "Khách lẻ",
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 150,
      align: "right",
      render: (amount) =>
        amount?.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        }),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type) =>
        type === "ONLINE" ? (
          <Tag color="yellow">Online</Tag>
        ) : (
          <Tag color="blue">Tại quầy</Tag>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => {
        const statusMap = {
          0: { text: "Chờ xác nhận", color: "blue" },
          1: { text: "Đã hoàn thành", color: "brown" },
          2: { text: "Đang giao hàng", color: "yellow" },
          3: { text: "Đã giao", color: "green" },
          4: { text: "Đã hủy", color: "red" },
        };
        const statusInfo = statusMap[status] || { text: "N/A", color: "default" };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 150,
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Button
          icon={<FontAwesomeIcon icon={faEye} />}
          onClick={() => {
            handleDetailModalClose();
            navigate(`/bill-detail-management/${record.id}`);
          }}
        >
          Xem
        </Button>
      ),
    },
  ];

  // Cột cho bảng top đơn hàng
  const topOrdersColumns = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Mã hóa đơn",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      render: (text) => text || "Khách lẻ",
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) =>
        amount?.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        }),
      sorter: (a, b) => (a.totalAmount || 0) - (b.totalAmount || 0),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          0: { text: "Chờ xác nhận", color: "blue" },
          1: { text: "Đã hoàn thành", color: "brown" },
          2: { text: "Đang giao hàng", color: "yellow" },
          3: { text: "Đã giao", color: "green" },
          4: { text: "Đã hủy", color: "red" },
        };
        const statusInfo = statusMap[status] || { text: "N/A", color: "default" };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) =>
        type === "ONLINE" ? (
          <Tag color="yellow">Online</Tag>
        ) : (
          <Tag color="blue">Tại quầy</Tag>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
  ];

  return (
    <div className={styles.statisticsContainer}>
      <div className={styles.pageHeader}>
        <AntTitle level={2} className={styles.pageTitle}>
          Thống kê đơn hàng
        </AntTitle>
        <Space>
          <RangePicker
            format="DD/MM/YYYY"
            onChange={(dates) => setDateRange(dates || [])}
            placeholder={["Từ ngày", "Đến ngày"]}
          />
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: 120 }}
            options={[
              { label: "Theo ngày", value: "day" },
              { label: "Theo tuần", value: "week" },
              { label: "Theo tháng", value: "month" },
              { label: "Theo năm", value: "year" },
            ]}
          />
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Bảng thống kê tổng hợp */}
          <Card title="Tổng hợp thống kê đơn hàng" className={styles.summaryTableCard}>
            <Table
              dataSource={[
                {
                  key: "1",
                  label: "Tổng hóa đơn",
                  value: overviewStats.totalBills,
                  filterType: "all",
                  clickable: true,
                },
                {
                  key: "2",
                  label: "Tổng doanh thu",
                  value: overviewStats.totalRevenue,
                  filterType: "all",
                  clickable: true,
                  isRevenue: true,
                },
                {
                  key: "3",
                  label: "Tổng số đơn thành công",
                  value: statusStats.completed + statusStats.delivered,
                  filterType: "completed",
                  clickable: true,
                },
                {
                  key: "4",
                  label: "Tổng số đơn chờ xác nhận",
                  value: statusStats.pending,
                  filterType: "pending",
                  clickable: true,
                },
                {
                  key: "5",
                  label: "Tổng số đơn đang giao hàng",
                  value: statusStats.shipping,
                  filterType: "shipping",
                  clickable: true,
                },
                {
                  key: "6",
                  label: "Tổng số đơn đã hủy",
                  value: statusStats.cancelled,
                  filterType: "cancelled",
                  clickable: true,
                },
              ]}
              columns={[
                {
                  title: "Chỉ số",
                  dataIndex: "label",
                  key: "label",
                  width: "40%",
                },
                {
                  title: "Giá trị",
                  dataIndex: "value",
                  key: "value",
                  width: "60%",
                  render: (value, record) => (
                    <span
                      style={{
                        cursor: record.clickable ? "pointer" : "default",
                        color: record.clickable ? colors.primary : "inherit",
                        fontWeight: 600,
                        fontSize: "16px",
                        textDecoration: record.clickable ? "underline" : "none",
                      }}
                      onClick={() => {
                        if (record.clickable) {
                          handleStatisticClick(
                            record.filterType,
                            record.label
                          );
                        }
                      }}
                      onMouseEnter={(e) => {
                        if (record.clickable) {
                          e.target.style.color = colors.info;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (record.clickable) {
                          e.target.style.color = colors.primary;
                        }
                      }}
                    >
                      {record.isRevenue
                        ? `${value?.toLocaleString("vi-VN")} đ`
                        : value?.toLocaleString("vi-VN")}
                    </span>
                  ),
                },
              ]}
              pagination={false}
              size="middle"
            />
          </Card>

          {/* Thống kê tổng quan */}
          {/* <Row gutter={[16, 16]} className={styles.statsRow}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng số đơn hàng"
                  value={overviewStats.totalBills}
                  prefix="📦"
                  valueStyle={{ color: colors.primary }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng doanh thu"
                  value={overviewStats.totalRevenue}
                  prefix="₫"
                  precision={0}
                  valueStyle={{ color: colors.success }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Giá trị đơn trung bình"
                  value={overviewStats.averageOrderValue}
                  prefix="₫"
                  precision={0}
                  valueStyle={{ color: colors.info }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tỷ lệ thành công"
                  value={overviewStats.successRate}
                  suffix="%"
                  valueStyle={{ color: colors.success }}
                />
              </Card>
            </Col>
          </Row> */}

          {/* Biểu đồ */}
          {/* <Row gutter={[16, 16]} className={styles.chartsRow}>
            <Col xs={24} lg={16}>
              <Card title="Doanh thu và số lượng đơn hàng theo thời gian">
                <div style={{ height: "400px" }}>
                  <Bar data={revenueChartDataConfig} options={revenueChartOptions} />
                </div>
              </Card>
            </Col>
          </Row> */}
          
          {/* Biểu đồ phân bố đơn hàng theo trạng thái */}
          {/* <Row gutter={[16, 16]} className={styles.chartsRow}>
            <Col xs={24} lg={12}>
              <Card title="Phân bố đơn hàng theo trạng thái">
                <div style={{ height: "400px" }}>
                  <Pie data={statusPieData} />
                </div>
              </Card>
            </Col>
          </Row> */}

          {/* <Row gutter={[16, 16]} className={styles.chartsRow}>
            <Col xs={24} lg={12}>
              <Card title="Phân bố đơn hàng Online vs Tại quầy">
                <div style={{ height: "300px" }}>
                  <Pie data={typePieData} />
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Thống kê chi tiết theo trạng thái">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="Chờ xác nhận"
                      value={statusStats.pending}
                      valueStyle={{ color: colors.info }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Đã hoàn thành"
                      value={statusStats.completed}
                      valueStyle={{ color: colors.success }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Đang giao hàng"
                      value={statusStats.shipping}
                      valueStyle={{ color: colors.warning }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Đã giao"
                      value={statusStats.delivered}
                      valueStyle={{ color: colors.primary }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Đã hủy"
                      value={statusStats.cancelled}
                      valueStyle={{ color: colors.danger }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Tỷ lệ hủy"
                      value={overviewStats.cancelledRate}
                      suffix="%"
                      valueStyle={{ color: colors.danger }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row> */}

          {/* Top đơn hàng */}
          <Card title="Top 10 đơn hàng giá trị cao nhất">
            <Table
              columns={topOrdersColumns}
              dataSource={topOrders}
              rowKey="id"
              pagination={false}
              size="middle"
            />
          </Card>
        </>
      )}

      {/* Modal chi tiết đơn hàng */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>{detailModalTitle}</span>
            <Tag color="blue" style={{ marginLeft: "8px" }}>
              {detailModalPagination.total} đơn hàng
            </Tag>
          </div>
        }
        open={isDetailModalVisible}
        onCancel={handleDetailModalClose}
        footer={null}
        width={1400}
        destroyOnClose
        className={styles.detailModal}
      >
        <Table
          columns={detailBillColumns}
          dataSource={detailBills}
          loading={detailModalLoading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            current: detailModalPagination.current,
            pageSize: detailModalPagination.pageSize,
            total: detailModalPagination.total,
            showSizeChanger: true,
            showTotal: (total) => (
              <span>
                Tổng <strong>{total}</strong> đơn hàng
              </span>
            ),
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          onChange={handleDetailModalTableChange}
          locale={{
            emptyText: <Empty description="Không có dữ liệu" />,
          }}
        />
      </Modal>
    </div>
  );
};

export default BillStatistics;

