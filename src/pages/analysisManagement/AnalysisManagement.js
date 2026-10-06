import React, { useEffect, useState } from "react";
import styles from "./AnalysisManagement.module.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { ProductManagementApi } from "../../api/admin/productManagement/ProductManagementApi";
import { Bar, Pie } from "react-chartjs-2";
import { DatePicker, Typography, Empty, Spin, Modal, Table, Tag, Image, Button } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import { CustomerManagementApi } from "../../api/admin/customerManagement/CustomerManagementApi";
import { BillDetailsManagementApi } from "../../api/admin/billDetailsManagement/BillDetailsManagementApi";
import ReviewAnalysisSection from "./ReviewAnalysisSection";
import PrintReportModal from "./PrintReportModal";
import moment from "moment";

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const { RangePicker } = DatePicker;
const { Text } = Typography;

const AnalysisManagement = () => {
  const [loading, setLoading] = useState(true);
  const [productStats, setProductStats] = useState({
    totalProducts: 0,
    soldProducts: 0,
    remainingProducts: 0,
  });

  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    revenueByDate: [],
    revenueByCategory: [],
  });
  const [dateRange, setDateRange] = useState([]);

  const [bestSellingProducts, setBestSellingProducts] = useState([]);

  const [customerStats, setCustomerStats] = useState({
    totalCustomersThisMonth: 0,
    topCustomers: [],
  });

  // State cho modal chi tiết sản phẩm
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [productList, setProductList] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalPagination, setModalPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [allFilteredProducts, setAllFilteredProducts] = useState([]);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // Bộ màu ROYAL JEWELRY theme
  const colors = {
    primary: "#1a365d", // Navy Dark
    success: "#3182ce", // Royal Blue
    danger: "#63b3ed", // Light Blue
    accent: "#1e3a8a", // Deep Blue
    dark: "#1a365d", // Navy
    gray: "#4a5568", // Slate Gray
  };

  // Gọi API để lấy dữ liệu thống kê sản phẩm
  // Cập nhật useEffect để sử dụng dateRange
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Nếu có dateRange, sử dụng nó để lấy dữ liệu
        const params =
          dateRange.length === 2
            ? {
              startDate: dateRange[0].format("YYYY-MM-DD"),
              endDate: dateRange[1].format("YYYY-MM-DD"),
            }
            : {};

        // Gọi API lấy thống kê sản phẩm
        const statsResponse = await ProductManagementApi.getProductStatistics(
          params
        );
        const statsData = statsResponse.data;

        const sold = statsData.soldProducts || 0;
        const remaining = statsData.remainingProducts || 0;
        const calculatedTotal = sold + remaining;

        setProductStats({
          totalProducts: calculatedTotal,
          soldProducts: sold,
          remainingProducts: remaining,
        });

        // Gọi API lấy sản phẩm bán chạy
        const bestSaleResponse = await ProductManagementApi.getBestSaleProduct(
          params
        );
        setBestSellingProducts(bestSaleResponse.data);

        // Gọi API lấy thống kê khách hàng
        const customerResponse = await CustomerManagementApi.getLoyalCustomer(
          params
        );
        const customerData = customerResponse.data;
        setCustomerStats({
          totalCustomersThisMonth: customerData.totalCustomersThisMonth || 0,
          topCustomers: customerData.topCustomers || [],
        });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // Hàm xử lý click vào biểu đồ cột
  const handleBarChartClick = async (elements) => {
    if (elements.length === 0) return;

    const clickedElement = elements[0];
    const datasetIndex = clickedElement.datasetIndex;
    const index = clickedElement.index;
    const labels = ["Tổng số sản phẩm", "Số sản phẩm đã bán", "Số sản phẩm tồn kho"];
    const clickedLabel = labels[index];

    // Xác định loại sản phẩm cần lấy
    let filterType = "all"; // "all", "sold", "remaining"
    let title = "";

    switch (index) {
      case 0: // Tổng số sản phẩm
        filterType = "all";
        title = "Danh sách tất cả sản phẩm";
        break;
      case 1: // Số sản phẩm đã bán
        filterType = "sold";
        title = "Danh sách sản phẩm đã bán";
        break;
      case 2: // Số sản phẩm tồn kho
        filterType = "remaining";
        title = "Danh sách sản phẩm tồn kho";
        break;
      default:
        return;
    }

    setModalTitle(title);
    setIsModalVisible(true);
    await fetchProductList(filterType, 1, 10);
  };

  // Hàm xử lý click vào biểu đồ tròn
  const handlePieChartClick = async (elements) => {
    if (elements.length === 0) return;

    const clickedElement = elements[0];
    const index = clickedElement.index;
    const labels = ["Số sản phẩm đã bán", "Số sản phẩm tồn kho"];

    // Xác định loại sản phẩm cần lấy
    let filterType = ""; // "sold", "remaining"
    let title = "";

    switch (index) {
      case 0: // Số sản phẩm đã bán
        filterType = "sold";
        title = "Danh sách sản phẩm đã bán";
        break;
      case 1: // Số sản phẩm tồn kho
        filterType = "remaining";
        title = "Danh sách sản phẩm tồn kho";
        break;
      default:
        return;
    }

    setModalTitle(title);
    setIsModalVisible(true);
    await fetchProductList(filterType, 1, 10);
  };

  // Hàm lấy danh sách sản phẩm theo loại
  const fetchProductList = async (filterType, page = 1, size = 10) => {
    try {
      setModalLoading(true);

      let filteredProducts = [];

      if (filterType === "sold") {
        // Lấy sản phẩm đã bán từ bill history
        const params = {};

        // Thêm dateRange nếu có
        if (dateRange.length === 2) {
          params.startDate = dateRange[0].startOf('day').valueOf();
          params.endDate = dateRange[1].endOf('day').valueOf();
        }

        const response = await BillDetailsManagementApi.getAllSoldProducts(params);
        filteredProducts = response.data || [];
      } else {
        // Lấy tất cả sản phẩm với size lớn để filter chính xác
        const params = {
          page: 0,
          size: 10000, // Lấy số lượng lớn để đảm bảo lấy được tất cả
        };

        const response = await ProductManagementApi.getProducts(params);
        const data = response.data;

        // Filter sản phẩm theo loại
        if (filterType === "all") {
          filteredProducts = data.content || [];
        } else if (filterType === "remaining") {
          // Sản phẩm tồn kho: totalQuantity > 0
          filteredProducts = (data.content || []).filter(
            (product) => product.totalQuantity > 0
          );
        }
      }

      // Lưu tất cả sản phẩm đã filter
      setAllFilteredProducts(filteredProducts);

      // Phân trang ở frontend
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      setProductList(paginatedProducts);
      setModalPagination({
        current: page,
        pageSize: size,
        total: filteredProducts.length,
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    } finally {
      setModalLoading(false);
    }
  };

  // Hàm xử lý thay đổi trang trong modal
  const handleModalTableChange = (pagination) => {
    // Phân trang từ danh sách đã filter
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const paginatedProducts = allFilteredProducts.slice(startIndex, endIndex);

    setProductList(paginatedProducts);
    setModalPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: allFilteredProducts.length,
    });
  };

  // Đóng modal
  const handleModalClose = () => {
    setIsModalVisible(false);
    setProductList([]);
    setAllFilteredProducts([]);
  };

  // Dữ liệu cho biểu đồ cột
  const productStatsBarData = {
    labels: ["Tổng số sản phẩm", "Số sản phẩm đã bán", "Số sản phẩm tồn kho"],
    datasets: [
      {
        label: "Số lượng",
        data: [
          productStats.totalProducts,
          productStats.soldProducts,
          productStats.remainingProducts,
        ],
        backgroundColor: [
          `${colors.primary}99`, // Indigo with opacity
          `${colors.success}99`, // Green with opacity
          `${colors.danger}99`, // Red with opacity
        ],
        borderColor: [colors.primary, colors.success, colors.danger],
        borderWidth: 1,
      },
    ],
  };

  // Cấu hình options cho Bar chart với onClick
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    onClick: (event, elements) => {
      handleBarChartClick(elements);
    },
    onHover: (event, elements) => {
      event.native.target.style.cursor = elements.length > 0 ? "pointer" : "default";
    },
  };

  // Dữ liệu cho biểu đồ tròn
  const productStatsPieData = {
    labels: ["Số sản phẩm đã bán", "Số sản phẩm tồn kho"],
    datasets: [
      {
        data: [productStats.soldProducts, productStats.remainingProducts],
        backgroundColor: [
          `${colors.success}99`, // Green with opacity
          `${colors.danger}99`, // Red with opacity
        ],
        borderColor: [colors.success, colors.danger],
        borderWidth: 1,
      },
    ],
  };

  // Cấu hình options cho Pie chart với onClick
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 15,
          font: {
            size: 12,
            family: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          },
        },
      },
    },
    onClick: (event, elements) => {
      handlePieChartClick(elements);
    },
    onHover: (event, elements) => {
      event.native.target.style.cursor = elements.length > 0 ? "pointer" : "default";
    },
  };

  // Dữ liệu cho biểu đồ sản phẩm bán chạy
  const bestSellingProductsData = {
    labels: bestSellingProducts.map((product) => product.name),
    datasets: [
      {
        label: "Số lượng đã bán",
        data: bestSellingProducts.map((product) => product.quantitySold),
        backgroundColor: `${colors.primary}99`,
        borderColor: colors.primary,
        borderWidth: 1,
      },
    ],
  };

  // Xử lý thay đổi ngày
  const handleDateChange = async (dates) => {
    if (!dates || dates.length === 0) {
      setDateRange([]);
      return;
    }

    setDateRange(dates);
    setLoading(true);

    try {
      // Format dates để gửi lên server
      const startDate = dates[0].format("YYYY-MM-DD");
      const endDate = dates[1].format("YYYY-MM-DD");

      // Gọi API lấy thống kê sản phẩm theo khoảng thời gian
      const statsResponse = await ProductManagementApi.getProductStatistics({
        startDate,
        endDate,
      });
      const statsData = statsResponse.data;

      // Cập nhật state với dữ liệu mới
      const sold = statsData.soldProducts || 0;
      const remaining = statsData.remainingProducts || 0;
      const calculatedTotal = sold + remaining;

      setProductStats({
        totalProducts: calculatedTotal,
        soldProducts: sold,
        remainingProducts: remaining,
      });

      // Gọi API lấy sản phẩm bán chạy theo khoảng thời gian
      const bestSaleResponse = await ProductManagementApi.getBestSaleProduct({
        startDate,
        endDate,
      });
      setBestSellingProducts(bestSaleResponse.data);

      // Gọi API lấy thống kê khách hàng theo khoảng thời gian
      const customerResponse = await CustomerManagementApi.getLoyalCustomer({
        startDate,
        endDate,
      });
      const customerData = customerResponse.data;
      setCustomerStats({
        totalCustomersThisMonth: customerData.totalCustomersThisMonth || 0,
        topCustomers: customerData.topCustomers || [],
      });
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu theo khoảng thời gian:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderNoData = () => (
    <div className={styles.noData}>
      <Empty description="Không có dữ liệu để hiển thị" />
    </div>
  );

  return (
    <div className={styles.analysisContainer}>
      {/* Header & Filter ngang hàng */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleBox}>
          <h1 className={styles.pageTitle}>Thống Kê & Phân Tích Doanh Số</h1>
          <div className={styles.pageSubtitle}>Hệ thống theo dõi hiệu suất kinh doanh & báo cáo tổng quan ROYAL JEWELRY</div>
        </div>

        {/* Bộ lọc thời gian */}
        <div className={styles.filterContainer}>
          <span className={styles.filterLabel}>Khoảng thời gian:</span>
          <RangePicker
            onChange={handleDateChange}
            value={dateRange}
            format="DD/MM/YYYY"
            allowClear={true}
            style={{ width: "260px", borderRadius: "8px" }}
            placeholder={["Từ ngày", "Đến ngày"]}
          />
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            className={styles.printBtn}
            onClick={() => setPrintModalOpen(true)}
          >
            In Báo Cáo Doanh Số
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className={styles.statCards}>
        <div className={`${styles.statCard} ${styles.statCardBlue}`}>
          <div className={styles.statIconWrapper}>
            💎
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Tổng sản phẩm</div>
            <div className={styles.statValue}>{productStats.totalProducts.toLocaleString("vi-VN")}</div>
            <div className={styles.statSubText}>Danh mục sản phẩm trong hệ thống</div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statCardGreen}`}>
          <div className={styles.statIconWrapper}>
            🛍️
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Đã xuất bán</div>
            <div className={styles.statValue}>{productStats.soldProducts.toLocaleString("vi-VN")}</div>
            <div className={styles.statSubText}>Sản phẩm đã giao thành công</div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statCardGold}`}>
          <div className={styles.statIconWrapper}>
            📦
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Tồn kho thực tế</div>
            <div className={styles.statValue}>{productStats.remainingProducts.toLocaleString("vi-VN")}</div>
            <div className={styles.statSubText}>Sẵn sàng trong kho hàng</div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statCardPurple}`}>
          <div className={styles.statIconWrapper}>
            📈
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Tỷ lệ bán ra</div>
            <div className={styles.statValue}>
              {productStats.totalProducts > 0
                ? Math.round(
                  (productStats.soldProducts / productStats.totalProducts) *
                  100
                )
                : 0}
              %
            </div>
            <div className={styles.statSubText}>Hiệu suất tiêu thụ sản phẩm</div>
          </div>
        </div>
      </div>

      {/* Biểu đồ sản phẩm */}
      <div className={styles.chartsRow}>
        <div className={styles.chartBox}>
          <div className={styles.chartBoxHeader}>
            <h3>Thống kê sản phẩm</h3>
            <Text type="secondary" className={styles.chartTip}>
              💡 Click vào cột để xem chi tiết danh sách
            </Text>
          </div>
          <div className={styles.chartContainer}>
            {loading ? (
              <div className={styles.loadingSpinner}><Spin size="large" /></div>
            ) : (
              <Bar data={productStatsBarData} options={barChartOptions} />
            )}
          </div>
        </div>

        <div className={styles.chartBox}>
          <div className={styles.chartBoxHeader}>
            <h3>Tỷ lệ sản phẩm bán ra</h3>
            <Text type="secondary" className={styles.chartTip}>
              💡 Click vào phần biểu đồ để lọc
            </Text>
          </div>
          <div className={styles.chartContainer}>
            {loading ? (
              <div className={styles.loadingSpinner}><Spin size="large" /></div>
            ) : (
              <Pie
                data={productStatsPieData}
                options={pieChartOptions}
              />
            )}
          </div>
        </div>
      </div>

      {/* Sản phẩm bán chạy & Báo cáo khách hàng */}
      <div className={styles.bottomRow}>
        {/* Sản phẩm bán chạy */}
        <div className={styles.bottomBox}>
          <div className={styles.boxTitleHeader}>
            <h3>🏆 Top Sản phẩm bán chạy</h3>
            <span className={styles.badgeLabel}>Best Sellers</span>
          </div>
          <div className={styles.bestSellingProducts}>
            {loading ? (
              <div className={styles.loadingSpinner}><Spin size="large" /></div>
            ) : bestSellingProducts.length === 0 ? (
              renderNoData()
            ) : (
              bestSellingProducts.map((product, idx) => (
                <div key={product.productId} className={styles.bestProductCard}>
                  <div
                    className={styles.bestProductRank}
                    style={{
                      background:
                        idx === 0
                          ? "linear-gradient(135deg, #FFD700, #FFB300)"
                          : idx === 1
                            ? "linear-gradient(135deg, #E2E8F0, #94A3B8)"
                            : "linear-gradient(135deg, #D97706, #B45309)",
                    }}
                  >
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                  </div>
                  <img
                    className={styles.bestProductImg}
                    src={product.urlImg}
                    alt={product.productName}
                  />
                  <div className={styles.bestProductInfo}>
                    <div className={styles.bestProductName}>
                      {product.productName}
                    </div>
                    <div className={styles.bestProductSold}>
                      Đã bán:{" "}
                      <span className={styles.soldBadge}>
                        {product.totalSoldQuantity.toLocaleString("vi-VN")} món
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Báo cáo khách hàng */}
        <div className={styles.bottomBox}>
          <div className={styles.boxTitleHeader}>
            <h3>👑 Báo cáo khách hàng thân thiết</h3>
            <div className={styles.customerReportTotal}>
              Tháng này: <b>{customerStats?.totalCustomersThisMonth || 0} khách</b>
            </div>
          </div>
          <div className={styles.topCustomersGrid}>
            {loading ? (
              <div className={styles.loadingSpinner}><Spin size="large" /></div>
            ) : customerStats?.topCustomers?.length === 0 ? (
              renderNoData()
            ) : (
              customerStats.topCustomers.map((customer, idx) => (
                <div key={customer.customerId} className={styles.customerCard}>
                  <div className={styles.cardHeader}>
                    <div
                      className={styles.rankBadge}
                      style={{
                        background:
                          idx === 0
                            ? "linear-gradient(135deg, #FFD700, #FFB300)"
                            : idx === 1
                              ? "linear-gradient(135deg, #CBD5E1, #64748B)"
                              : "linear-gradient(135deg, #D97706, #B45309)",
                      }}
                    >
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                    </div>
                    <div className={styles.customerName}>
                      {customer.customerName || "Khách hàng thân thiết"}
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.contactInfo}>
                      <span>📞 {customer.phoneNumber || "N/A"}</span>
                      <span>✉️ {customer.email || "N/A"}</span>
                    </div>
                    <div className={styles.statsGrid}>
                      <div className={styles.statBox}>
                        <div className={styles.statTitle}>Tổng đơn</div>
                        <div className={styles.statNumber}>
                          {customer.totalOrders || 0}
                        </div>
                      </div>
                      <div className={styles.statBox}>
                        <div className={styles.statTitle}>Tổng chi tiêu</div>
                        <div className={styles.statNumberPrice}>
                          {(customer.totalSpent || 0).toLocaleString("vi-VN")}đ
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Thống kê đánh giá sản phẩm */}
      <ReviewAnalysisSection />

      {/* Modal chi tiết sản phẩm */}
      <Modal
        title={
          <div className={styles.modalTitle}>
            <span>{modalTitle}</span>
            <Tag style={{ marginLeft: "8px", borderRadius: "12px" }}>
              {modalPagination.total} sản phẩm
            </Tag>
          </div>
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={1400}
        destroyOnClose
        className={styles.productModal}
      >
        <Table
          columns={
            modalTitle.includes("đã bán")
              ? [
                // Columns cho sản phẩm đã bán từ bill history
                {
                  title: "STT",
                  key: "index",
                  width: 60,
                  align: "center",
                  fixed: "left",
                  render: (_, __, index) => (
                    <span className={styles.indexCell}>
                      {(modalPagination.current - 1) * modalPagination.pageSize +
                        index +
                        1}
                    </span>
                  ),
                },
                {
                  title: "Hình ảnh",
                  key: "image",
                  width: 100,
                  align: "center",
                  fixed: "left",
                  render: (_, record) => (
                    <div className={styles.imageCell}>
                      <Image
                        src={record.urlImg}
                        alt={record.productName}
                        width={70}
                        height={70}
                        style={{
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                        }}
                        preview={{
                          mask: "Xem",
                          maskClassName: styles.imagePreviewMask,
                        }}
                        fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='70'%3E%3Crect width='70' height='70' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='12'%3EKhông có ảnh%3C/text%3E%3C/svg%3E"
                      />
                    </div>
                  ),
                },
                {
                  title: "Số hóa đơn",
                  dataIndex: "totalBills",
                  key: "totalBills",
                  width: 110,
                  align: "center",
                  render: (text) => (
                    <Tag color="purple" className={styles.billCodeTag}>
                      {text || 0} đơn
                    </Tag>
                  ),
                },
                {
                  title: "Mã sản phẩm",
                  dataIndex: "productCode",
                  key: "productCode",
                  width: 120,
                  render: (text) => (
                    <span className={styles.productCode}>{text || "N/A"}</span>
                  ),
                },
                {
                  title: "Tên sản phẩm",
                  dataIndex: "productName",
                  key: "productName",
                  width: 220,
                  ellipsis: {
                    showTitle: true,
                  },
                  render: (text) => (
                    <span className={styles.productName}>{text || "N/A"}</span>
                  ),
                },
                {
                  title: "Màu sắc",
                  dataIndex: "color",
                  key: "color",
                  width: 150,
                  render: (text) => {
                    if (!text) return "N/A";
                    const colors = text.split(", ");
                    return (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {colors.map((color, idx) => (
                          <Tag key={idx} color="cyan" className={styles.colorTag}>
                            {color}
                          </Tag>
                        ))}
                      </div>
                    );
                  },
                },
                {
                  title: "Kích thước",
                  dataIndex: "size",
                  key: "size",
                  width: 150,
                  align: "center",
                  render: (text) => {
                    if (!text) return "N/A";
                    const sizes = text.split(", ");
                    return (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", justifyContent: "center" }}>
                        {sizes.map((size, idx) => (
                          <Tag key={idx} color="geekblue" className={styles.sizeTag}>
                            {size}
                          </Tag>
                        ))}
                      </div>
                    );
                  },
                },
                {
                  title: "Tổng số lượng đã bán",
                  dataIndex: "quantity",
                  key: "quantity",
                  width: 140,
                  align: "center",
                  render: (text) => (
                    <Tag color="green" className={styles.quantityTag}>
                      <strong>{text ? text.toLocaleString("vi-VN") : 0}</strong>
                    </Tag>
                  ),
                },
                {
                  title: "Giá",
                  dataIndex: "price",
                  key: "price",
                  width: 130,
                  align: "right",
                  render: (text) => (
                    <span className={styles.priceText}>
                      {text
                        ? `${Math.round(text).toLocaleString("vi-VN")}đ`
                        : "N/A"}
                    </span>
                  ),
                },
                {
                  title: "Ngày bán",
                  dataIndex: "createdDate",
                  key: "createdDate",
                  width: 140,
                  render: (text) => (
                    <span className={styles.dateText}>
                      {text ? moment(text).format("DD/MM/YYYY") : "N/A"}
                    </span>
                  ),
                },
              ]
              : [
                // Columns cho sản phẩm tồn kho và tất cả sản phẩm
                {
                  title: "STT",
                  key: "index",
                  width: 60,
                  align: "center",
                  fixed: "left",
                  render: (_, __, index) => (
                    <span className={styles.indexCell}>
                      {(modalPagination.current - 1) * modalPagination.pageSize +
                        index +
                        1}
                    </span>
                  ),
                },
                {
                  title: "Hình ảnh",
                  key: "image",
                  width: 100,
                  align: "center",
                  fixed: "left",
                  render: (_, record) => (
                    <div className={styles.imageCell}>
                      <Image
                        src={record.urlImg}
                        alt={record.productName}
                        width={70}
                        height={70}
                        style={{
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                        }}
                        preview={{
                          mask: "Xem",
                          maskClassName: styles.imagePreviewMask,
                        }}
                        fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='70'%3E%3Crect width='70' height='70' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='12'%3EKhông có ảnh%3C/text%3E%3C/svg%3E"
                      />
                    </div>
                  ),
                },
                {
                  title: "Mã sản phẩm",
                  dataIndex: "productCode",
                  key: "productCode",
                  width: 130,
                  render: (text) => (
                    <span className={styles.productCode}>{text || "N/A"}</span>
                  ),
                },
                {
                  title: "Tên sản phẩm",
                  dataIndex: "productName",
                  key: "productName",
                  width: 300,
                  ellipsis: {
                    showTitle: true,
                  },
                  render: (text) => (
                    <span className={styles.productName}>{text || "N/A"}</span>
                  ),
                },
                {
                  title: "Ngày thêm",
                  dataIndex: "createdDate",
                  key: "createdDate",
                  width: 120,
                  render: (text) => (
                    <span className={styles.dateText}>
                      {text ? moment(text).format("DD/MM/YYYY") : "N/A"}
                    </span>
                  ),
                },
                {
                  title: "Số lượng tồn kho",
                  dataIndex: "totalQuantity",
                  key: "totalQuantity",
                  width: 140,
                  align: "center",
                  render: (text) => (
                    <Tag color={text > 0 ? "green" : "red"} className={styles.quantityTag}>
                      <strong>{text ? text.toLocaleString("vi-VN") : 0}</strong>
                    </Tag>
                  ),
                },
                {
                  title: "Trạng thái",
                  dataIndex: "status",
                  key: "status",
                  width: 130,
                  align: "center",
                  render: (status) => (
                    <Tag color={status === 1 ? "green" : "red"} className={styles.statusTag}>
                      {status === 1 ? "Hoạt động" : "Ngừng hoạt động"}
                    </Tag>
                  ),
                },
              ]
          }
          dataSource={productList}
          loading={modalLoading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            current: modalPagination.current,
            pageSize: modalPagination.pageSize,
            total: modalPagination.total,
            showSizeChanger: true,
            showTotal: (total) => (
              <span className={styles.paginationTotal}>
                Tổng <strong>{total}</strong>{" "}
                {modalTitle.includes("đã bán") ? "sản phẩm đã bán" : "sản phẩm"}
              </span>
            ),
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          onChange={handleModalTableChange}
          locale={{
            emptyText: <Empty description="Không có dữ liệu" />,
          }}
          className={styles.productTable}
        />
      </Modal>

      {/* Modal In Báo Cáo Doanh Số */}
      <PrintReportModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        dateRange={dateRange}
        productStats={productStats}
        revenueStats={revenueStats}
        bestSellingProducts={bestSellingProducts}
        customerStats={customerStats}
      />
    </div>
  );
};

export default AnalysisManagement;
