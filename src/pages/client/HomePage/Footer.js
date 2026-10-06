import React, { useState } from "react";
import { Button, Input, message } from "antd";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) {
      message.warning("Vui lòng nhập email của bạn");
      return;
    }
    message.success("Cảm ơn bạn đã đăng ký nhận tin từ ROYAL JEWELRY!");
    setEmail("");
  };

  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerInner}>
        {/* Brand Header */}
        <div className={styles.footerBrandSection}>
          <div className={styles.footerLogo}>ROYAL JEWELRY</div>
          <div className={styles.footerTagline}>NEW YORK • PARIS • GENEVA • HANOI</div>
        </div>

        {/* 4 Columns Grid */}
        <div className={styles.footerGrid}>
          <div>
            <div className={styles.footerColTitle}>Trang Sức Cao Cấp</div>
            <ul className={styles.footerList}>
              <li><Link to="/products?category=diamond">Kiệt Tác Kim Cương</Link></li>
              <li><Link to="/products?category=high-jewelry">Bộ Sưu Tập Cluster</Link></li>
              <li><Link to="/products?category=emerald">Ngọc Bảo & Sapphire</Link></li>
              <li><Link to="/products?category=rare">Đá Quý Hiếm Thế Giới</Link></li>
            </ul>
          </div>

          <div>
            <div className={styles.footerColTitle}>Trang Sức Cưới & Đính Hôn</div>
            <ul className={styles.footerList}>
              <li><Link to="/products?category=engagement">Nhẫn Đính Hôn Kim Cương</Link></li>
              <li><Link to="/products?category=wedding">Nhẫn Cưới Đôi Chế Tác</Link></li>
              <li><Link to="/products?category=bridal">Trang Sức Ngày Cưới</Link></li>
              <li><Link to="/contact">Tư Vấn Showroom Đặc Quyền</Link></li>
            </ul>
          </div>

          <div>
            <div className={styles.footerColTitle}>Chăm Sóc Khách Hàng</div>
            <ul className={styles.footerList}>
              <li><Link to="/contact">Tìm Showroom Gần Bạn</Link></li>
              <li><Link to="/contact">Đặt Lịch Hẹn Tư Vấn</Link></li>
              <li><Link to="/about">Bảo Dưỡng & Vệ Sinh Trang Sức</Link></li>
              <li><Link to="/about">Giấy Chứng Nhận & Bảo Hành</Link></li>
            </ul>
          </div>

          <div>
            <div className={styles.footerColTitle}>Đăng Ký Nhận Information</div>
            <p className={styles.newsletterDesc}>
              Đăng ký để nhận thông tin về các bộ sưu tập mới nhất và đặc quyền ưu đãi từ ROYAL JEWELRY.
            </p>
            <form onSubmit={handleSubscribe} className={styles.newsletterInputWrapper}>
              <input
                type="email"
                placeholder="Email của bạn..."
                className={styles.newsletterInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="primary" htmlType="submit" className={styles.newsletterBtn}>
                Gửi
              </Button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={styles.footerBottom}>
          <div className={styles.copyrightText}>
            Bản quyền © 2026 ROYAL JEWELRY. Tất cả các quyền được bảo lưu.
          </div>
          <div className={styles.footerLegalLinks}>
            <Link to="/about">Chính Sách Bảo Mật</Link>
            <Link to="/about">Điều Khoản Sử Dụng</Link>
            <Link to="/contact">Liên Hệ Showroom</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


