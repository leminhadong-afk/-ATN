// components/Header.js
import React, { useState, useCallback } from "react";
import { Button, Space, Typography } from "antd";
import LoginModal from "../LoginModal";
import RegisterModal from "../RegisterModal";
import { SearchOutlined, ShoppingCartOutlined } from "@mui/icons-material";
import styles from "./Header.module.css";

const { Text } = Typography;

const Header = () => {
  const [modalType, setModalType] = useState(null); // 'login' | 'register' | null

  const handleOpenLoginModal = useCallback(() => {
    setModalType('login');
  }, []);

  const handleCloseLoginModal = useCallback(() => {
    setModalType(null);
  }, []);

  const handleOpenRegisterModal = useCallback(() => {
    setModalType('register');
  }, []);

  const handleCloseRegisterModal = useCallback(() => {
    setModalType(null);
  }, []);

  // Hàm xử lý cuộn đến các section
  const handleScrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={styles.header}>
      {/* Logo */}
      <div className={styles.logo}>
        <Text className={styles.logoText}>
          ROYAL <span className={styles.highlight}>JEWELRY</span>
        </Text>
      </div>

      {/* Navigation */}
      <div className={styles.navigation}>
        <div
          className={styles.navItem}
          onClick={() => handleScrollToSection('hero-section')}
        >
          Trang chủ
        </div>
        <div 
          className={styles.navItem}
          onClick={() => handleScrollToSection('features-section')}
        >
          Tính năng
        </div>
        <div 
          className={styles.navItem}
          onClick={() => handleScrollToSection('benefits-section')}
        >
          Lợi ích
        </div>
        <div
          className={styles.navItem}
          onClick={() => handleScrollToSection('contact-section')}
        >
          Liên hệ
        </div>
      </div>

      {/* Auth Buttons */}
      <Space size="middle" className={styles.authButtons}>
        <Button
          type="default"
          className={styles.registerButton}
          onClick={handleOpenRegisterModal}
        >
          Đăng ký
        </Button>
        <Button
          type="primary"
          className={styles.loginButton}
          onClick={handleOpenLoginModal}
        >
          Đăng nhập
        </Button>
      </Space>

      {/* Modals */}
      <LoginModal 
        visible={modalType === 'login'} 
        onClose={handleCloseLoginModal}
        onSwitchToRegister={handleOpenRegisterModal}
      />
      
      <RegisterModal 
        visible={modalType === 'register'} 
        onCancel={handleCloseRegisterModal}
        onSwitchToLogin={handleOpenLoginModal}
      />
    </div>
  );
};

export default Header;
