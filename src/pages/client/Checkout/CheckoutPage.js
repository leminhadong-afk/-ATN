import React, { useEffect, useState } from "react";
import { Button, Col, Divider, Form, Input, Radio, Row, Tag, Typography, message, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { MapPin, Phone, User, CreditCard, Truck, ShoppingBag, Receipt, ArrowRight } from "lucide-react";
import Header from "../HomePage/Header";
import Footer from "../HomePage/Footer";
import { CartApi } from "../../../api/client/cart/CartApi";
import { ClientVnPayApi } from "../../../api/client/vnpay/ClientVnPayApi";
import { ClientPaymentApi } from "../../../api/client/payment/ClientPaymentApi";
import { UserApi } from "../../../api/client/user/UserApi";
import styles from "./CheckoutPage.module.css";

const { Text, Title } = Typography;

const money = (v) => (v || 0).toLocaleString() + " đ";

const CheckoutPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [loadingUserInfo, setLoadingUserInfo] = useState(false);

  const loadCart = async () => {
    try {
      const { data } = await CartApi.list();
      const mapped = (data || []).map(it => ({
        id: it.cartDetailId || it.productDetailId,
        productDetailId: it.productDetailId,
        name: it.productName,
        price: it.price,
        qty: it.quantity,
        image: it.urlImg || it.image || "",
      }));
      setItems(mapped);
    } catch (_) {
      setItems([]);
    }
  };

  const loadUserInfo = async () => {
    setLoadingUserInfo(true);
    try {
      const response = await UserApi.getInfo();
      const data = response?.data || response;

      if (data) {
        form.setFieldsValue({
          fullName: data.name || "",
          phone: data.phoneNumber || "",
          address: data.address || "",
        });
      }
    } catch (error) {
      console.error("Error loading user info:", error);
    } finally {
      setLoadingUserInfo(false);
    }
  };

  useEffect(() => {
    loadCart();
    loadUserInfo();
    window.scrollTo(0, 0);
  }, []);

  const subtotal = items.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 1), 0);
  const shippingFee = 34000;
  const discount = 0;
  const total = subtotal + shippingFee - discount;

  const onFinish = async (values) => {
    if (items.length === 0) {
      message.error("Giỏ hàng trống");
      return;
    }

    setLoading(true);
    try {
      const itemList = items.map(it => ({
        productDetailId: it.productDetailId,
        quantity: it.qty,
        price: it.price
      }));
      
      const paymentPayload = {
        ...values,
        paymentMethod,
        amount: total,
        shippingFee,
        discount,
        items: itemList
      };
      
      const paymentRes = await ClientPaymentApi.createPayment(paymentPayload);
      const { billId, amount } = paymentRes.data || {};

      if (paymentMethod === "now") {
        const vnpayRes = await ClientVnPayApi.createPayment({ billId, amount });
        message.success("Chuyển hướng đến cổng thanh toán...");
        if (vnpayRes.data && vnpayRes.data.payUrl) {
          window.location.href = vnpayRes.data.payUrl;
        }
        setLoading(false);
        return;
      }

      message.success("Đặt hàng thành công!");
      setTimeout(() => {
        navigate(`/payment-success?billId=${billId}`);
      }, 1000);
    } catch (error) {
      message.error("Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.container}>
        <Title level={1} className={styles.pageTitle}>Thanh toán</Title>

        <Form form={form} onFinish={onFinish} layout="vertical" requiredMark={false}>
          <Row gutter={40}>
            {/* Left Column: Delivery Information & Payment */}
            <Col xs={24} lg={15}>
              {/* Delivery Information Section */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <Title level={4} className={styles.cardTitle}>
                    <MapPin size={22} color="var(--primary-color)" />
                    Thông tin giao hàng
                  </Title>
                </div>
                
                <div className={styles.formSection}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item 
                        name="fullName" 
                        label="Họ và tên"
                        rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                      >
                        <Input prefix={<User size={18} color="#9ca3af" />} placeholder="Họ và tên người nhận" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item 
                        name="phone" 
                        label="Số điện thoại"
                        rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                      >
                        <Input prefix={<Phone size={18} color="#9ca3af" />} placeholder="Số điện thoại liên hệ" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item 
                        name="province" 
                        label="Tỉnh/Thành phố"
                        rules={[{ required: true, message: "Vui lòng nhập tỉnh/thành" }]}
                      >
                        <Input placeholder="Chọn tỉnh/thành" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item 
                        name="ward" 
                        label="Quận/Huyện"
                        rules={[{ required: true, message: "Vui lòng nhập quận/huyện" }]}
                      >
                        <Input placeholder="Chọn quận/huyện" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item 
                    name="address" 
                    label="Địa chỉ cụ thể"
                    rules={[{ required: true, message: "Vui lòng nhập địa chỉ cụ thể" }]}
                  >
                    <Input placeholder="Số nhà, tên đường..." />
                  </Form.Item>

                  <Form.Item name="notes" label="Ghi chú đơn hàng">
                    <Input.TextArea rows={3} placeholder="Yêu cầu đặc biệt cho đơn hàng (không bắt buộc)" />
                  </Form.Item>
                </div>
              </div>

              {/* Payment Method Section */}
              <div className={styles.card}>
                <Title level={4} className={styles.cardTitle}>
                  <CreditCard size={22} color="var(--primary-color)" />
                  Phương thức thanh toán
                </Title>
                
                <div className={styles.formSection}>
                  <Radio.Group 
                    value={paymentMethod} 
                    onChange={e => setPaymentMethod(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <div className={styles.paymentOption}>
                      <Radio value="cash" className={styles.radioCustom}>
                        <div className={styles.paymentContent}>
                          <Text strong>Thanh toán khi nhận hàng (COD)</Text>
                          <Text type="secondary" style={{ fontSize: 13 }}>Giao hàng và thu tiền tận nơi</Text>
                        </div>
                      </Radio>
                    </div>
                    <div className={styles.paymentOption}>
                      <Radio value="now" className={styles.radioCustom}>
                        <div className={styles.paymentContent}>
                          <Text strong>Thanh toán qua cổng VNPay</Text>
                          <Text type="secondary" style={{ fontSize: 13 }}>Thanh toán nhanh chóng bằng thẻ ATM/Visa/Mastercard</Text>
                        </div>
                      </Radio>
                    </div>
                  </Radio.Group>
                </div>
              </div>
            </Col>

            {/* Right Column: Order Summary */}
            <Col xs={24} lg={9}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryHeader}>
                  <ShoppingBag size={20} style={{ marginBottom: 4 }} />
                  <div style={{ marginTop: 4 }}>TÓM TẮT ĐƠN HÀNG</div>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                  {items.map((item) => (
                    <div key={item.id} className={styles.summaryItem}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} className={styles.summaryImage} />
                      ) : (
                        <div className={styles.summaryImage} style={{ background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShoppingBag size={24} color="#ccc" />
                        </div>
                      )}
                      <div className={styles.itemInfo}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <Text strong style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{item.name}</Text>
                          <Text strong>x{item.qty}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
                          <Tag color="gold" style={{ borderRadius: '4px', margin: 0, fontSize: '10px' }}>PREMIUM</Tag>
                          <Text className={styles.itemPrice}>{money(item.price)}</Text>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.costBreakdown}>
                  <div className={styles.costRow}>
                    <Text>Tổng tiền hàng</Text>
                    <b>{money(subtotal)}</b>
                  </div>
                  <div className={styles.costRow}>
                    <Space size={4}>
                      <Truck size={14} />
                      <Text>Phí vận chuyển</Text>
                    </Space>
                    <b>{money(shippingFee)}</b>
                  </div>
                  {discount > 0 && (
                    <div className={styles.costRow}>
                      <Text>Giảm giá</Text>
                      <Text type="danger">-{money(discount)}</Text>
                    </div>
                  )}
                </div>

                <div className={styles.totalSection}>
                  <Text className={styles.totalLabel}>TỔNG CỘNG</Text>
                  <Text className={styles.totalAmount}>{money(total)}</Text>
                </div>

                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={loading}
                  block
                  className={styles.completeButton}
                  icon={<ArrowRight size={20} />}
                  iconPosition="end"
                >
                  XÁC NHẬN ĐẶT HÀNG
                </Button>
                
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Bằng cách nhấn xác nhận, bạn đồng ý với các Điều khoản & Chính sách của chúng tôi.
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;


