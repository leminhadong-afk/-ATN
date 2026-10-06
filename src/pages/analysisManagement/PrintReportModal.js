import React, { useState, useEffect } from "react";
import { Modal, Button, Typography, Table, Space, Divider, DatePicker, Spin, message } from "antd";
import { PrinterOutlined, FileTextOutlined, CalendarOutlined, DownloadOutlined } from "@ant-design/icons";
import { ProductManagementApi } from "../../api/admin/productManagement/ProductManagementApi";
import { CustomerManagementApi } from "../../api/admin/customerManagement/CustomerManagementApi";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const PrintReportModal = ({
  open,
  onClose,
  dateRange: initialDateRange,
  productStats: initialProductStats,
  revenueStats: initialRevenueStats,
  bestSellingProducts: initialBestSellingProducts,
  customerStats: initialCustomerStats,
}) => {
  const [reportDateRange, setReportDateRange] = useState(initialDateRange || []);
  const [productStats, setProductStats] = useState(initialProductStats || {});
  const [revenueStats, setRevenueStats] = useState(initialRevenueStats || {});
  const [bestSellingProducts, setBestSellingProducts] = useState(initialBestSellingProducts || []);
  const [customerStats, setCustomerStats] = useState(initialCustomerStats || {});
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    setReportDateRange(initialDateRange || []);
    setProductStats(initialProductStats || {});
    setRevenueStats(initialRevenueStats || {});
    setBestSellingProducts(initialBestSellingProducts || []);
    setCustomerStats(initialCustomerStats || {});
  }, [open, initialDateRange, initialProductStats, initialRevenueStats, initialBestSellingProducts, initialCustomerStats]);

  const fetchReportDataForDateRange = async (dates) => {
    setLoading(true);
    try {
      const params = {};
      if (dates && dates.length === 2) {
        params.startDate = dates[0].format("YYYY-MM-DD");
        params.endDate = dates[1].format("YYYY-MM-DD");
      }

      // 1. Fetch Product Stats
      const statsRes = await ProductManagementApi.getProductStatistics(params);
      if (statsRes && statsRes.data) {
        const sold = statsRes.data.soldProducts || 0;
        const remaining = statsRes.data.remainingProducts || 0;
        setProductStats({
          totalProducts: sold + remaining,
          soldProducts: sold,
          remainingProducts: remaining,
        });
      }

      // 2. Fetch Top Selling Products
      const bestSaleRes = await ProductManagementApi.getBestSaleProduct(params);
      if (bestSaleRes && bestSaleRes.data) {
        setBestSellingProducts(bestSaleRes.data);
      }

      // 3. Fetch Top Customers
      const customerRes = await CustomerManagementApi.getLoyalCustomer(params);
      if (customerRes && customerRes.data) {
        setCustomerStats({
          totalCustomersThisMonth: customerRes.data.totalCustomersThisMonth || 0,
          topCustomers: customerRes.data.topCustomers || [],
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu báo cáo theo ngày:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates) => {
    setReportDateRange(dates || []);
    fetchReportDataForDateRange(dates);
  };

  // Hàm tải trực tiếp file PDF về máy tính
  const handleDownloadPDF = () => {
    const element = document.getElementById("printable-report-content");
    if (!element) {
      message.error("Không tìm thấy nội dung báo cáo để xuất PDF");
      return;
    }

    setDownloadingPdf(true);
    const fileName = `Bao_Cao_Doanh_So_Royal_Jewelry_${dayjs().format("YYYYMMDD_HHmm")}.pdf`;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: fileName,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    const triggerSave = () => {
      window.html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          setDownloadingPdf(false);
          message.success(`Đã tải xuống thành công file ${fileName}`);
        })
        .catch((err) => {
          console.error("Lỗi khi xuất PDF:", err);
          setDownloadingPdf(false);
          message.error("Không thể xuất file PDF. Vui lòng thử lại.");
        });
    };

    if (window.html2pdf) {
      triggerSave();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = () => {
        triggerSave();
      };
      script.onerror = () => {
        setDownloadingPdf(false);
        message.error("Không thể tải thư viện xuất PDF");
      };
      document.body.appendChild(script);
    }
  };

  // Hàm mở cửa sổ in ấn
  const handlePrint = () => {
    const reportElem = document.getElementById("printable-report-content");
    if (!reportElem) {
      window.print();
      return;
    }

    const printWindow = window.open("", "_blank", "width=900,height=800");
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Báo cáo doanh số - ROYAL JEWELRY</title>
          <style>
            body {
              font-family: Arial, Helvetica, sans-serif;
              margin: 0;
              padding: 20px;
              color: #262626;
              background: #fff;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
              font-size: 13px;
            }
            th, td {
              border: 1px solid #d9d9d9;
              padding: 8px 12px;
            }
            th {
              background-color: #1a365d;
              color: #ffffff;
              font-weight: bold;
              text-align: left;
            }
            .ant-table-wrapper table {
              width: 100%;
            }
            .ant-table-thead > tr > th {
              background-color: #fafafa;
              font-weight: bold;
              border-bottom: 1px solid #f0f0f0;
              color: #262626;
            }
            .ant-table-tbody > tr > td {
              border-bottom: 1px solid #f0f0f0;
              padding: 8px;
            }
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
          </style>
        </head>
        <body>
          ${reportElem.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const formattedStartDate =
    reportDateRange && reportDateRange.length === 2
      ? reportDateRange[0].format("DD/MM/YYYY")
      : "Tất cả thời gian";
  const formattedEndDate =
    reportDateRange && reportDateRange.length === 2
      ? reportDateRange[1].format("DD/MM/YYYY")
      : "";

  const timeRangeText =
    formattedStartDate === "Tất cả thời gian"
      ? "Tất cả thời gian"
      : `Từ ngày ${formattedStartDate} đến ngày ${formattedEndDate}`;

  const topProductColumns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, idx) => idx + 1,
    },
    {
      title: "Mã SP",
      key: "productId",
      render: (_, record) => record.code || record.productId?.substring(0, 8) || "N/A",
    },
    {
      title: "Tên sản phẩm",
      key: "productName",
      render: (_, record) => record.productName || record.name || record.productCode || "N/A",
    },
    {
      title: "Thương hiệu",
      key: "brand",
      render: (_, record) => record.brand || record.brandName || "ROYAL JEWELRY",
    },
    {
      title: "Đã bán",
      key: "soldQuantity",
      align: "center",
      render: (_, record) => (
        <Text strong style={{ color: "#1a365d" }}>
          {record.totalSoldQuantity ?? record.quantitySold ?? record.quantity ?? 0}
        </Text>
      ),
    },
  ];

  const topCustomerColumns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, idx) => idx + 1,
    },
    {
      title: "Tên khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      render: (text) => text || "Khách hàng",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (text) => text || "N/A",
    },
    {
      title: "Tổng đơn hàng",
      dataIndex: "totalOrders",
      key: "totalOrders",
      align: "center",
      render: (val) => val || 0,
    },
    {
      title: "Tổng chi tiêu",
      dataIndex: "totalSpent",
      key: "totalSpent",
      align: "right",
      render: (val) => (
        <Text strong style={{ color: "#1a365d" }}>
          {(val || 0).toLocaleString("vi-VN")} đ
        </Text>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined style={{ color: "#c59b27" }} />
          <span>Tùy chọn & Xuất Báo cáo Doanh số</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={950}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        <Button
          key="download"
          type="primary"
          icon={<DownloadOutlined />}
          loading={downloadingPdf}
          style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          onClick={handleDownloadPDF}
        >
          Tải File PDF
        </Button>,
        <Button
          key="print"
          type="primary"
          icon={<PrinterOutlined />}
          style={{ backgroundColor: "#1a365d", borderColor: "#1a365d" }}
          onClick={handlePrint}
        >
          In Trực Tiếp
        </Button>,
      ]}
    >
      {/* Thanh Chọn Khoảng Thời Gian In */}
      <div
        style={{
          backgroundColor: "#e6f7ff",
          padding: "12px 20px",
          borderRadius: 8,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justify: "space-between",
          border: "1px solid #91d5ff",
        }}
      >
        <Space>
          <CalendarOutlined style={{ color: "#1890ff", fontSize: 16 }} />
          <Text strong style={{ color: "#0050b3" }}>
            Chọn khoảng thời gian xuất báo cáo:
          </Text>
        </Space>
        <RangePicker
          value={reportDateRange}
          onChange={handleDateRangeChange}
          format="DD/MM/YYYY"
          allowClear
          placeholder={["Từ ngày", "Đến ngày"]}
          style={{ width: 280 }}
        />
      </div>

      <Spin spinning={loading} tip="Đang cập nhật dữ liệu báo cáo...">
        <div id="printable-report-content" style={{ padding: "16px 24px", background: "#fff" }}>
          {/* Header Doanh Nghiệp */}
          <div style={{ textAlign: "center", marginBottom: 20, borderBottom: "2px solid #1a365d", paddingBottom: 12 }}>
            <Title level={2} style={{ margin: 0, color: "#1a365d", letterSpacing: 2 }}>
              ROYAL JEWELRY
            </Title>
            <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
              Hệ Thống Quản Lý & Phân Phối Trang Sức Cao Cấp
            </Text>
            <Divider style={{ margin: "10px 0" }} />
            <Title level={3} style={{ margin: "6px 0 2px 0", textTransform: "uppercase", color: "#c59b27" }}>
              BÁO CÁO THỐNG KÊ DOANH SỐ & BÁN HÀNG
            </Title>
            <Text italic type="secondary" style={{ fontSize: 13 }}>
              Thời gian thống kê: {timeRangeText}
            </Text>
          </div>

          {/* Thông tin báo cáo */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              backgroundColor: "#fafafa",
              padding: "8px 14px",
              borderRadius: 6,
              marginBottom: 16,
              border: "1px solid #f0f0f0",
              fontSize: 12,
            }}
          >
            <div>
              <strong>Ngày xuất báo cáo:</strong> {dayjs().format("DD/MM/YYYY HH:mm")}
            </div>
            <div>
              <strong>Người lập báo cáo:</strong> Quản trị viên (Admin)
            </div>
          </div>

          {/* I. Bảng Thống kê Tổng quan */}
          <Title level={4} style={{ fontSize: 15, marginBottom: 8, color: "#1a365d" }}>
            I. THỐNG KÊ TỔNG QUAN DOANH SỐ
          </Title>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: 16,
              fontSize: 12,
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#1a365d", color: "#fff" }}>
                <th style={{ padding: 8, border: "1px solid #ddd", textAlign: "left" }}>Chỉ số thống kê</th>
                <th style={{ padding: 8, border: "1px solid #ddd", textAlign: "right" }}>Giá trị</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>Tổng Doanh Thu (VNĐ)</td>
                <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "right", fontWeight: "bold", color: "#1a365d" }}>
                  {((revenueStats?.totalRevenue && revenueStats.totalRevenue > 0)
                    ? revenueStats.totalRevenue
                    : (customerStats?.topCustomers || []).reduce((sum, c) => sum + (c.totalSpent || 0), 0)
                  ).toLocaleString("vi-VN")} đ
                </td>
              </tr>
              <tr>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>Số Lượng Sản Phẩm Đã Bán</td>
                <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "right", fontWeight: "bold" }}>
                  {productStats?.soldProducts || 0} sản phẩm
                </td>
              </tr>
              <tr>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>Số Lượng Tồn Kho Hiện Tại</td>
                <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "right", fontWeight: "bold" }}>
                  {productStats?.remainingProducts || 0} sản phẩm
                </td>
              </tr>
              <tr>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>Tổng Số Khách Hàng Thân Thiết</td>
                <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "right", fontWeight: "bold" }}>
                  {customerStats?.totalCustomersThisMonth || 0} khách hàng
                </td>
              </tr>
            </tbody>
          </table>

          {/* II. Top sản phẩm bán chạy nhất */}
          <Title level={4} style={{ fontSize: 15, marginBottom: 8, color: "#1a365d" }}>
            II. TOP SẢN PHẨM BÁN CHẠY NHẤT
          </Title>
          <Table
            dataSource={bestSellingProducts || []}
            columns={topProductColumns}
            rowKey={(r, idx) => r.productId || r.id || idx}
            pagination={false}
            size="small"
            style={{ marginBottom: 16 }}
          />

          {/* III. Top khách hàng */}
          <Title level={4} style={{ fontSize: 15, marginBottom: 8, color: "#1a365d" }}>
            III. TOP KHÁCH HÀNG THÂN THIẾT HÀNG ĐẦU
          </Title>
          <Table
            dataSource={customerStats?.topCustomers || []}
            columns={topCustomerColumns}
            rowKey={(r, idx) => r.customerId || idx}
            pagination={false}
            size="small"
            style={{ marginBottom: 24 }}
          />

          {/* Chữ ký xác nhận */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              textAlign: "center",
              marginTop: 30,
              pageBreakInside: "avoid",
            }}
          >
            <div style={{ width: "40%" }}>
              <Paragraph strong style={{ margin: 0, fontSize: 13 }}>
                NGƯỜI LẬP BÁO CÁO
              </Paragraph>
              <Text type="secondary" style={{ fontSize: 11 }}>(Ký và ghi rõ họ tên)</Text>
              <div style={{ height: 45 }}></div>
              <Text italic style={{ fontSize: 12 }}>Admin</Text>
            </div>
            <div style={{ width: "40%" }}>
              <Paragraph strong style={{ margin: 0, fontSize: 13 }}>
                ĐẠI DIỆN CỬA HÀNG
              </Paragraph>
              <Text type="secondary" style={{ fontSize: 11 }}>(Ký, đóng dấu và ghi rõ họ tên)</Text>
              <div style={{ height: 45 }}></div>
              <Text italic style={{ fontWeight: "bold", fontSize: 12 }}>ROYAL JEWELRY</Text>
            </div>
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default PrintReportModal;
