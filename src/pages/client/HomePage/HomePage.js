import { Button, Card, Col, Layout, Row, Space, Typography, Modal, message } from "antd";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCartOutlined,
  ArrowUpOutlined as UpOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import styles from "./HomePage.module.css";
import Header from "./Header";
import Footer from "./Footer";
import { HomeApi } from "../../../api/client/home/HomeApi";
import { ProductDetailManagementApi } from "../../../api/admin/productDetailManagement/productDetailManagementApi";
import { CartApi } from "../../../api/client/cart/CartApi";
import { isTokenExpired } from "../../../util/common/utils";
import LoginModal from "../../homePage/LoginModal";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeHero, setActiveHero] = useState(0);
  const newProductsRef = useRef(null);
  const bestsellerProductsRef = useRef(null);

  const [newProducts, setNewProducts] = useState([]);
  const [bestsellerProducts, setBestsellerProducts] = useState([]);
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  // Check token validity on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && isTokenExpired(token)) {
      localStorage.clear();
      setLoginModalVisible(true);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowScrollTop(scrollPosition > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Always start at top when visiting HomePage
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Fetch new products (last 30 days)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await HomeApi.getNewArrivals({ page: 0, size: 12 });
        const mapped = (data?.content || []).map((item) => ({
          id: item.productId,
          name: item.productName || item.productCode || `Product ${item.productId}`,
          productCode: item.productCode || "",
          price: (() => {
            if (!item.price) return 0;
            const first = String(item.price).split(',')[0]?.trim();
            const num = Number(first);
            return isNaN(num) ? 0 : num;
          })(),
          image: item.urlImg || "https://via.placeholder.com/300",
          brand: item.brand || "",
          discount: 0,
        }));
        setNewProducts(mapped);
      } catch (_) { }
    })();
  }, []);

  // Fetch bestsellers (>5 sold)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await HomeApi.getBestSellers({ minSold: 5 });
        const mapped = (data || []).map((item) => ({
          id: item.productId,
          name: item.productName,
          productCode: item.productCode || "",
          price: (() => {
            if (!item.price) return 0;
            const first = String(item.price).split(',')[0]?.trim();
            const num = Number(first);
            return isNaN(num) ? 0 : num;
          })(),
          image: item.urlImg || "https://via.placeholder.com/300",
          brand: '',
          isBestseller: true,
          discount: 0,
          sold: item.totalSoldQuantity || 0,
        }));
        setBestsellerProducts(mapped);
      } catch (_) { }
    })();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleAddToCart = async (productId) => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const isLoggedIn = token && !isTokenExpired(token);

    if (!isLoggedIn) {
      Modal.confirm({
        title: "Yêu cầu đăng nhập",
        content: "Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.",
        okText: "Đăng nhập",
        cancelText: "Hủy",
        onOk: () => {
          setLoginModalVisible(true);
        },
      });
      return;
    }

    const product = [...newProducts, ...bestsellerProducts].find(p => p.id === productId);
    try {
      const { data } = await ProductDetailManagementApi.getProductDetails({ id: productId, page: 0, size: 1 });
      const line = data?.content?.[0];
      if (!line || (!line.productDetailId && !line.id)) {
        message.error("Không tìm thấy thông tin sản phẩm!");
        return;
      }

      await CartApi.add({ productDetailId: line.productDetailId || line.id, quantity: 1 });
      message.success("Đã thêm sản phẩm vào giỏ hàng!");
      window.dispatchEvent(new CustomEvent('cart:refresh'));
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      message.error(error.response?.data || "Không thể thêm vào giỏ (có thể đã vượt quá số lượng trong kho)!");
      return;
    }

    // Fly-to-cart animation
    const cartEl = document.getElementById('header-cart-anchor');
    if (!cartEl) return;
    const imgEl = document.querySelector(`[data-product-img="img-${productId}"]`);
    if (!imgEl) return;
    const imgRect = imgEl.getBoundingClientRect();
    const cartRect = cartEl.getBoundingClientRect();
    const flyImg = imgEl.cloneNode(true);
    flyImg.style.position = 'fixed';
    flyImg.style.left = imgRect.left + 'px';
    flyImg.style.top = imgRect.top + 'px';
    flyImg.style.width = imgRect.width + 'px';
    flyImg.style.height = imgRect.height + 'px';
    flyImg.style.borderRadius = '8px';
    flyImg.style.zIndex = 2000;
    flyImg.style.transition = 'transform 0.8s ease, opacity 0.8s ease, left 0.8s ease, top 0.8s ease, width 0.8s ease, height 0.8s ease';
    document.body.appendChild(flyImg);
    requestAnimationFrame(() => {
      flyImg.style.left = cartRect.left + 'px';
      flyImg.style.top = cartRect.top + 'px';
      flyImg.style.width = '24px';
      flyImg.style.height = '24px';
      flyImg.style.opacity = '0.2';
      flyImg.style.transform = 'translate(0, -20px) scale(0.5)';
    });
    setTimeout(() => { try { document.body.removeChild(flyImg); } catch (_) { } }, 850);
  };

  const scrollProducts = (direction, ref) => {
    if (ref.current) {
      const scrollAmount = 300; // Scroll amount in pixels
      if (direction === 'left') {
        ref.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const handleBannerClick = (bannerType) => {
    switch (bannerType) {
      case 'premium':
        // Navigate to premium products page with filter
        navigate('/products?category=premium');
        break;
      case 'limited':
        // Navigate to limited edition products
        navigate('/products?category=limited-edition');
        break;
      case 'classic':
        // Navigate to classic style products
        navigate('/products?category=classic');
        break;
      default:
        // Default to all products
        navigate('/products');
    }
  };

  const heroSlides = [
    {
      title: "Vua Của Các Loài Kim Cương",
      subtitle:
        "Từ năm 1932, ROYAL JEWELRY đã thiết lập tiêu chuẩn tối thượng cho trang sức kim cương và những kiệt tác xa xỉ đỉnh cao.",
      video:
        "https://assets.mixkit.co/videos/preview/mixkit-hand-holding-a-gold-ring-with-a-diamond-41525-large.mp4",
      image:
        "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80",
      cta: "Khám Phá Trang Sức Cao Cấp",
      onClick: () => navigate("/products?category=high-jewelry"),
    },
    {
      title: "Bộ Sưu Tập Biểu Tượng Cluster",
      subtitle:
        "Thiết kế biểu tượng kinh điển tôn vinh vẻ đẹp rực rỡ tự nhiên và ánh lửa quang của từng viên kim cương quý hiếm.",
      video:
        "https://assets.mixkit.co/videos/preview/mixkit-close-up-of-diamonds-on-a-display-41523-large.mp4",
      image:
        "https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80",
      cta: "Khám Phá Bộ Sưu Tập",
      onClick: () => navigate("/products?category=cluster"),
    },
    {
      title: "Trang Sức Cưới & Đính Hôn",
      subtitle:
        "Khởi đầu hành trình vĩnh cửu với nhẫn đính hôn kim cương và trang sức ngày cưới được chế tác thủ công tinh xảo.",
      video:
        "https://assets.mixkit.co/videos/preview/mixkit-jeweler-inspecting-a-diamond-ring-41526-large.mp4",
      image:
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80",
      cta: "Khám Phá Trang Sức Cưới",
      onClick: () => navigate("/products?category=bridal"),
    },
  ];

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveHero((prev) => (prev + 1) % heroSlides.length);
    }, 9000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout className={styles.layout}>
      {/* Header Component */}
      <Header />

      {/* Hero Section */}
      <Content id="hero-section" className={styles.heroSection}>
        <div className={styles.heroMedia} role="region" aria-label="Hero Showcase">
          {/* Background Video / Image Seamless Loop */}
          {heroSlides[activeHero].video ? (
            <video
              key={heroSlides[activeHero].video}
              className={styles.heroBgVideo}
              autoPlay
              loop
              muted
              playsInline
              poster={heroSlides[activeHero].image}
            >
              <source src={heroSlides[activeHero].video} type="video/mp4" />
            </video>
          ) : (
            <div
              className={styles.heroBgImg}
              style={{ backgroundImage: `url(${heroSlides[activeHero].image})` }}
            />
          )}

          <div className={styles.heroOverlay} />
          <div className={styles.heroInner}>
            <Text className={styles.heroKicker}>ROYAL JEWELRY • HIGH JEWELRY</Text>
            <Title className={styles.heroTitle}>{heroSlides[activeHero].title}</Title>
            <Paragraph className={styles.heroSubtitle}>
              {heroSlides[activeHero].subtitle}
            </Paragraph>
            <div className={styles.heroActions}>
              <Button
                type="primary"
                size="large"
                className={styles.heroPrimaryCta}
                onClick={heroSlides[activeHero].onClick}
              >
                {heroSlides[activeHero].cta}
              </Button>
              <Button
                size="large"
                className={styles.heroSecondaryCta}
                onClick={() => navigate("/about")}
              >
                Tìm Hiểu Thêm
              </Button>
            </div>

            <div className={styles.heroDots} aria-label="Hero slides">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.heroDot} ${idx === activeHero ? styles.heroDotActive : ""}`}
                  onClick={() => setActiveHero(idx)}
                  aria-label={`Chuyển đến slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </Content>

      {/* Introduction Banner Section */}
      <Content className={styles.introBannerSection}>
        <div className={styles.introBannerContent}>
          <div className={styles.sectionHeader}>
            <Title level={2} className={styles.sectionTitle}>
              Featured
            </Title>
            <Text className={styles.sectionSubtitle}>
              Những điểm nhấn nổi bật theo phong cách editorial tối giản.
            </Text>
          </div>

          <Row gutter={[24, 24]} className={styles.bannerGrid}>
            <Col xs={24} md={8}>
              <button
                type="button"
                className={styles.editorialCard}
                onClick={() => handleBannerClick("premium")}
              >
                <div
                  className={styles.editorialMedia}
                  style={{
                    backgroundImage:
                      'url("https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80")',
                  }}
                />
                <div className={styles.editorialBody}>
                  <Text className={styles.editorialKicker}>Jewelry</Text>
                  <Title level={4} className={styles.editorialTitle}>
                    Diamond Collection
                  </Title>
                  <Text className={styles.editorialCta}>Shop</Text>
                </div>
              </button>
            </Col>
            <Col xs={24} md={8}>
              <button
                type="button"
                className={styles.editorialCard}
                onClick={() => handleBannerClick("limited")}
              >
                <div
                  className={styles.editorialMedia}
                  style={{
                    backgroundImage:
                      'url("https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80")',
                  }}
                />
                <div className={styles.editorialBody}>
                  <Text className={styles.editorialKicker}>High Jewelry</Text>
                  <Title level={4} className={styles.editorialTitle}>
                    Pure Gold 24K
                  </Title>
                  <Text className={styles.editorialCta}>Discover</Text>
                </div>
              </button>
            </Col>
            <Col xs={24} md={8}>
              <button
                type="button"
                className={styles.editorialCard}
                onClick={() => handleBannerClick("classic")}
              >
                <div
                  className={styles.editorialMedia}
                  style={{
                    backgroundImage:
                      'url("https://images.unsplash.com/photo-1599643477877-530eb83abc8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80")',
                  }}
                />
                <div className={styles.editorialBody}>
                  <Text className={styles.editorialKicker}>Iconic</Text>
                  <Title level={4} className={styles.editorialTitle}>
                    Pearls & Grace
                  </Title>
                  <Text className={styles.editorialCta}>Explore</Text>
                </div>
              </button>
            </Col>
          </Row>
        </div>
      </Content>


      {/* New Products Section */}
      <Content className={styles.newProductsSection}>
        <div className={styles.sectionHeader}>
          <Title level={2} className={styles.sectionTitle}>
            New Arrivals
          </Title>
          <Text className={styles.sectionSubtitle}>
            Những thiết kế mới nhất vừa ra mắt.
          </Text>
        </div>

        <div className={styles.horizontalScrollContainer}>
          <Button
            className={styles.scrollButton}
            icon={<LeftOutlined />}
            onClick={() => scrollProducts('left', newProductsRef)}
          />

          <div className={styles.horizontalScrollWrapper} ref={newProductsRef}>
            <div className={styles.horizontalScrollContent}>
              {/* First set of products */}
              {newProducts.map((product) => (
                <div key={product.id} className={styles.horizontalProductCard}>
                  <Card className={styles.productCard} hoverable onClick={() => navigate(`/products/${product.id}`)}>
                    <div className={styles.productImageContainer}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className={styles.productImage}
                        data-product-img={`img-${product.id}`}
                      />
                      <div className={styles.productBadges}>
                        <div className={styles.newBadge}>New</div>
                      </div>
                      <Button
                        type="default"
                        shape="circle"
                        icon={<ShoppingCartOutlined />}
                        className={`${styles.addToCartButton} ${styles.addToCartFixed}`}
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product.id); }}
                      />
                    </div>
                    <div className={styles.productInfo}>
                      <Text className={styles.productBrand}>{product.brand || "ROYAL JEWELRY"}</Text>
                      {product.productCode && (
                        <Text className={styles.productCode} type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                          Mã: {product.productCode}
                        </Text>
                      )}
                      <Text className={styles.productName}>{product.name}</Text>
                      <div className={styles.productPriceContainer}>
                        <Text className={styles.productPrice}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</Text>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {newProducts.map((product) => (
                <div key={`duplicate-${product.id}`} className={styles.horizontalProductCard}>
                  <Card className={styles.productCard} hoverable onClick={() => navigate(`/products/${product.id}`)}>
                    <div className={styles.productImageContainer}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className={styles.productImage}
                        data-product-img={`img-${product.id}`}
                      />
                      <div className={styles.productBadges}>
                        <div className={styles.newBadge}>New</div>
                      </div>
                      <Button
                        type="default"
                        shape="circle"
                        icon={<ShoppingCartOutlined />}
                        className={`${styles.addToCartButton} ${styles.addToCartFixed}`}
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product.id); }}
                      />
                    </div>
                    <div className={styles.productInfo}>
                      <Text className={styles.productBrand}>{product.brand || "ROYAL JEWELRY"}</Text>
                      {product.productCode && (
                        <Text className={styles.productCode} type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                          Mã: {product.productCode}
                        </Text>
                      )}
                      <Text className={styles.productName}>{product.name}</Text>
                      <div className={styles.productPriceContainer}>
                        <Text className={styles.productPrice}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</Text>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <Button
            className={styles.scrollButton}
            icon={<RightOutlined />}
            onClick={() => scrollProducts('right', newProductsRef)}
          />
        </div>

        {/* <div className={styles.sectionFooter}>
          <Button 
            type="primary" 
            size="large" 
            className={styles.viewAllButton}
            onClick={() => navigate('/products')}
          >
            XEM TẤT CẢ SẢN PHẨM MỚI
          </Button>
        </div> */}
      </Content>

      {/* Bestseller Products Section */}
      <Content className={styles.bestsellerSection}>
        <div className={styles.sectionHeader}>
          <Title level={2} className={styles.sectionTitle}>
            Bestsellers
          </Title>
          <Text className={styles.sectionSubtitle}>
            Những thiết kế được yêu thích nhất hiện tại.
          </Text>
        </div>

        <div className={styles.horizontalScrollContainer}>
          <Button
            className={styles.scrollButton}
            icon={<LeftOutlined />}
            onClick={() => scrollProducts('left', bestsellerProductsRef)}
          />

          <div className={styles.horizontalScrollWrapper} ref={bestsellerProductsRef}>
            <div className={styles.horizontalScrollContent}>
              {/* First set of products */}
              {bestsellerProducts.map((product) => (
                <div key={product.id} className={styles.horizontalProductCard}>
                  <Card className={styles.productCard} hoverable onClick={() => navigate(`/products/${product.id}`)}>
                    <div className={styles.productImageContainer}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className={styles.productImage}
                        data-product-img={`img-${product.id}`}
                      />
                      <div className={styles.productBadges}>
                        <div className={styles.bestsellerBadge}>Bestseller</div>
                      </div>
                      <Button
                        type="default"
                        shape="circle"
                        icon={<ShoppingCartOutlined />}
                        className={`${styles.addToCartButton} ${styles.addToCartFixed}`}
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product.id); }}
                      />
                    </div>
                    <div className={styles.productInfo}>
                      <Text className={styles.productBrand}>{product.brand || "ROYAL JEWELRY"}</Text>
                      {product.productCode && (
                        <Text className={styles.productCode} type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                          Mã: {product.productCode}
                        </Text>
                      )}
                      <Text className={styles.productName}>{product.name}</Text>
                      <div className={styles.productPriceContainer}>
                        <Text className={styles.productPrice}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</Text>
                      </div>
                      <Text className={styles.soldCount}>Đã bán: {product.sold}</Text>
                    </div>
                  </Card>
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {bestsellerProducts.map((product) => (
                <div key={`duplicate-${product.id}`} className={styles.horizontalProductCard}>
                  <Card className={styles.productCard} hoverable onClick={() => navigate(`/products/${product.id}`)}>
                    <div className={styles.productImageContainer}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className={styles.productImage}
                        data-product-img={`img-${product.id}`}
                      />
                      <div className={styles.productBadges}>
                        <div className={styles.bestsellerBadge}>Bestseller</div>
                      </div>
                      <Button
                        type="default"
                        shape="circle"
                        icon={<ShoppingCartOutlined />}
                        className={`${styles.addToCartButton} ${styles.addToCartFixed}`}
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product.id); }}
                      />
                    </div>
                    <div className={styles.productInfo}>
                      <Text className={styles.productBrand}>{product.brand || "ROYAL JEWELRY"}</Text>
                      {product.productCode && (
                        <Text className={styles.productCode} type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                          Mã: {product.productCode}
                        </Text>
                      )}
                      <Text className={styles.productName}>{product.name}</Text>
                      <div className={styles.productPriceContainer}>
                        <Text className={styles.productPrice}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</Text>
                      </div>
                      <Text className={styles.soldCount}>Đã bán: {product.sold}</Text>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <Button
            className={styles.scrollButton}
            icon={<RightOutlined />}
            onClick={() => scrollProducts('right', bestsellerProductsRef)}
          />
        </div>

        {/* <div className={styles.sectionFooter}>
          <Button 
            type="primary" 
            size="large" 
            className={styles.viewAllButton}
            onClick={() => navigate('/products')}
          >
            XEM TẤT CẢ SẢN PHẨM BÁN CHẠY
          </Button>
        </div> */}
      </Content>

      {/* Craftsmanship & Storytelling Section (Harry Winston Heritage) */}
      <Content className={styles.craftsmanshipSection}>
        <Row align="middle" gutter={[48, 48]} className={styles.craftsmanshipRow}>
          <Col xs={24} md={12}>
            <div className={styles.craftsmanshipMediaWrapper}>
              <img
                src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Nghệ thuật chế tác"
                className={styles.craftsmanshipMedia}
              />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className={styles.craftsmanshipContent}>
              <Text className={styles.craftsmanshipKicker}>NGHỆ THUẬT CHẾ TÁC & DI SẢN</Text>
              <Title level={2} className={styles.craftsmanshipTitle}>Từ Đôi Bàn Tay Nghệ Nhân Đến Bạn</Title>
              <Paragraph className={styles.craftsmanshipDesc}>
                Trong suốt hơn một thế kỷ qua, các nghệ nhân bậc thầy tại ROYAL JEWELRY đã biến những viên đá quý hiếm nhất thế giới thành các tác phẩm nghệ thuật phi thường. Mỗi viên kim cương đều được tuyển chọn, cắt gọt và đính thủ công với sự tỉ mỉ tối thượng.
              </Paragraph>
              <Button
                type="primary"
                size="large"
                className={styles.craftsmanshipCta}
                onClick={() => navigate("/about")}
              >
                Khám Phá Nghệ Thuật Chế Tác
              </Button>
            </div>
          </Col>
        </Row>
      </Content>

      {/* Salon Concierge & Appointment Section */}
      <Content className={styles.appointmentSection}>
        <div className={styles.appointmentContainer}>
          <Text className={styles.appointmentKicker}>TƯ VẤN ĐẶC QUYỀN VIP</Text>
          <Title level={2} className={styles.appointmentTitle}>Trải Nghiệm Trực Tiếp Tại Showroom ROYAL JEWELRY</Title>
          <Paragraph className={styles.appointmentDesc}>
            Đặt lịch hẹn riêng với Chuyên gia của ROYAL JEWELRY tại Showroom flagship để được tư vấn thiết kế và thưởng lãm các bộ sưu tập kim cương độc bản.
          </Paragraph>
          <div className={styles.appointmentActions}>
            <Button
              type="primary"
              size="large"
              className={styles.appointmentPrimaryBtn}
              onClick={() => navigate("/contact")}
            >
              Đặt Lịch Hẹn Tư Vấn
            </Button>
            <Button
              size="large"
              className={styles.appointmentSecondaryBtn}
              onClick={() => navigate("/contact")}
            >
              Tìm Showroom Gần Bạn
            </Button>
          </div>
        </div>
      </Content>

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
          window.dispatchEvent(new CustomEvent('cart:refresh'));
        }}
      />

      {/* Scroll to Top Button */}
      <div
        className={`${styles.scrollToTop} ${showScrollTop ? styles.visible : ''}`}
        onClick={scrollToTop}
      >
        <UpOutlined style={{ fontSize: '24px' }} />
      </div>
    </Layout>
  );
};

export default HomePage;
