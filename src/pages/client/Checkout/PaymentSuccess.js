import React, { useEffect, useState } from "react";
import { Button, Typography, message, Space, Spin } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, ShoppingBag, Home, FileText, Download, XCircle, RotateCcw, AlertCircle } from "lucide-react";
import { OrderApi } from "../../../api/client/order/OrderApi";
import { ClientVnPayApi } from "../../../api/client/vnpay/ClientVnPayApi";
import Header from "../HomePage/Header";
import Footer from "../HomePage/Footer";
import styles from "./CheckoutPage.module.css";

const { Title, Text } = Typography;

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [billId, setBillId] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("loading"); // "loading" | "success" | "cancelled" | "failed"
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const processPaymentResult = async () => {
      let id = searchParams.get("billId");
      const vnpResponseCode = searchParams.get("vnp_ResponseCode");
      const vnpTransactionStatus = searchParams.get("vnp_TransactionStatus");
      const vnpOrderInfo = searchParams.get("vnp_OrderInfo");

      if (!id && vnpOrderInfo) {
        const match = vnpOrderInfo.match(/- (.+)$/);
        if (match && match[1]) {
          id = match[1].trim();
        }
      }

      if (id) {
        setBillId(id);
      }

      // Kiểm tra nếu là redirect từ VNPay (có chứa vnp_ResponseCode)
      if (vnpResponseCode !== null) {
        try {
          const paramsObj = Object.fromEntries(searchParams.entries());
          // Gửi toàn bộ query params cho backend xác minh và cập nhật trạng thái đơn hàng
          const callbackRes = await ClientVnPayApi.handleCallback(paramsObj);
          const callbackData = callbackRes.data || {};
          
          if (callbackData.billId && !id) {
            setBillId(callbackData.billId);
          }

          if (vnpResponseCode === "00" && (vnpTransactionStatus === "00" || !vnpTransactionStatus)) {
            setPaymentStatus("success");
          } else if (vnpResponseCode === "24") {
            setPaymentStatus("cancelled");
            setErrorMessage("Bạn đã hủy giao dịch thanh toán qua cổng VNPay. Đơn hàng chưa được thanh toán và đã được hệ thống tự động hủy.");
          } else {
            setPaymentStatus("failed");
            setErrorMessage(
              `Thanh toán qua cổng VNPay không thành công (Mã lỗi: ${vnpResponseCode}). Đơn hàng đã được hệ thống tự động hủy.`
            );
          }
        } catch (error) {
          console.error("Lỗi khi xử lý kết quả VNPay callback:", error);
          if (vnpResponseCode === "00") {
            setPaymentStatus("success");
          } else if (vnpResponseCode === "24") {
            setPaymentStatus("cancelled");
            setErrorMessage("Bạn đã hủy giao dịch thanh toán qua cổng VNPay. Đơn hàng đã được hệ thống tự động hủy.");
          } else {
            setPaymentStatus("failed");
            setErrorMessage("Giao dịch thanh toán không thành công. Đơn hàng đã bị hủy.");
          }
        }
      } else {
        // Đặt hàng thành công qua COD thông thường
        setPaymentStatus("success");
      }
    };

    processPaymentResult();
    window.scrollTo(0, 0);
  }, [searchParams]);

  const handleDownloadPDF = async () => {
    if (!billId) {
      message.error("Không tìm thấy thông tin đơn hàng");
      return;
    }

    setDownloading(true);
    try {
      const response = await OrderApi.downloadOrderPDF(billId);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice_${billId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success("Tải hóa đơn thành công!");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      message.error("Không thể tải hóa đơn. Vui lòng thử lại sau.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.container}>
        {paymentStatus === "loading" && (
          <div className={styles.successContainer} style={{ padding: "100px 40px" }}>
            <Spin size="large" tip="Đang kiểm tra kết quả thanh toán..." />
            <div style={{ marginTop: 20, color: "var(--text-muted)", fontSize: "1rem" }}>
              Vui lòng chờ trong giây lát...
            </div>
          </div>
        )}

        {paymentStatus === "success" && (
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>
              <Check size={48} strokeWidth={3} />
            </div>

            <Title className={styles.successTitle}>Đặt hàng thành công!</Title>

            <div className={styles.successText}>
              Cảm ơn bạn đã tin tưởng và lựa chọn <span style={{ color: "var(--primary-color)", fontWeight: 700 }}>ROYAL JEWELRY</span>.<br />
              Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn.<br />
              Một email xác nhận đã được gửi đến địa chỉ của bạn.
            </div>

            {billId && (
              <div className={styles.orderNumber}>
                Mã đơn hàng: #{billId}
              </div>
            )}

            <div className={styles.actionButtons}>
              <Button
                className={styles.btnPrimary}
                type="primary"
                icon={<Home size={18} />}
                onClick={() => navigate("/")}
              >
                Về trang chủ
              </Button>

              <Button
                className={styles.btnOutline}
                icon={<ShoppingBag size={18} />}
                onClick={() => navigate("/my-orders")}
              >
                Đơn hàng của tôi
              </Button>

              <Button
                className={styles.btnOutline}
                icon={<Download size={18} />}
                onClick={handleDownloadPDF}
                loading={downloading}
                disabled={!billId}
              >
                Tải hóa đơn PDF
              </Button>
            </div>

            <div style={{ marginTop: 60, paddingTop: 40, borderTop: "1px solid #f0f0f0" }}>
              <Space size={40}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "var(--primary-color)", marginBottom: 8 }}><FileText size={24} /></div>
                  <Text strong style={{ fontSize: 12 }}>Bảo hành trọn đời</Text>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "var(--primary-color)", marginBottom: 8 }}><ShoppingBag size={24} /></div>
                  <Text strong style={{ fontSize: 12 }}>Đổi trả 30 ngày</Text>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "var(--primary-color)", marginBottom: 8 }}><Check size={24} /></div>
                  <Text strong style={{ fontSize: 12 }}>Sản phẩm chính hãng</Text>
                </div>
              </Space>
            </div>
          </div>
        )}

        {(paymentStatus === "cancelled" || paymentStatus === "failed") && (
          <div className={styles.successContainer}>
            <div className={styles.failedIcon}>
              <XCircle size={48} strokeWidth={2.5} />
            </div>

            <Title className={styles.failedTitle}>
              {paymentStatus === "cancelled" ? "Giao dịch đã bị hủy" : "Thanh toán không thành công"}
            </Title>

            <div className={styles.successText}>
              {errorMessage || "Giao dịch thanh toán qua cổng VNPay đã bị hủy hoặc không thành công."}<br />
              Sản phẩm đã được hoàn trả lại giỏ hàng/kho và không có bất kỳ khoản phí nào bị trừ.
            </div>

            {billId && (
              <div className={styles.cancelBadge}>
                Mã đơn hàng đã hủy: #{billId}
              </div>
            )}

            <div className={styles.actionButtons}>
              <Button
                className={styles.btnPrimary}
                type="primary"
                icon={<RotateCcw size={18} />}
                onClick={() => navigate("/cart")}
              >
                Quay lại giỏ hàng & Thử lại
              </Button>

              <Button
                className={styles.btnOutline}
                icon={<ShoppingBag size={18} />}
                onClick={() => navigate("/products")}
              >
                Xem sản phẩm khác
              </Button>

              <Button
                className={styles.btnOutline}
                icon={<Home size={18} />}
                onClick={() => navigate("/")}
              >
                Về trang chủ
              </Button>
            </div>

            <div style={{ marginTop: 60, paddingTop: 40, borderTop: "1px solid #f0f0f0" }}>
              <Space size={40}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "var(--primary-color)", marginBottom: 8 }}><AlertCircle size={24} /></div>
                  <Text strong style={{ fontSize: 12 }}>Hỗ trợ 24/7</Text>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "var(--primary-color)", marginBottom: 8 }}><ShoppingBag size={24} /></div>
                  <Text strong style={{ fontSize: 12 }}>An tâm mua sắm</Text>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "var(--primary-color)", marginBottom: 8 }}><Check size={24} /></div>
                  <Text strong style={{ fontSize: 12 }}>Bảo mật thanh toán</Text>
                </div>
              </Space>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
