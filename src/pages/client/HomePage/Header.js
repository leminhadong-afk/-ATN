import {
  Button,
  Typography,
  Badge,
  Modal,
  message,
  Dropdown,
  Menu,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserOutlined,
  LoginOutlined,
  UserAddOutlined,
  ShoppingCartOutlined,
  SearchOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import styles from "./Header.module.css";
import LoginModal from "../../homePage/LoginModal";
import CustomerRegisterModal from "../../homePage/CustomerRegisterModal";
import { SCREEN } from "../../../router/screen";
import { CartApi } from "../../../api/client/cart/CartApi";
import { isTokenExpired } from "../../../util/common/utils";
import { HomeApi } from "../../../api/client/home/HomeApi";

const { Title } = Typography;

const Header = () => {
  const navigate = useNavigate();
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartVisible, setCartVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMega, setActiveMega] = useState(null);
  const [menuMeta, setMenuMeta] = useState({
    brands: [],
    materials: [],
    types: [],
  });
  const megaCloseTimerRef = useRef(null);

  // Scroll listener for compact header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");

    if (token && name && email) {
      setIsLoggedIn(true);
      setUserInfo({ name, email, role });
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");
    setUserInfo({ name, email, role });
    setLoginModalVisible(false);

    if (role === "ADMIN" || role === "EMPLOYEE") {
      navigate(SCREEN.productManagement.path);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    setIsLoggedIn(false);
    setUserInfo(null);
    navigate("/");
  };

  const refreshCartCount = async () => {
    const token = localStorage.getItem("token");
    if (isTokenExpired(token)) {
      setCartCount(0);
      return;
    }
    try {
      const { data } = await CartApi.count();
      setCartCount(Number(data) || 0);
    } catch (_) { }
  };

  const openLoginModal = () => {
    setLoginModalVisible(true);
    setRegisterModalVisible(false);
  };

  const openRegisterModal = () => {
    setRegisterModalVisible(true);
    setLoginModalVisible(false);
  };

  // Listen for global cart add events from other pages
  useEffect(() => {
    const onAdd = () => {
      refreshCartCount();
    };
    const onRefresh = () => {
      refreshCartCount();
    };
    const onOpenLogin = () => {
      setLoginModalVisible(true);
    };
    window.addEventListener("cart:add", onAdd);
    window.addEventListener("cart:refresh", onRefresh);
    window.addEventListener("open:login", onOpenLogin);
    refreshCartCount();
    return () => {
      window.removeEventListener("cart:add", onAdd);
      window.removeEventListener("cart:refresh", onRefresh);
      window.removeEventListener("open:login", onOpenLogin);
    };
  }, []);

  // Fetch collections metadata for mega menu
  useEffect(() => {
    (async () => {
      try {
        const { data } = await HomeApi.getProductFilters();
        setMenuMeta({
          brands: (data?.brands || []).slice(0, 10),
          materials: (data?.materials || []).slice(0, 10),
          types: (data?.types || []),
        });
      } catch (_) { }
    })();
  }, []);

  const cancelCloseMega = () => {
    if (megaCloseTimerRef.current) {
      window.clearTimeout(megaCloseTimerRef.current);
      megaCloseTimerRef.current = null;
    }
  };

  const closeMega = () => {
    cancelCloseMega();
    setActiveMega(null);
  };

  const goProducts = (query) => {
    if (query) navigate(`/products?${query}`);
    else navigate("/products");
    closeMega();
  };

  return (
    <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ""}`}>
      {/* Top Utility Bar */}
      <div className={styles.topBar}>
        <div className={styles.container}>
          <div className={styles.topBarInner}>
            <div className={styles.topBarLeft}>
              <button
                type="button"
                className={styles.topBarIconBtn}
                onClick={() => navigate("/contact")}
                title="Tư vấn VIP"
              >
                🛎️ <span className={styles.topBarLink}>TƯ VẤN SHOWROOM</span>
              </button>
              <button
                type="button"
                className={styles.topBarIconBtn}
                onClick={() => navigate("/products")}
                title="Tìm kiếm"
              >
                <SearchOutlined /> <span className={styles.topBarLink}>TÌM KIẾM</span>
              </button>
            </div>

            <div className={styles.topBarRight}>
              <button
                type="button"
                className={styles.topBarIconBtn}
                onClick={() => navigate("/contact")}
                title="Vị trí Showroom"
              >
                📍 <span className={styles.topBarLink}>SHOWROOM</span>
              </button>

              {isLoggedIn ? (
                <div className={styles.userInfo}>
                  <Dropdown
                    overlay={
                      <Menu className={styles.userMenuDropdown}>
                        <Menu.Item key="profile" onClick={() => navigate("/profile")}>
                          <UserOutlined /> Hồ sơ cá nhân
                        </Menu.Item>
                        <Menu.Item key="orders" onClick={() => navigate("/my-orders")}>
                          <ShoppingCartOutlined /> Đơn hàng của tôi
                        </Menu.Item>
                      </Menu>
                    }
                    placement="bottomRight"
                    trigger={["click"]}
                  >
                    <button type="button" className={styles.profileBtn}>
                      <UserOutlined className={styles.userIcon} />
                      <span className={styles.profileText}>{userInfo?.name || "TÀI KHOẢN"}</span>
                    </button>
                  </Dropdown>

                  {(userInfo?.role === "ADMIN" || userInfo?.role === "EMPLOYEE") && (
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => navigate(SCREEN.productManagement.path)}
                      className={styles.adminButton}
                    >
                      ADMIN
                    </Button>
                  )}

                  <button type="button" className={styles.logoutBtn} onClick={handleLogout} title="Đăng xuất">
                    <LogoutOutlined />
                  </button>
                </div>
              ) : (
                <div className={styles.userInfo}>
                  <button type="button" className={styles.loginBtn} onClick={openLoginModal}>
                    <LoginOutlined /> <span>ĐĂNG NHẬP</span>
                  </button>
                  <button type="button" className={styles.registerBtn} onClick={openRegisterModal}>
                    <UserAddOutlined /> <span>ĐĂNG KÝ</span>
                  </button>
                </div>
              )}

              <div className={styles.cartWrapper}>
                <Badge count={cartCount} showZero overflowCount={99} className={styles.customBadge}>
                  <button
                    type="button"
                    className={styles.cartBtn}
                    onClick={() => {
                      const token = localStorage.getItem("token");
                      if (!token || isTokenExpired(token) || !isLoggedIn) {
                        Modal.confirm({
                          title: "Yêu cầu đăng nhập",
                          content: "Bạn cần đăng nhập để xem giỏ hàng và mua hàng.",
                          okText: "Đăng nhập",
                          cancelText: "Hủy",
                          onOk: () => {
                            setLoginModalVisible(true);
                          },
                        });
                        return;
                      }
                      navigate("/cart");
                    }}
                    id="header-cart-anchor"
                    title="Giỏ hàng"
                  >
                    <ShoppingCartOutlined className={styles.cartIcon} />
                    <span className={styles.cartLabel}>GIỎ HÀNG</span>
                  </button>
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Brand Title & HW Crest Badge */}
      <div className={styles.container}>
        <div className={styles.brandHeaderRow}>
          <Link to="/" className={styles.logoLink} aria-label="ROYAL JEWELRY Home">
            <h1 className={styles.logoText}>ROYAL JEWELRY</h1>
          </Link>
          <div className={styles.crestDividerWrapper}>
            <div className={styles.hairline} />
            <div className={styles.crestBadge}>RJ</div>
            <div className={styles.hairline} />
          </div>
        </div>

        {/* Primary Navigation Row */}
        <nav className={styles.navRow} aria-label="Main Navigation">
          <button
            type="button"
            className={styles.navTrigger}
            onClick={() => navigate("/about")}
          >
            DI SẢN
          </button>
          <button
            type="button"
            className={styles.navTrigger}
            onClick={() => navigate("/products?category=high-jewelry")}
          >
            TRANG SỨC CAO CẤP
          </button>
          <button
            type="button"
            className={styles.navTrigger}
            onClick={() => navigate("/products?category=fine-jewelry")}
          >
            TRANG SỨC TINH XẢO
          </button>
          <button
            type="button"
            className={styles.navTrigger}
            onClick={() => navigate("/products?category=bridal")}
          >
            TRANG SỨC CƯỚI & ĐÍNH HÔN
          </button>
          <button
            type="button"
            className={styles.navTrigger}
            onClick={() => navigate("/products?category=watches")}
          >
            ĐỒNG HỒ XA XỈ
          </button>
          <button
            type="button"
            className={styles.navTrigger}
            onClick={() => navigate("/contact")}
          >
            DỊCH VỤ
          </button>
        </nav>
      </div>

      {/* Login Modal */}
      <LoginModal
        visible={loginModalVisible}
        onClose={() => setLoginModalVisible(false)}
        onSwitchToRegister={openRegisterModal}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Register Modal */}
      <CustomerRegisterModal
        visible={registerModalVisible}
        onClose={() => setRegisterModalVisible(false)}
        onSwitchToLogin={openLoginModal}
      />
    </header>
  );
};

export default Header;
