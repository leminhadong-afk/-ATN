import { Button, Card, Col, Layout, Row, Typography, Input, Space, Collapse, Radio, Checkbox, Spin, Modal, Pagination, message } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  ArrowUpOutlined as UpOutlined,
  FilterOutlined,
  UpOutlined as UpIcon,
  DownOutlined as DownIcon,
} from "@ant-design/icons";
import styles from "./ProductPage.module.css";
import Header from "../HomePage/Header";
import Footer from "../HomePage/Footer";
import { HomeApi } from "../../../api/client/home/HomeApi";
import { isTokenExpired } from "../../../util/common/utils";
import LoginModal from "../../homePage/LoginModal";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

const ProductPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const getColorHex = (vnName) => {
    const name = String(vnName || '').trim().toLowerCase();
    const map = {
      'đen': '#000000',
      'trắng': '#FFFFFF',
      'xám': '#808080',
      'xám đậm': '#505050',
      'xám nhạt': '#BFBFBF',
      'ghi': '#9E9E9E',
      'than': '#36454F',
      'vàng': '#FFFF00',
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
      'hồng': '#FFC0CB',
      'hồng nhạt': '#FFD1DC',
      'hồng đậm': '#FF69B4',
      'tím': '#800080',
      'tím than': '#301934',
      'tím nhạt': '#C3B1E1',
      'đỏ': '#FF0000',
      'đỏ tươi': '#FF2400',
      'đỏ đậm': '#8B0000',
      'đỏ đô': '#800000',
      'xanh lá': '#008000',
      'xanh lục': '#228B22',
      'xanh rêu': '#4F7942',
      'xanh mint': '#98FF98',
      'xanh dương': '#0000FF',
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
      'vàng kim': '#FFD700',
      'trong suốt': 'transparent',
      // English fallbacks
      'black': '#000000',
      'white': '#FFFFFF',
      'gray': '#808080',
      'silver': '#C0C0C0',
      'gold': '#FFD700',
      'red': '#FF0000',
      'blue': '#0000FF',
      'green': '#008000',
      'yellow': '#FFFF00',
      'orange': '#FFA500',
      'brown': '#A52A2A',
      'pink': '#FFC0CB',
      'purple': '#800080',
      'navy': '#001F3F',
      'transparent': 'transparent',
    };
    return map[name] || '#f0f0f0';
  };
  const [brandOptions, setBrandOptions] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState();
  const [selectedMaterialId, setSelectedMaterialId] = useState();
  const [selectedTypeId, setSelectedTypeId] = useState();
  const [selectedStatuses, setSelectedStatuses] = useState([]); // [1,0]
  const [minPrice, setMinPrice] = useState();
  const [maxPrice, setMaxPrice] = useState();
  const [listingMode, setListingMode] = useState("overview"); // "overview" | "newArrivals"

  // Filter data
  const categories = [
    { name: 'Nhẫn', count: 120 },
    { name: 'Dây chuyền', count: 85 },
    { name: 'Bông tai', count: 65 },
    { name: 'Vòng tay', count: 45 },
    { name: 'Đồng hồ', count: 30 },
    { name: 'Phụ kiện cao cấp', count: 25 }
  ];

  const priceRanges = [
    { label: 'Dưới 1 triệu', value: 'under-1m' },
    { label: '1 - 2 triệu', value: '1m-2m' },
    { label: '2 - 5 triệu', value: '2m-5m' },
    { label: '5 - 10 triệu', value: '5m-10m' },
    { label: '10 - 20 triệu', value: '10m-20m' },
    { label: 'Trên 20 triệu', value: 'over-20m' }
  ];

  const sizes = [
    '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowScrollTop(scrollPosition > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Always start at top when visiting ProductPage
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Apply query params -> filters (supports Header menus)
  useEffect(() => {
    const qs = new URLSearchParams(location.search || "");
    const qName = qs.get("name") || qs.get("q") || "";
    const qProductCode = qs.get("productCode") || "";
    const qBrandId = qs.get("brandId") || undefined;
    const qMaterialId = qs.get("materialId") || undefined;
    const qTypeId = qs.get("typeId") || undefined;
    const qMinPrice = qs.get("minPrice");
    const qMaxPrice = qs.get("maxPrice");
    const qColors = qs.getAll("colors");
    const qSizes = qs.getAll("sizes");
    const qNewArrivals = qs.get("newArrivals");

    setListingMode(qNewArrivals === "1" ? "newArrivals" : "overview");

    // Search: prefer explicit name; fallback to productCode
    const nextSearch = qName || qProductCode || "";
    setSearchQuery(nextSearch);

    setSelectedBrandId(qBrandId);
    setSelectedMaterialId(qMaterialId);
    setSelectedTypeId(qTypeId);

    const nextMin = qMinPrice !== null && qMinPrice !== "" ? Number(qMinPrice) : undefined;
    const nextMax = qMaxPrice !== null && qMaxPrice !== "" ? Number(qMaxPrice) : undefined;
    setMinPrice(Number.isFinite(nextMin) ? nextMin : undefined);
    setMaxPrice(Number.isFinite(nextMax) ? nextMax : undefined);

    setSelectedColors(qColors && qColors.length ? qColors : []);
    setSelectedSizes(qSizes && qSizes.length ? qSizes : []);

    // reset paging on new query
    setPage(1);
  }, [location.search]);

  const resetFilters = () => {
    setSelectedBrandId(undefined);
    setSelectedMaterialId(undefined);
    setSelectedTypeId(undefined);
    setSelectedColors([]);
    setSelectedSizes([]);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setPriceRange('');
    setPage(1);
    setListingMode("overview");
  };

  // Fetch filter options (single endpoint)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await HomeApi.getProductFilters();
        setBrandOptions((data?.brands || []).map((b) => ({ label: b.name, value: b.id })));
        setMaterialOptions((data?.materials || []).map((m) => ({ label: m.name, value: m.id })));
        setTypeOptions((data?.types || []).map((t) => ({ label: t.name, value: t.id })));
        setSizeOptions((data?.sizes || []).map((s) => ({ label: s, value: s })));
        setColorOptions((data?.colors || []).map((c) => ({ label: c, value: c })));
      } catch (e) {
        // silent fail keeps local fallbacks
      }
    })();
  }, []);

  // Fetch new arrivals (last 30 days)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await HomeApi.getNewArrivals({ page: 0, size: 8 });
        const mapped = (data?.content || []).map((item) => ({
          id: item.productId,
          name: item.productName || item.productCode || `Product ${item.productId}`,
          price: (() => {
            if (!item.price) return 0;
            const first = String(item.price).split(',')[0]?.trim();
            const num = Number(first);
            return isNaN(num) ? 0 : num;
          })(),
          image: item.urlImg || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
          brand: item.brand || "",
          sold: item.totalSoldQuantity || 0,
        }));
        setNewArrivals(mapped);
      } catch (_) { }
    })();
  }, []);

  // Fetch best sellers (>5 sold)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await HomeApi.getBestSellers({ minSold: 5 });
        const mapped = (data || []).map((item) => ({
          id: item.productId,
          name: item.productName,
          image: item.urlImg || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
          sold: item.totalSoldQuantity || 0,
          price: (() => {
            if (!item.price) return 0;
            const num = Number(String(item.price).split(',')[0]?.trim());
            return isNaN(num) ? 0 : num;
          })(),
        }));
        setBestSellers(mapped);
      } catch (_) { }
    })();
  }, []);

  // Fetch products from API (paginated + filters)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        if (listingMode === "newArrivals") {
          const { data } = await HomeApi.getNewArrivals({ page: page - 1, size: pageSize });
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
            image: item.urlImg || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            brand: item.brand || "",
            sold: item.totalSoldQuantity || 0,
          }));
          setProducts(mapped);
          setTotalItems(data?.totalElements || 0);
        } else {
          const params = {
            page: page - 1,
            size: pageSize,
            name: searchQuery || undefined,
            productCode: searchQuery || undefined, // Tìm theo cả mã sản phẩm
            brandId: selectedBrandId || undefined,
            materialId: selectedMaterialId || undefined,
            typeId: selectedTypeId || undefined,
            colors: selectedColors.length ? selectedColors : undefined,
            sizes: selectedSizes.length ? selectedSizes : undefined,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
            status: selectedStatuses.length ? selectedStatuses : undefined,
          };
          const { data } = await HomeApi.getProductOverview(params);
          const mapped = (data?.content || []).map((item) => ({
            id: item.productId,
            name: item.productName || item.productCode || `Product ${item.productId}`,
            productCode: item.productCode || "",
            // price field is grouped string; show first or join
            price: (() => {
              if (!item.price) return 0;
              const first = String(item.price).split(',')[0]?.trim();
              const num = Number(first);
              return isNaN(num) ? 0 : num;
            })(),
            image: item.urlImg || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            brand: item.brand || "",
            sold: item.totalSoldQuantity || 0,
            colors: item.colors || "",
            sizes: item.sizes || "",
            colorsArr: (item.colors ? String(item.colors).split(',').map((c) => c.trim()) : []),
            sizesArr: (item.sizes ? String(item.sizes).split(',').map((s) => s.trim()) : []),
          }));
          setProducts(mapped);
          setTotalItems(data?.totalElements || 0);
        }
      } catch (error) {
        console.error("Error fetching products: ", error);
        setProducts([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [listingMode, page, pageSize, searchQuery, selectedBrandId, selectedMaterialId, selectedTypeId, selectedColors, selectedSizes, minPrice, maxPrice, selectedStatuses]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleAddToCart = (productId) => {
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

    const product = products.find(p => p.id === productId);
    // Try add to backend by picking first product_detail of this product
    (async () => {
      try {
        const { ProductDetailManagementApi } = await import("../../../api/admin/productDetailManagement/productDetailManagementApi");
        const { data } = await ProductDetailManagementApi.getProductDetails({ id: productId, page: 0, size: 1 });
        const line = data?.content?.[0];
        if (!line || (!line.productDetailId && !line.id)) {
          message.error("Không tìm thấy thông tin sản phẩm!");
          return;
        }

        const { CartApi } = await import("../../../api/client/cart/CartApi");
        await CartApi.add({ productDetailId: line.productDetailId || line.id, quantity: 1 });
        message.success("Đã thêm sản phẩm vào giỏ hàng!");
        window.dispatchEvent(new CustomEvent('cart:refresh'));
      } catch (error) {
        console.error("Lỗi khi thêm vào giỏ hàng:", error);
        message.error(error.response?.data || "Không thể thêm vào giỏ (có thể đã vượt quá số lượng trong kho)!");
      }
    })();

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

  // Handle pagination change
  const handlePageChange = (newPage, newPageSize) => {
    setPage(newPage);
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
    }
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout className={styles.layout}>
      {/* Header Component */}
      <Header />

      <Content className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <Text className={styles.pageKicker}>Jewelry</Text>
          <Title level={1} className={styles.pageTitle}>
            Discover our creations
          </Title>
          <Text className={styles.pageSubtitle}>
            Tìm kiếm theo loại trang sức, chất liệu, màu sắc và kích cỡ. Chọn một
            thiết kế, thêm vào giỏ và thanh toán.
          </Text>
        </div>
      </Content>

      {/* Main Content */}
      <Content className={styles.mainContent}>
        <Row gutter={[24, 24]} className={styles.contentRow}>
          {/* Sidebar */}
          <Col xs={24} lg={5} className={styles.sidebar}>
            <div className={styles.sidebarContent}>
              <Title level={4} className={styles.sidebarTitle}>Filters</Title>

                {/* Sort Options */}
                {/* <div className={styles.sortSection}>
                <Space size="small" className={styles.sortButtons}>
                  <Button
                    type={sortBy === 'newest' ? 'primary' : 'default'}
                    onClick={() => setSortBy('newest')}
                    className={styles.sortButton}
                  >
                    Newest
                  </Button>
                  <Button
                    type={sortBy === 'highest-rated' ? 'primary' : 'default'}
                    onClick={() => setSortBy('highest-rated')}
                    className={styles.sortButton}
                  >
                    Highest Rated
                  </Button>
                  <Button
                    type={sortBy === 'low-price' ? 'primary' : 'default'}
                    onClick={() => setSortBy('low-price')}
                    className={styles.sortButton}
                  >
                    Low Price to High
                  </Button>
                  <Button
                    type={sortBy === 'high-price' ? 'primary' : 'default'}
                    onClick={() => setSortBy('high-price')}
                    className={styles.sortButton}
                  >
                    High Price to Low
                  </Button>
                </Space>
              </div> */}

                {/* Thương hiệu / Chất liệu / Loại */}
                <div className={styles.filterSection}>
                  <div className={styles.filterHeader}>
                    <Title level={5} className={styles.filterTitle}>Thương hiệu</Title>
                  </div>
                  <div className={styles.filterTagGroup}>
                    {(brandOptions || []).map((b) => (
                      <Button
                        key={b.value}
                        type={selectedBrandId === b.value ? 'primary' : 'default'}
                        className={styles.filterTagButton}
                        onClick={() => { setSelectedBrandId(selectedBrandId === b.value ? undefined : b.value); setPage(1); }}
                      >
                        {b.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className={styles.filterSection}>
                  <div className={styles.filterHeader}>
                    <Title level={5} className={styles.filterTitle}>Chất liệu</Title>
                  </div>
                  <div className={styles.filterTagGroup}>
                    {(materialOptions || []).map((m) => (
                      <Button
                        key={m.value}
                        type={selectedMaterialId === m.value ? 'primary' : 'default'}
                        className={styles.filterTagButton}
                        onClick={() => { setSelectedMaterialId(selectedMaterialId === m.value ? undefined : m.value); setPage(1); }}
                      >
                        {m.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className={styles.filterSection}>
                  <div className={styles.filterHeader}>
                    <Title level={5} className={styles.filterTitle}>Loại trang sức</Title>
                  </div>
                  <div className={styles.filterTagGroup}>
                    {(typeOptions || []).map((t) => (
                      <Button
                        key={t.value}
                        type={selectedTypeId === t.value ? 'primary' : 'default'}
                        className={styles.filterTagButton}
                        onClick={() => { setSelectedTypeId(selectedTypeId === t.value ? undefined : t.value); setPage(1); }}
                      >
                        {t.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Giá */}
                <div className={styles.filterSection}>
                  <div className={styles.filterHeader}>
                    <Title level={5} className={styles.filterTitle}>Khoảng Giá</Title>
                  </div>
                  <div className={styles.filterTagGroup}>
                    {[
                      { label: 'Dưới 500K', min: 0, max: 500000 },
                      { label: '500K - 1M', min: 500000, max: 1000000 },
                      { label: '1M - 2M', min: 1000000, max: 2000000 },
                      { label: 'Trên 2M', min: 2000000, max: undefined },
                    ].map((opt) => (
                      <Button
                        key={opt.label}
                        type={(minPrice === opt.min && maxPrice === opt.max) ? 'primary' : 'default'}
                        className={styles.filterTagButton}
                        onClick={() => {
                          if (minPrice === opt.min && maxPrice === opt.max) {
                            setMinPrice(undefined);
                            setMaxPrice(undefined);
                            setPriceRange('');
                          } else {
                            setMinPrice(opt.min);
                            setMaxPrice(opt.max);
                            setPriceRange(opt.label);
                          }
                          setPage(1);
                        }}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>





                <div className={styles.filterSection}>
                  {/* <Button type="primary" block onClick={() => { setPage(1); }}>
                  Apply Filters
                </Button> */}
                  <Button style={{ marginTop: 8 }} block onClick={resetFilters}>
                    Reset bộ lọc
                  </Button>
                </div>
            </div>
          </Col>


          {/* Products Grid */}
          <Col xs={24} lg={19} className={styles.productsColumn}>
            <div className={styles.toolbar}>
              <div className={styles.searchBar}>
                <Search
                  placeholder="Tìm theo tên hoặc mã sản phẩm"
                  allowClear
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onSearch={(value) => {
                    setSearchQuery(value);
                    setPage(1);
                  }}
                  enterButton
                  size="large"
                />
              </div>
              <div className={styles.resultsMeta}>
                <Text className={styles.resultsText}>
                  {totalItems ? `${totalItems} products` : "Products"}
                </Text>
              </div>
            </div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <Spin size="large" />
                </div>
              ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <Text>Không tìm thấy sản phẩm nào</Text>
                </div>
              ) : (
                <>
                  <div className={styles.productsGrid}>
                    {products.map((product) => (
                      <div key={product.id} className={styles.productTile}>
                        <Card
                          className={styles.productCard}
                          onClick={() => navigate(`/products/${product.id}`)}
                          hoverable
                        >
                          <div className={styles.productImageContainer}>
                            <img
                              src={product.image}
                              alt={product.name}
                              className={styles.productImage}
                              data-product-img={`img-${product.id}`}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
                              }}
                            />
                            <Button
                              type="default"
                              shape="circle"
                              icon={<ShoppingCartOutlined />}
                              className={`${styles.addToCartButton} ${styles.addToCartFixed}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product.id);
                              }}
                            />
                          </div>
                          <div className={styles.productInfo}>
                            <Text className={styles.productBrand}>
                              {product.brand || "ROYAL JEWELRY"}
                            </Text>
                            {product.productCode && (
                              <Text className={styles.productCode} type="secondary">
                                Mã: {product.productCode}
                              </Text>
                            )}
                            <Text className={styles.productName}>{product.name}</Text>
                            <div className={styles.priceRow}>
                              <Text className={styles.productPrice}>
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(product.price)}
                              </Text>
                              <Text className={styles.soldCount}>
                                Đã bán: {product.sold || 0}
                              </Text>
                            </div>
                          </div>
                        </Card>
                      </div>
                    ))}
                  </div>
                  {/* Pagination */}
                  <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                    <Pagination
                      current={page}
                      total={totalItems}
                      pageSize={pageSize}
                      showSizeChanger
                      showQuickJumper
                      showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`}
                      pageSizeOptions={['12', '24', '36', '48']}
                      onChange={handlePageChange}
                      onShowSizeChange={handlePageChange}
                    />
                  </div>
                </>
              )}
          </Col>
        </Row>
      </Content>


      {/* Scroll to Top Button */}
      <Footer className={styles.footer} />

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

      <div
        className={`${styles.scrollToTop} ${showScrollTop ? styles.visible : ''}`}
        onClick={scrollToTop}
      >
        <UpOutlined style={{ fontSize: '24px' }} />
      </div>
    </Layout>
  );
};

export default ProductPage;

