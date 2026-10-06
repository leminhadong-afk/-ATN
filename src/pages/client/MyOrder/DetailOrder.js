import React, { useEffect, useState } from "react";
import {
  Typography,
  Steps,
  Spin,
  message,
  Button,
  Modal,
  Tag,
  Space
} from "antd";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  MapPin,
  User,
  Phone,
  CreditCard,
  ShoppingBag,
  Info,
  Calendar
} from "lucide-react";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import { OrderApi } from "../../../api/client/order/OrderApi";
import Header from "../HomePage/Header";
import Footer from "../HomePage/Footer";
import CreateReviewModal from "./CreateReviewModal";
import styles from "./MyOrder.module.css";

const { Title, Text } = Typography;

const statusMap = {
  0: { color: "#f59e0b", text: "Chờ xử lý", icon: <Clock size={20} /> },
  1: { color: "#10b981", text: "Đã thanh toán", icon: <CheckCircle2 size={20} /> },
  2: { color: "#3b82f6", text: "Đang giao", icon: <Truck size={20} /> },
  3: { color: "#8b5cf6", text: "Hoàn thành", icon: <CheckCircle2 size={20} /> },
  4: { color: "#ef4444", text: "Đã hủy", icon: <XCircle size={20} /> },
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);
};

const hotline = "09xx.xxx.xxx";

const DetailOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    OrderApi.getOrderDetail(id)
      .then((res) => setOrderDetail(res.data))
      .catch(() => {
        message.error("Không thể tải chi tiết đơn hàng");
        setOrderDetail(null);
      })
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [id]);

  const getOrderProcessSteps = () => {
    if (!orderDetail?.bill) return [];
    if (orderDetail.bill.status === 4) {
      return orderDetail.timeline?.map(t => ({
        title: statusMap[t.status]?.text || "Hủy đơn",
        description: dayjs(t.createdDate).format("DD/MM/YYYY HH:mm"),
        icon: statusMap[t.status]?.icon
      })) || [];
    }

    const steps = [
      { status: 0, title: "Đã đặt hàng", icon: <Clock size={16} /> },
      { status: 1, title: "Đã thanh toán", icon: <CheckCircle2 size={16} /> },
      { status: 2, title: "Đang giao hàng", icon: <Truck size={16} /> },
      { status: 3, title: "Hoàn thành", icon: <CheckCircle2 size={16} /> },
    ];

    return steps.map(step => {
      const t = orderDetail.timeline?.find(x => x.status === step.status);
      return {
        title: step.title,
        icon: step.icon,
        description: t ? dayjs(t.createdDate).format("DD/MM HH:mm") : "",
        status: t ? (step.status === orderDetail.bill.status ? "process" : "finish") : "wait"
      };
    });
  };

  const handleCancelOrder = () => {
    if (orderDetail.bill.isPaid) {
      Modal.info({
        title: "Hướng dẫn hủy đơn hàng",
        content: (
          <div>
            Đơn hàng đã thanh toán online. Vui lòng liên hệ Hotline <b>{hotline}</b> để được hỗ trợ hoàn tiền.
          </div>
        ),
        okText: "Đã hiểu",
      });
      return;
    }

    Modal.confirm({
      title: "Xác nhận hủy đơn hàng",
      content: "Bạn có chắc muốn hủy đơn hàng này không?",
      okText: "Xác nhận hủy",
      cancelText: "Quay lại",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await OrderApi.cancelCashBill({ billId: orderDetail.bill.id });
          message.success("Đã gửi yêu cầu hủy đơn hàng.");
          navigate("/my-orders");
        } catch {
          message.error("Có lỗi xảy ra, vui lòng thử lại sau.");
        }
      },
    });
  };

  if (loading) return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.container} style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
      <Footer />
    </div>
  );

  if (!orderDetail) return null;

  const currentStatus = statusMap[orderDetail.bill.status] || statusMap[0];

  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.container}>
        <div className={styles.detailHeaderSection}>
          <Button 
            className={styles.backBtn} 
            type="link" 
            icon={<ArrowLeft size={18} />} 
            onClick={() => navigate("/my-orders")}
          >
            Quay lại danh sách
          </Button>

          <div className={styles.detailHeaderBar}>
            <div className={styles.detailTitleWrapper}>
              <Title level={2} className={styles.detailOrderTitle}>
                Chi tiết đơn hàng
              </Title>
              <span className={styles.orderCodeBadge}>
                #{orderDetail.bill.billCode || orderDetail.bill.id}
              </span>
            </div>
            {orderDetail.bill.status === 0 && (
              <Button danger className={styles.cancelOrderBtn} onClick={handleCancelOrder}>
                Hủy đơn hàng
              </Button>
            )}
          </div>
        </div>

        {/* Tracking Steps */}
        <div className={styles.stepsContainer}>
          <Steps
            current={orderDetail.bill.status === 4 ? 0 : orderDetail.bill.status}
            items={getOrderProcessSteps()}
            progressDot={false}
          />
        </div>

        <div className={styles.detailCard}>
          <Title level={4} className={styles.detailSectionTitle}>
            <Info size={22} color="var(--primary-color)" /> Thông tin chung
          </Title>
          <div className={styles.detailInfoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Mã đơn hàng</span>
              <span className={styles.infoValue}>#{orderDetail.bill.billCode || orderDetail.bill.id}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Ngày đặt</span>
              <span className={styles.infoValue}>
                <Calendar size={14} style={{ marginRight: 8 }} />
                {dayjs(orderDetail.bill.createdDate).format("DD/MM/YYYY HH:mm")}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Trạng thái</span>
              <Tag style={{ color: currentStatus.color, background: `${currentStatus.color}15`, border: 'none' }}>
                {currentStatus.text}
              </Tag>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Thanh toán</span>
              <span className={styles.infoValue}>
                <CreditCard size={14} style={{ marginRight: 8 }} />
                {orderDetail.bill.isPaid ? "Đã thanh toán (VNPay)" : "Thanh toán khi nhận hàng (COD)"}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.detailCard}>
          <Title level={4} className={styles.detailSectionTitle}>
            <MapPin size={22} color="var(--primary-color)" /> Thông tin giao hàng
          </Title>
          <div className={styles.detailInfoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Người nhận</span>
              <span className={styles.infoValue}>
                <User size={14} style={{ marginRight: 8 }} />
                {orderDetail.bill.recipient}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Số điện thoại</span>
              <span className={styles.infoValue}>
                <Phone size={14} style={{ marginRight: 8 }} />
                {orderDetail.bill.phonenumber}
              </span>
            </div>
            <div className={styles.infoItem} style={{ gridColumn: 'span 2' }}>
              <span className={styles.infoLabel}>Địa chỉ giao hàng</span>
              <span className={styles.infoValue}>{orderDetail.bill.address}</span>
            </div>
          </div>
        </div>

        <div className={styles.detailCard}>
          <Title level={4} className={styles.detailSectionTitle}>
            <ShoppingBag size={22} color="var(--primary-color)" /> Danh sách sản phẩm
          </Title>
          <div>
            {(orderDetail.billDetails || []).map((detail, idx) => {
              const pd = (orderDetail.productDetails || []).find(p => p.id === detail.productDetailId);
              return (
                <div key={idx} className={styles.productItem}>
                  {pd?.urlImage ? (
                    <img src={pd.urlImage} alt="Product" className={styles.productImage} />
                  ) : (
                    <div className={styles.productImage} style={{ background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShoppingBag size={32} color="#ccc" />
                    </div>
                  )}
                  <div className={styles.productDetails}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className={styles.productName}>{pd?.productCode || "Sản phẩm trang sức"}</span>
                      <span className={styles.productPrice}>{formatCurrency(detail.finalPrice || detail.price)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
                      <Text type="secondary">Số lượng: {detail.quantity}</Text>
                      <Space>
                        {orderDetail.bill.status === 3 && (
                          <Button
                            type="primary"
                            size="small"
                            style={{ backgroundColor: '#c59b27', borderColor: '#c59b27', borderRadius: 6 }}
                            onClick={() => setReviewTarget({
                              billId: orderDetail.bill.id,
                              productId: pd?.productId || pd?.id,
                              productDetailId: detail.productDetailId,
                              productName: pd?.productCode || "Sản phẩm trang sức",
                              productImage: pd?.urlImage,
                            })}
                          >
                            Đánh giá sản phẩm
                          </Button>
                        )}
                        <Text strong style={{ fontSize: '1.2rem', color: 'var(--secondary-color)' }}>
                          {formatCurrency((detail.finalPrice || detail.price) * detail.quantity)}
                        </Text>
                      </Space>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 40, borderTop: '2px solid #f0f0f0', paddingTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 300 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text type="secondary">Phí vận chuyển</Text>
                  <Text strong>{formatCurrency(orderDetail.bill.shippingFee || 0)}</Text>
                </div>
                {orderDetail.bill.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text type="secondary">Giảm giá</Text>
                    <Text type="danger">-{formatCurrency(orderDetail.bill.discount)}</Text>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                  <Text strong style={{ fontSize: '1.1rem' }}>TỔNG CỘNG</Text>
                  <Title level={3} style={{ margin: 0, color: 'var(--accent-color)' }}>
                    {formatCurrency(orderDetail.bill.totalAmount)}
                  </Title>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {reviewTarget && (
        <CreateReviewModal
          open={!!reviewTarget}
          onClose={() => setReviewTarget(null)}
          billId={reviewTarget.billId}
          productId={reviewTarget.productId}
          productDetailId={reviewTarget.productDetailId}
          productName={reviewTarget.productName}
          productImage={reviewTarget.productImage}
          onSuccess={() => {
            message.info("Cảm ơn bạn đã gửi đánh giá cho sản phẩm!");
          }}
        />
      )}
    </div>
  );
};

export default DetailOrder;

