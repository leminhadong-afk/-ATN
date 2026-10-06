import {
  Button,
  Col,
  DatePicker,
  Divider,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Tag,
  Typography,
  Checkbox,
  Progress,
  Empty,
  message,
  Modal,
} from "antd";
import React, { useEffect, useState } from "react";
import Header from "../HomePage/Header";
import Footer from "../HomePage/Footer";
import pdStyles from "../Product/ProductDetailPage.module.css";
import BestsellerSlider from "../Common/BestsellerSlider";
import LoginModal from "../../homePage/LoginModal";
import {
  ShoppingCartOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styles from "./CartPage.module.css";
import { CartApi } from "../../../api/client/cart/CartApi";
import { isTokenExpired } from "../../../util/common/utils";

const { Text, Title } = Typography;
const { TextArea } = Input;

const money = (v) => (v || 0).toLocaleString() + " đ";

const CartPage = () => {
  const [items, setItems] = useState([]);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const navigate = useNavigate();
  const suggestRef = React.useRef(null);

  // Suggestion list (bestsellers) – mimic HomePage
  const bestsellerProducts = [
    {
      id: 5,
      name: "NHẪN KIM CƯƠNG LUXURY",
      price: 15000000,
      originalPrice: 18000000,
      image:
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      brand: "ROYAL JEWELRY",
      isBestseller: true,
      discount: 15,
      sold: 120,
    },
    {
      id: 6,
      name: "DÂY CHUYỀN VÀNG TRẮNG",
      price: 8500000,
      originalPrice: 10000000,
      image:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      brand: "ROYAL JEWELRY",
      isBestseller: true,
      discount: 15,
      sold: 85,
    },
    {
      id: 7,
      name: "BÔNG TAI NGỌC TRAI",
      price: 4500000,
      originalPrice: 5500000,
      image:
        "https://images.unsplash.com/photo-1535633302703-b0703af08f84?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      brand: "ROYAL JEWELRY",
      isBestseller: true,
      discount: 18,
      sold: 65,
    },
  ];

  const loadCart = async () => {
    try {
      const { data } = await CartApi.list();
      // Map backend response to UI model
      const mapped = (data || []).map((it) => ({
        id: it.cartDetailId, // always use cartDetailId as unique id
        cartDetailId: it.cartDetailId,
        productDetailId: it.productDetailId,
        productId: it.productId, // productId for navigation to product detail page
        name: it.productName,
        price: it.price,
        qty: it.quantity,
        image: it.urlImg || it.image || "",
        maxQuantity: it.maxQuantity ?? 99, // default maxQuantity if not provided
        color: it.color,
        size: it.size,
      }));
      setItems(mapped);
    } catch (_) {
      setItems([]);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const isLoggedIn = token && !isTokenExpired(token);

    if (!isLoggedIn) {
      Modal.confirm({
        title: "Yêu cầu đăng nhập",
        content: "Bạn cần đăng nhập để xem giỏ hàng và mua hàng.",
        okText: "Đăng nhập",
        cancelText: "Về trang chủ",
        onOk: () => {
          setLoginModalVisible(true);
        },
        onCancel: () => {
          navigate("/");
        },
      });
      return;
    }

    loadCart();
  }, [navigate]);

  // Listen to global events: refresh when product added elsewhere
  useEffect(() => {
    const onRefresh = () => {
      loadCart();
    };
    window.addEventListener("cart:refresh", onRefresh);
    window.addEventListener("cart:add", onRefresh);
    return () => {
      window.removeEventListener("cart:refresh", onRefresh);
      window.removeEventListener("cart:add", onRefresh);
    };
  }, []);

  const onChangeQty = async (id, qty) => {
    const item = items.find((i) => i.productDetailId === id);
    if (!item) return;
    if (qty > item.maxQuantity) {
      message.warning(
        `Số lượng tối đa cho sản phẩm này là ${item.maxQuantity}`
      );
      qty = item.maxQuantity;
    }
    try {
      await CartApi.update({
        productDetailId: id,
        quantity: qty,
      });
      await loadCart();
      window.dispatchEvent(new CustomEvent("cart:refresh"));
    } catch (_) { }
  };
  const onRemove = async (id) => {
    try {
      await CartApi.remove(id);
      await loadCart();
      window.dispatchEvent(new CustomEvent("cart:refresh"));
    } catch (_) { }
  };

  const subtotal = items.reduce(
    (sum, it) => sum + (it.price || 0) * (it.qty || 1),
    0
  );
  const shipFreeThreshold = 500000;
  const freePercent = Math.min(
    100,
    Math.round((subtotal / shipFreeThreshold) * 100)
  );

  const handleAddToCart = (product) => {
    // let header update and persist
    window.dispatchEvent(
      new CustomEvent("cart:add", {
        detail: {
          id: product.id,
          name: product.name,
          price: Math.round(product.price || 0),
          image: product.image,
          qty: 1,
        },
      })
    );

    // fly animation from suggestion image
    const cartEl = document.getElementById("header-cart-anchor");
    if (!cartEl) return;
    const imgEl = document.querySelector(
      `[data-product-img="cart-suggest-${product.id}"]`
    );
    if (!imgEl) return;
    const imgRect = imgEl.getBoundingClientRect();
    const cartRect = cartEl.getBoundingClientRect();
    const flyImg = imgEl.cloneNode(true);
    flyImg.style.position = "fixed";
    flyImg.style.left = imgRect.left + "px";
    flyImg.style.top = imgRect.top + "px";
    flyImg.style.width = imgRect.width + "px";
    flyImg.style.height = imgRect.height + "px";
    flyImg.style.borderRadius = "8px";
    flyImg.style.zIndex = 2000;
    flyImg.style.transition =
      "transform 0.8s ease, opacity 0.8s ease, left 0.8s ease, top 0.8s ease, width 0.8s ease, height 0.8s ease";
    document.body.appendChild(flyImg);
    requestAnimationFrame(() => {
      flyImg.style.left = cartRect.left + "px";
      flyImg.style.top = cartRect.top + "px";
      flyImg.style.width = "24px";
      flyImg.style.height = "24px";
      flyImg.style.opacity = "0.2";
      flyImg.style.transform = "translate(0, -20px) scale(0.5)";
    });
    setTimeout(() => {
      try {
        document.body.removeChild(flyImg);
      } catch (_) { }
    }, 850);
  };

  const scrollSuggest = (dir) => {
    if (!suggestRef.current) return;
    const amount = 300;
    suggestRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className={styles.layout}>
      <Header />

      <div className={styles.container}>
        <Title level={1} style={{ marginBottom: 40, fontFamily: 'var(--font-header)', textAlign: 'center' }}>
          Giỏ hàng của bạn
        </Title>

        {items.length === 0 ? (
          <Empty description="Giỏ hàng trống" />
        ) : (
          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <div className={styles.itemsCard}>
                {/* <div className={styles.voucherBar}>
                  <Tag color="orange" style={{ margin: 0 }}>EGAFREESHIP</Tag>
                  <Text style={{ flex: 1 }}>Áp dụng mã freeship cho đơn hàng của bạn</Text>
                  <Button size="small">Sao chép</Button>
                </div> */}

                <div className={styles.cartItemsHeader}>
                  <div style={{ textAlign: 'center' }}>Sản phẩm</div>
                  <div></div>
                  <div style={{ textAlign: 'right' }}>Giá</div>
                  <div style={{ textAlign: 'center' }}>Số lượng</div>
                  <div style={{ textAlign: 'right' }}>Tổng cộng</div>
                  <div></div>
                </div>
                {items.map((item) => (
                  <div key={item.id} className={styles.itemRow}>
                    <div className={styles.imgCol}>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className={styles.itemImage}
                          onClick={() =>
                            navigate(`/products/${item.productId || item.id}`)
                          }
                        />
                      ) : (
                        <div className={styles.itemPlaceholder} />
                      )}
                    </div>
                    
                    <div className={styles.itemInfo}>
                      <Text
                        className={styles.itemName}
                        onClick={() =>
                          navigate(`/products/${item.productId || item.id}`)
                        }
                      >
                        {item.name || `Sản phẩm #${item.id}`}
                      </Text>
                      <div className={styles.itemMeta}>
                        {item.color && <span>Màu: {item.color}</span>}
                        {item.size && <span>Size: {item.size}</span>}
                        {!item.color && !item.size && <span>Mặc định</span>}
                      </div>
                    </div>

                    <div className={styles.priceCol}>
                      <Text>{money(item.price)}</Text>
                    </div>

                    <div className={styles.qtyCol}>
                      <div className={styles.qtyWrapper}>
                        <Button
                          className={styles.qtyBtn}
                          size="small"
                          onClick={() =>
                            onChangeQty(
                              item.productDetailId,
                              Math.max(1, (item.qty || 1) - 1)
                            )
                          }
                          disabled={item.qty <= 1}
                        >
                          -
                        </Button>
                        <InputNumber
                          min={1}
                          max={item.maxQuantity}
                          value={item.qty || 1}
                          onChange={(v) =>
                            onChangeQty(item.productDetailId, v || 1)
                          }
                          bordered={false}
                          style={{ width: 45, textAlign: 'center' }}
                          controls={false}
                        />
                        <Button
                          className={styles.qtyBtn}
                          size="small"
                          onClick={() =>
                            onChangeQty(
                              item.productDetailId,
                              Math.min(item.maxQuantity, (item.qty || 1) + 1)
                            )
                          }
                          disabled={item.qty >= item.maxQuantity}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <div className={styles.totalCol}>
                      <Text>{money((item.price || 0) * (item.qty || 1))}</Text>
                    </div>

                    <div className={styles.actionCol}>
                      <Button
                        type="text"
                        className={styles.removeBtn}
                        onClick={() => onRemove(item.id)}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                ))}

                {/* <div style={{ marginTop: 12 }}>
                  <Text strong>Ghi chú đơn hàng</Text>
                  <TextArea rows={3} placeholder="Nhập ghi chú cho đơn hàng..." style={{ marginTop: 8 }} />
                </div> */}
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div className={styles.summaryCard}>
                <Title level={3} className={styles.summaryTitle}>Tổng đơn hàng</Title>
                
                <div className={styles.summaryRow}>
                  <Text>Tạm tính</Text>
                  <Text>{money(subtotal)}</Text>
                </div>
                <div className={styles.summaryRow}>
                  <Text>Giảm giá</Text>
                  <Text>- 0 đ</Text>
                </div>

                <div className={styles.totalRow}>
                  <Text className={styles.totalLabel}>TỔNG CỘNG</Text>
                  <Text className={styles.totalAmount}>
                    {money(subtotal)}
                  </Text>
                </div>
                
                <Space direction="vertical" style={{ width: "100%", gap: 16, marginTop: 40 }}>
                  <Button
                    type="primary"
                    block
                    size="large"
                    className={styles.checkoutButton}
                    onClick={() => navigate("/checkout")}
                    disabled={!items.length}
                  >
                    Thanh toán ngay
                  </Button>
                  <Button
                    block
                    size="large"
                    className={styles.continueButton}
                    onClick={() => window.history.back()}
                  >
                    Tiếp tục mua hàng
                  </Button>
                </Space>
              </div>
            </Col>
          </Row>
        )}
      </div>

      {/* Suggestion within container */}
      {/* <div className={styles.container} style={{ marginTop: 24 }}>
        <BestsellerSlider
          title="Có thể bạn thích"
          products={bestsellerProducts}
          onCardClick={(p) => navigate(`/products/${p.id}`)}
          onAdd={(p) => handleAddToCart(p)}
          dataImgPrefix="cart-suggest"
        />
      </div> */}

      <Footer />

      {/* Login Modal */}
      <LoginModal
        visible={loginModalVisible}
        onClose={() => setLoginModalVisible(false)}
        onSwitchToRegister={() => {
          setLoginModalVisible(false);
          // Could add register modal here if needed
        }}
        onLoginSuccess={() => {
          setLoginModalVisible(false);
          // Reload cart after successful login
          loadCart();
        }}
      />
    </div>
  );
};

export default CartPage;
