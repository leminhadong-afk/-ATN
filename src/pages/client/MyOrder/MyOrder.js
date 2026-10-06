import React, { useEffect, useState } from "react";
import { Button, Typography, message, Spin, Tag, Space, Empty } from "antd";
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  Eye, 
  Calendar, 
  Package, 
  CreditCard,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../HomePage/Header";
import Footer from "../HomePage/Footer";
import { OrderApi } from "../../../api/client/order/OrderApi";
import { isTokenExpired } from "../../../util/common/utils";
import dayjs from "dayjs";
import styles from "./MyOrder.module.css";

const { Title, Text } = Typography;

const statusOptions = [
  { key: "all", label: "Tất cả", icon: <ShoppingBag size={16} /> },
  { key: "0", label: "Chờ xử lý", icon: <Clock size={16} /> },
  { key: "1", label: "Đã thanh toán", icon: <CheckCircle2 size={16} /> },
  { key: "2", label: "Đang giao", icon: <Truck size={16} /> },
  { key: "3", label: "Hoàn thành", icon: <CheckCircle2 size={16} /> },
  { key: "4", label: "Đã hủy", icon: <XCircle size={16} /> },
];

const statusMap = {
  0: { color: "#f59e0b", text: "Chờ xử lý", icon: <Clock size={14} /> },
  1: { color: "#10b981", text: "Đã thanh toán", icon: <CheckCircle2 size={14} /> },
  2: { color: "#3b82f6", text: "Đang giao", icon: <Truck size={14} /> },
  3: { color: "#8b5cf6", text: "Hoàn thành", icon: <CheckCircle2 size={14} /> },
  4: { color: "#ef4444", text: "Đã hủy", icon: <XCircle size={14} /> },
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);
};

const MyOrderPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isTokenExpired(token)) {
      navigate("/");
      message.warning("Vui lòng đăng nhập để xem đơn hàng");
      return;
    }
    fetchOrders();
    window.scrollTo(0, 0);
  }, [navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await OrderApi.getMyOrders();
      const data = res.data || [];
      setOrders(data);
      setFilteredOrders(data);
    } catch (e) {
      message.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => String(o.status) === activeTab));
    }
  }, [activeTab, orders]);

  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.container}>
        <Title level={2} className={styles.pageTitle}>
          <ShoppingBag size={32} /> Đơn hàng của tôi
        </Title>

        {/* Status Filters */}
        <div className={styles.filters}>
          {statusOptions.map(opt => (
            <Button
              key={opt.key}
              className={`${styles.tabBtn} ${activeTab === opt.key ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab(opt.key)}
              icon={opt.icon}
            >
              {opt.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Đang tải đơn hàng...</div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className={styles.orderList}>
            {filteredOrders.map((order) => {
              const status = statusMap[order.status] || statusMap[0];
              return (
                <div 
                  key={order.id} 
                  className={styles.orderCard}
                  onClick={() => navigate(`/my-orders/detail/${order.id}`)}
                >
                  <div className={styles.orderCardHeader}>
                    <div>
                      <div className={styles.orderId}>#{order.billCode || order.id}</div>
                      <div className={styles.orderDate}>
                        <Calendar size={14} />
                        {dayjs(order.createdDate).format("DD/MM/YYYY HH:mm")}
                      </div>
                    </div>
                    <div 
                      className={styles.statusBadge} 
                      style={{ color: status.color, background: `${status.color}15` }}
                    >
                      {status.icon}
                      {status.text}
                    </div>
                  </div>

                  <div className={styles.orderBody}>
                    <div className={styles.orderMeta}>
                      <div className={styles.metaItem}>
                        <Package size={16} />
                        <span>Sản phẩm:</span>
                        <span className={styles.metaValue}>{order.totalQuantity || 0} món</span>
                      </div>
                      <div className={styles.metaItem}>
                        <CreditCard size={16} />
                        <span>Thanh toán:</span>
                        <span className={styles.metaValue}>
                          {order.isPaid ? "Đã thanh toán (VNPay)" : "COD (Tiền mặt)"}
                        </span>
                      </div>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.orderTotal}>
                      <div className={styles.totalLabel}>Giá trị đơn hàng</div>
                      <div className={styles.totalValue}>{formatCurrency(order.totalAmount)}</div>
                    </div>
                  </div>

                  <div className={styles.viewDetail}>
                    <Button 
                      className={styles.viewBtn} 
                      icon={<Eye size={18} />}
                      iconPosition="end"
                    >
                      Xem chi tiết <ChevronRight size={16} style={{ marginLeft: 8 }} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description={false}
            />
            <div className={styles.emptyTitle}>Chưa có đơn hàng nào</div>
            <div className={styles.emptyText}>
              Có vẻ như bạn chưa đặt hàng. Hãy khám phá bộ sưu tập trang sức của chúng tôi nhé!
            </div>
            <Button 
              type="primary" 
              size="large" 
              onClick={() => navigate("/")}
              style={{ borderRadius: 12, height: 50, padding: "0 40px" }}
            >
              MUA SẮM NGAY
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyOrderPage;

