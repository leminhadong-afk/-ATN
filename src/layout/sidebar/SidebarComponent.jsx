import React, { useEffect, useState } from "react";
import { Layout, Menu, Modal } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faCarTunnel,
  faCogs,
  faShop,
  faShoppingCart,
  faSignOutAlt,
  faTrademark,
  faChartSimple,
  faReply,
  faUser,
  faTags,
  faFileAlt,
  faTag,
  faMoneyCheck,
  faTasks,
  faChartBar,
  faComment,
} from "@fortawesome/free-solid-svg-icons";
import { MenuUnfoldOutlined } from "@ant-design/icons";
import "./style-sidebar.css";
import { useAppDispatch } from "../../app/hook";
import { logout } from "../../util/auth";
import logo from "../../assets/img/logo.png";

const { Sider } = Layout;

const SidebarComponent = ({ collapsed, toggleCollapsed }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [selectedKey, setSelectedKey] = useState("");

  useEffect(() => {
    setSelectedKey(location.pathname);
  }, [location]);

  const handleLogout = () => {
    Modal.confirm({
      title: "Xác nhận đăng xuất",
      content: "Bạn có chắc chắn muốn đăng xuất?",
      okText: "Đăng xuất",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        logout(navigate); // Gọi hàm logout
      },
    });
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      theme={collapsed ? "dark" : "light"}
      className="sidebar"
      width={250}
      style={{
        overflowY: "auto",
        overflowX: "hidden",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 10000,
        color: "white",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        background: "linear-gradient(180deg, #1a365d 0%, #2a4365 100%)",
        boxShadow: "4px 0 20px rgba(0, 0, 0, 0.3)",
      }}
    >
      <Menu
        theme={collapsed ? "dark" : "light"}
        mode="inline"
        style={{ color: "white" }}
        selectedKeys={[selectedKey]}
      >
        {!collapsed && (
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <div
              className="sidebar-brand-box"
              onClick={() => navigate("/")}
              title="Về trang chủ"
            >
              <img
                src={logo}
                alt="ROYAL JEWELRY"
                className="sidebar-brand-img"
              />
              <div className="sidebar-brand-title">ROYAL JEWELRY</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{ textAlign: "center", marginBottom: 20, marginTop: 15 }}>
            <div
              className="sidebar-collapsed-btn"
              style={{
                width: 36,
                height: 36,
                margin: "0 auto",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 4px 14px rgba(212, 175, 55, 0.45)",
                cursor: "pointer",
                color: "#fff",
              }}
              onClick={toggleCollapsed}
              title="Mở rộng menu"
            >
              <MenuUnfoldOutlined style={{ fontSize: 18, color: "#fff" }} />
            </div>
          </div>
        )}

        <Menu.Item
          // key="/brand-management"
          className="menu_custom"
          style={{ color: "white" }}
          icon={<FontAwesomeIcon icon={faChartSimple} />}
        >
          <Link to="/analysis-management">Thống kê</Link>
        </Menu.Item>

        <Menu.Item
          // key="/brand-management"
          className="menu_custom"
          style={{ color: "white" }}
          icon={<FontAwesomeIcon icon={faShoppingCart} />}
        >
          <Link to="/counter-sale-management">Bán hàng tại quầy</Link>
        </Menu.Item>

        {/* Bill Management */}
        <Menu.SubMenu
          key="/bill-management-options"
          title="Quản lý đơn hàng"
          icon={<FontAwesomeIcon icon={faFileAlt} style={{ color: "white" }} />}
          style={{ color: "white" }}
        >
          <Menu.Item
            key="/bill-management" // Đảm bảo rằng key này là duy nhất cho xử lý đơn hàng
            className="menu_custom"
            style={{ color: "white" }}
            icon={<FontAwesomeIcon icon={faTasks} />}
          >
            <Link to="/bill-management">Xử lý đơn hàng</Link>
          </Menu.Item>

          <Menu.Item
            key="/bill-statistics" // Chọn một key khác cho mục thống kê đơn hàng
            className="menu_custom"
            style={{ color: "white" }}
            icon={<FontAwesomeIcon icon={faChartBar} />}
          >
            <Link to="/bill-statistics">Thống kê đơn hàng</Link>
          </Menu.Item>
        </Menu.SubMenu>

        <Menu.SubMenu
          key="/product-management-options"
          title="Quản lý sản phẩm"
          icon={<FontAwesomeIcon icon={faShop} />}
          style={{ color: "white" }}
        >
          <Menu.Item
            key="/product-management" // Đảm bảo rằng key này là duy nhất cho sản phẩm
            className="menu_custom"
            style={{ color: "white" }}
            icon={<FontAwesomeIcon icon={faShop} />}
          >
            <Link to="/product-management">Sản phẩm</Link>
          </Menu.Item>

          <Menu.Item
            key="/brand-management" // Chọn một key khác cho mục thứ hai
            className="menu_custom"
            style={{ color: "white" }}
            icon={<FontAwesomeIcon icon={faTrademark} />}
          >
            <Link to="/brand-management">Thương hiệu</Link>
          </Menu.Item>

          <Menu.Item
            key="/material-management" // Chọn một key khác cho mục thứ hai
            className="menu_custom"
            style={{ color: "white" }}
            icon={<FontAwesomeIcon icon={faCogs} />}
          >
            <Link to="/material-management">Chất liệu</Link>
          </Menu.Item>

          <Menu.Item
            key="/type-of-jewelry-management"
            className="menu_custom"
            style={{ color: "white" }}
            icon={<FontAwesomeIcon icon={faBox} />}
          >
            <Link to="/type-of-jewelry-management">Loại trang sức</Link>
          </Menu.Item>
        </Menu.SubMenu>

        <Menu.Item
          key="/review-management"
          className="menu_custom"
          style={{ color: "white" }}
          icon={<FontAwesomeIcon icon={faComment} />}
        >
          <Link to="/review-management">Quản lý đánh giá</Link>
        </Menu.Item>

        {/* Account Management */}
        <Menu.SubMenu
          key="/account-management-options"
          title="Tài khoản"
          icon={<FontAwesomeIcon icon={faUser} />}
          style={{ color: "white" }}
        >
          <Menu.Item
            key="/employee-management"
            className="menu_custom"
            style={{ color: "white" }}
            icon={<FontAwesomeIcon icon={faUser} />}
          >
            <Link to="/employee-management">Quản lý nhân viên</Link>
          </Menu.Item>

          <Menu.Item
            key="/customer-management"
            className="menu_custom"
            style={{ color: "white" }}
            icon={<FontAwesomeIcon icon={faUser} />}
          >
            <Link to="/customer-management">Quản lý khách hàng</Link>
          </Menu.Item>
        </Menu.SubMenu>

        {/* <Menu.Item
          // key="/brand-management"
          className="menu_custom"
          style={{ color: "white" }}
          icon={<FontAwesomeIcon icon={faReply} />}
        >
          <Link to="/return-management">Trả hàng</Link>
        </Menu.Item> */}

        {/* <Menu.Item
          // key="/brand-management"
          className="menu_custom"
          style={{ color: "white" }}
          icon={<FontAwesomeIcon icon={faTags} />}
        >
          <Link to="/promotion-management">Khuyến mãi</Link>
        </Menu.Item> */}

        {/* Promotion Management */}
        {/* <Menu.SubMenu
          key="/promotion-management-options"
          title="Khuyến mãi"
          icon={
            <FontAwesomeIcon style={{ color: "white" }} icon={faMoneyCheck} />
          }
          style={{ color: "white" }}
        >
          <Menu.Item
            key="/promotion-management"
            className="menu_custom"
            style={{ color: "white" }}
            icon={<FontAwesomeIcon icon={faTag} />}
          >
            <Link to="/promotion-management">Mã khuyến mãi </Link>
          </Menu.Item>

          <Menu.Item
            key="/big-promotion-management"
            className="menu_custom"
            style={{ color: "white" }}
            icon={<FontAwesomeIcon icon={faUser} />}
          >
            <Link to="/big-promotion-management">Đợt khuyến mãi </Link>
          </Menu.Item>
        </Menu.SubMenu> */}

        {/* Nút Đăng xuất */}
        <Menu.Item
          key="logout"
          className="menu_custom"
          style={{ color: "white", marginTop: "auto" }}
          icon={<FontAwesomeIcon icon={faSignOutAlt} />}
          onClick={handleLogout}
        >
          Đăng xuất
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default SidebarComponent;
