import { Button, Card, Col, Layout, Row, Typography, Space, Radio, InputNumber, Tag, Modal, message } from "antd";
import { LeftOutlined, RightOutlined, ShoppingCartOutlined, ArrowUpOutlined as UpOutlined } from "@ant-design/icons";
import React from "react";
import { ProductDetailManagementApi } from "../../../api/admin/productDetailManagement/productDetailManagementApi";
import { HomeApi } from "../../../api/client/home/HomeApi";
import { CartApi } from "../../../api/client/cart/CartApi";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../HomePage/Header";
import Footer from "../HomePage/Footer";
import LoginModal from "../../homePage/LoginModal";
import { isTokenExpired } from "../../../util/common/utils";
import ProductReviewSection from "./ProductReviewSection";
import styles from "./ProductDetailPage.module.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const emptyProduct = { id: "", name: "", price: 0, brand: "", category: "", material: "", colors: [], sizes: [], stock: 0, images: [], colorToImage: {} };

const getColorHex = (vnName) => {
  const name = String(vnName || '').trim().toLowerCase();
  
  // Specific Jewelry Finishes & Metals
  if (name.includes('hồng') || name.includes('rose gold')) return '#E8A399';
  if (name.includes('trắng') || name.includes('white gold')) return '#EBEBEB';
  if (name.includes('vàng vàng') || name.includes('yellow gold') || name.includes('vàng 18k') || name.includes('vàng 24k')) return '#E5C158';
  if (name.includes('vàng kim') || name.includes('vàng đồng') || name.includes('vàng')) return '#E5C158';
  if (name.includes('bạch kim') || name.includes('platinum')) return '#E5E4E2';
  if (name.includes('bạc') || name.includes('silver') || name.includes('s925')) return '#C0C0C0';
  if (name.includes('kim cương') || name.includes('diamond')) return '#F0F8FF';
  if (name.includes('đen') || name.includes('black')) return '#1A1A1A';
  if (name.includes('đỏ') || name.includes('red') || name.includes('ruby')) return '#C41E3A';
  if (name.includes('xanh ngọc') || name.includes('emerald')) return '#50C878';
  if (name.includes('xanh dương') || name.includes('sapphire')) return '#0F52BA';

  const map = {
    'đen': '#000000',
    'trắng': '#FFFFFF',
    'xám': '#808080',
    'xám đậm': '#505050',
    'xám nhạt': '#BFBFBF',
    'ghi': '#9E9E9E',
    'than': '#36454F',
    'vàng': '#E5C158',
    'vàng chanh': '#DFFF00',
    'vàng đồng': '#B8860B',
    'cam': '#FFA500',
    'cam đất': '#E77E23',
    'cam nhạt': '#FFC187',
    'nâu': '#A52A2A',
    'nâu đậm': '#5C4033',
    'nâu nhạt': '#C4A484',
    'nâu đỏ': '#8B0000',
    'nâu sữa': '#A68064',
    'hồng': '#E8A399',
    'hồng nhạt': '#FFD1DC',
    'hồng đậm': '#FF69B4',
    'tím': '#800080',
    'tím than': '#301934',
    'tím nhạt': '#C3B1E1',
    'đỏ': '#C41E3A',
    'đỏ tươi': '#FF2400',
    'đỏ đậm': '#8B0000',
    'đỏ đô': '#800000',
    'xanh lá': '#008000',
    'xanh lục': '#228B22',
    'xanh rêu': '#4F7942',
    'xanh mint': '#98FF98',
    'xanh dương': '#0F52BA',
    'xanh lam': '#1E90FF',
    'xanh': '#00AEEF',
    'xanh navy': '#001F3F',
    'xanh coban': '#0047AB',
    'xanh đen': '#003153',
    'be': '#F5F5DC',
    'be đậm': '#E5D1A7',
    'be nhạt': '#FFF5D7',
    'kem': '#FFFDD0',
    'trắng sữa': '#FFFAF0',
    'trắng ngà': '#FAF0E6',
    'bạc': '#C0C0C0',
    'vàng kim': '#E5C158',
    'trong suốt': 'transparent',
    'black': '#000000',
    'white': '#FFFFFF',
    'gray': '#808080',
    'silver': '#C0C0C0',
    'gold': '#E5C158',
    'red': '#C41E3A',
    'blue': '#0F52BA',
    'green': '#008000',
    'yellow': '#E5C158',
    'orange': '#FFA500',
    'brown': '#A52A2A',
    'pink': '#E8A399',
    'purple': '#800080',
    'navy': '#001F3F',
    'transparent': 'transparent',
  };
  return map[name] || '#D4AF37';
};

const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = React.useState(emptyProduct);
  const [mainImage, setMainImage] = React.useState();
  const [selectedColor, setSelectedColor] = React.useState();
  const [selectedSize, setSelectedSize] = React.useState();
  const [quantity, setQuantity] = React.useState(1);
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  const [bestsellerProducts, setBestsellerProducts] = React.useState([]);
  const [loginModalVisible, setLoginModalVisible] = React.useState(false);
  const [productDetailsList, setProductDetailsList] = React.useState([]); // Lưu danh sách productDetails để tìm số lượng
  const [currentStock, setCurrentStock] = React.useState(0); // Số lượng của sản phẩm được chọn (màu + size)
  const bestsellerProductsRef = React.useRef(null);

  const scrollProducts = (direction, ref) => {
    if (ref.current) {
      const scrollAmount = 300;
      if (direction === 'left') {
        ref.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  React.useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Tìm số lượng sản phẩm theo màu và size được chọn
  const findStockByColorAndSize = React.useCallback((color, size) => {
    if (!color || !size || !productDetailsList.length) return 0;
    const found = productDetailsList.find((it) => {
      const colorName = it.colorName || it.color;
      const sizeName = it.sizeName || it.size;
      return colorName === color && sizeName === size;
    });
    return found ? (found.quantity || 0) : 0;
  }, [productDetailsList]);

  // Cập nhật số lượng khi màu hoặc size thay đổi
  React.useEffect(() => {
    if (selectedColor && selectedSize) {
      const stock = findStockByColorAndSize(selectedColor, selectedSize);
      setCurrentStock(stock);
      // Reset quantity nếu vượt quá số lượng mới
      if (quantity > stock) {
        setQuantity(Math.max(1, stock));
      }
    } else {
      setCurrentStock(0);
    }
  }, [selectedColor, selectedSize, findStockByColorAndSize, quantity]);

  const handleAddToCart = async () => {
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

    if (currentStock <= 0) {
      message.error("Sản phẩm với thuộc tính này hiện đã hết hàng trong kho!");
      return;
    }

    const p = product;
    try {
      // Determine variant to add (by color/size), use product details
      const { data } = await ProductDetailManagementApi.getProductDetails({ id, page: 0, size: 200 });
      const list = data?.content || [];
      const line = list.find((it) => {
        const colorName = it.colorName || it.color;
        const sizeName = it.sizeName || it.size;
        return (!selectedColor || colorName === selectedColor) && (!selectedSize || sizeName === selectedSize);
      });
      
      if (!line) {
        message.warning("Không tìm thấy biến thể sản phẩm phù hợp với thuộc tính đã chọn!");
        return;
      }

      const targetProductDetailId = line.productDetailId || line.id;
      if (!targetProductDetailId) {
        message.error("Lỗi xác định mã chi tiết sản phẩm!");
        return;
      }

      const availableStock = line.quantity != null ? Number(line.quantity) : (currentStock || 0);
      if (availableStock <= 0) {
        message.error("Sản phẩm với thuộc tính này hiện đã hết hàng trong kho!");
        return;
      }

      // Kiểm tra số lượng đã có trong giỏ hàng
      let existingInCart = 0;
      try {
        const cartRes = await CartApi.list();
        const existingItem = (cartRes?.data || []).find(
          (it) => it.productDetailId === targetProductDetailId
        );
        if (existingItem) {
          existingInCart = existingItem.quantity || existingItem.qty || 0;
        }
      } catch (_) { }

      if (existingInCart >= availableStock) {
        message.warning(`Bạn đã có toàn bộ ${availableStock} sản phẩm (tối đa tồn kho) trong giỏ hàng!`);
        return;
      }

      const remainingCanAdd = availableStock - existingInCart;
      if (quantity > remainingCanAdd) {
        message.error(
          `Bạn đã có ${existingInCart} sản phẩm trong giỏ. Tồn kho còn ${availableStock}, bạn chỉ có thể thêm tối đa ${remainingCanAdd} sản phẩm nữa!`
        );
        return;
      }

      // Call backend to add
      await CartApi.add({
        productDetailId: targetProductDetailId,
        quantity: quantity || 1,
      });

      message.success("Đã thêm sản phẩm vào giỏ hàng!");

      // Notify header to refresh count
      window.dispatchEvent(new CustomEvent('cart:refresh'));
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      const errMsg = error.response?.data || "Thêm vào giỏ hàng thất bại (có thể đã vượt quá số lượng trong kho)!";
      message.error(typeof errMsg === 'string' ? errMsg : "Thêm vào giỏ hàng thất bại!");
    }

    // Fly-to-cart animation using current main image
    const cartEl = document.getElementById('header-cart-anchor');
    const imgEl = document.querySelector('[data-product-img="detail-main"]');
    if (!cartEl || !imgEl) return;
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

  const handleAddToCartFromBestseller = async (productId) => {
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

    const product = bestsellerProducts.find(p => p.id === productId);
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

  // Always start from top when opening/changing product detail
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [id]);

  // Fetch product details by productId
  React.useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const params = { id, page: 0, size: 100 };
        const { data } = await ProductDetailManagementApi.getProductDetails(params);
        const list = data?.content || [];
        if (list.length === 0) return;

        // Lưu danh sách productDetails để tìm số lượng theo màu và size
        setProductDetailsList(list);

        // Derive product info from first item and aggregates
        const first = list[0];
        // Build color -> first image map (one image per color)
        const colorImageMap = new Map();
        list.forEach((it) => {
          const colorName = it.colorName || it.color;
          const img = it.urlImg;
          if (colorName && img && !colorImageMap.has(colorName)) {
            colorImageMap.set(colorName, img);
          }
        });
        const images = Array.from(colorImageMap.values());
        const sizeSet = new Set(list.map((it) => it.sizeName || it.size).filter(Boolean));
        const toNum = (s) => {
          const n = Number(String(s).replace(/[^0-9.]/g, ''));
          return isNaN(n) ? Number.POSITIVE_INFINITY : n;
        };
        const sizes = Array.from(sizeSet).sort((a, b) => {
          const da = toNum(a);
          const db = toNum(b);
          if (da !== db) return da - db;
          return String(a).localeCompare(String(b));
        });
        const colors = Array.from(colorImageMap.keys()).map((name) => ({ name, code: getColorHex(name) }));
        const stock = list.reduce((sum, it) => sum + (it.quantity || 0), 0);
        const nextProduct = {
          id: first.productId || id,
          name: first.productName || first.product || '',
          price: Number(first.price) || 0,
          brand: first.brandName || first.brand || '',
          category: first.typeName || first.type || '',
          material: first.materialName || first.material || '',
          colors,
          sizes,
          stock,
          images: images.length ? images : ["https://via.placeholder.com/600x600"],
          colorToImage: Object.fromEntries(colorImageMap),
        };
        setProduct(nextProduct);
        const firstColor = nextProduct.colors[0]?.name;
        const firstSize = nextProduct.sizes[0];
        setSelectedColor(firstColor);
        setMainImage(firstColor ? nextProduct.colorToImage[firstColor] : nextProduct.images[0]);
        setSelectedSize(firstSize);

        // Cập nhật số lượng ngay sau khi set màu và size ban đầu
        if (firstColor && firstSize) {
          const initialStock = list.find((it) => {
            const colorName = it.colorName || it.color;
            const sizeName = it.sizeName || it.size;
            return colorName === firstColor && sizeName === firstSize;
          });
          setCurrentStock(initialStock ? (initialStock.quantity || 0) : 0);
        }
      } catch (e) {
        // silent
      }
    })();
  }, [id]);

  // Fetch bestseller products
  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await HomeApi.getBestSellers({ minSold: 5 });
        const mapped = (data || []).map((item) => ({
          id: item.productId,
          name: item.productName,
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

  return (
    <Layout className={styles.layout}>
      <Header />
      <Content className={styles.container}>
        <Row gutter={[32, 32]}>
          <Col xs={24} lg={12}>
            <div className={styles.gallery}>
              <div className={styles.mainImageWrap}>
                {mainImage && <img key={mainImage} src={mainImage} alt={product.name} className={styles.mainImage} data-product-img="detail-main" />}
              </div>
              <div className={styles.thumbRow}>
                {product.images.map((src, idx) => (
                  <div
                    key={idx}
                    className={`${styles.thumbWrap} ${mainImage === src ? styles.active : ''}`}
                    onClick={() => setMainImage(src)}
                  >
                    <img src={src} alt={`thumb-${idx}`} className={styles.thumb} />
                  </div>
                ))}
              </div>
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className={styles.info}>
              <Text className={styles.brand}>{product.brand}</Text>
              <Title level={2} className={styles.title}>{product.name}</Title>
              <Title level={2} className={styles.price}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</Title>

              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Danh mục:</span>
                <Tag>{product.category}</Tag>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Chất liệu:</span>
                <Tag color="default">{product.material}</Tag>
              </div>

              <div className={styles.optionGroup}>
                <div className={styles.optionLabel}>
                  Màu sắc: <span className={styles.selectedColorText}>{selectedColor || 'Chưa chọn'}</span>
                </div>
                <div className={styles.colorRow}>
                  {product.colors?.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      className={`${styles.colorPill} ${selectedColor === c.name ? styles.colorPillActive : ''}`}
                      onClick={() => { 
                        setSelectedColor(c.name); 
                        const img = product.colorToImage?.[c.name]; 
                        if (img) setMainImage(img); 
                      }}
                      title={c.name}
                    >
                      <span 
                        className={styles.colorPillDot} 
                        style={{ backgroundColor: c.code }} 
                      />
                      <span className={styles.colorPillText}>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.optionGroup}>
                <div className={styles.optionLabel}>Size</div>
                <Radio.Group value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
                  <Space wrap>
                    {product.sizes?.map((s) => (
                      <Radio.Button key={s} value={s}>{s}</Radio.Button>
                    ))}
                  </Space>
                </Radio.Group>
              </div>

              <div className={styles.optionGroup}>
                <div className={styles.optionLabel}>Số lượng</div>
                <InputNumber 
                  min={currentStock > 0 ? 1 : 0} 
                  max={Math.max(1, currentStock || 1)} 
                  value={currentStock > 0 ? quantity : 0} 
                  disabled={currentStock <= 0}
                  onChange={(v) => {
                    const val = Number(v) || 1;
                    if (currentStock > 0 && val > currentStock) {
                      setQuantity(currentStock);
                      message.warning(`Số lượng tối đa có thể chọn là ${currentStock}`);
                    } else {
                      setQuantity(val);
                    }
                  }} 
                />
                <span className={styles.stockNote}>
                  {currentStock > 0 ? (
                    `Còn ${currentStock} sản phẩm`
                  ) : (
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>Tạm hết hàng</span>
                  )}
                </span>
              </div>
              <Space size="middle">
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  style={currentStock <= 0 ? { backgroundColor: '#94a3b8', borderColor: '#94a3b8', cursor: 'not-allowed' } : {}}
                >
                  {currentStock > 0 ? "Add to cart" : "Hết hàng"}
                </Button>
                {/* <Button size="large" onClick={() => console.log('Mua Ngay')}>Mua Ngay</Button> */}
              </Space>
            </div>
          </Col>
        </Row>
      </Content>
      {/* Details and Bestsellers */}
      <Content className={styles.extraContainer}>
        {/* Chi tiết sản phẩm */}
        <div className={styles.detailsSection}>
          <Title level={3} className={styles.sectionTitle}>CHI TIẾT SẢN PHẨM</Title>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}><span>Danh mục:</span><strong>{product.category}</strong></div>
            <div className={styles.detailItem}><span>Chất liệu:</span><strong>{product.material}</strong></div>
            <div className={styles.detailItem}><span>Màu sắc:</span><strong>{selectedColor || 'Chưa chọn'}</strong></div>
            <div className={styles.detailItem}><span>Size:</span><strong>{selectedSize || 'Chưa chọn'}</strong></div>
            <div className={styles.detailItem}><span>Tồn kho:</span><strong>{currentStock || 0}</strong></div>
          </div>
        </div>

        {/* Sản phẩm bán chạy */}
        <div className={styles.bestsellerSection}>
          <div className={styles.sectionHeader}>
            <Title level={2} className={styles.sectionTitle}>
              SẢN PHẨM BÁN CHẠY
            </Title>
            <Text className={styles.sectionSubtitle}>
              Những món trang sức được yêu thích nhất hiện tại
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
                          <div className={styles.bestsellerBadge}>BÁN CHẠY</div>
                          {/* <div className={styles.discountBadge}>-{product.discount}%</div> */}
                        </div>
                        <Button
                          type="default"
                          shape="circle"
                          icon={<ShoppingCartOutlined />}
                          className={`${styles.addToCartButton} ${styles.addToCartFixed}`}
                          onClick={(e) => { e.stopPropagation(); handleAddToCartFromBestseller(product.id); }}
                        />
                      </div>
                      <div className={styles.productInfo}>
                        <Text className={styles.productBrand}>{product.brand}</Text>
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
                          <div className={styles.bestsellerBadge}>BÁN CHẠY</div>
                          {/* <div className={styles.discountBadge}>-{product.discount}%</div> */}
                        </div>
                        <Button
                          type="default"
                          shape="circle"
                          icon={<ShoppingCartOutlined />}
                          className={`${styles.addToCartButton} ${styles.addToCartFixed}`}
                          onClick={(e) => { e.stopPropagation(); handleAddToCartFromBestseller(product.id); }}
                        />
                      </div>
                      <div className={styles.productInfo}>
                        <Text className={styles.productBrand}>{product.brand}</Text>
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

          {/* Product Reviews Section */}
          <ProductReviewSection
            productId={id}
            productName={product?.name}
            onRequireLogin={() => setLoginModalVisible(true)}
          />
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

      {/* Scroll to Top */}
      <div className={`${styles.scrollToTop} ${showScrollTop ? styles.visible : ''}`} onClick={scrollToTop}>
        <UpOutlined style={{ fontSize: '24px' }} />
      </div>
    </Layout>
  );
};

export default ProductDetailPage;


