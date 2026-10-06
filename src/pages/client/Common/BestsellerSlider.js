import React from "react";
import { Button, Typography } from "antd";
import { LeftOutlined, RightOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import styles from "../Product/ProductDetailPage.module.css";

const { Text, Title } = Typography;

/**
 * Reusable horizontal slider for bestseller/suggestion products.
 * Props:
 * - title: string heading
 * - products: Array<{ id, name, price, originalPrice?, image, brand?, discount? }>
 * - onCardClick(product): called when product card is clicked
 * - onAdd(product): called when add-to-cart pressed
 * - dataImgPrefix: string prefix for data-product-img to support fly-to-cart animations
 */
const BestsellerSlider = ({ title = "SẢN PHẨM BÁN CHẠY", products = [], onCardClick, onAdd, dataImgPrefix = "best" }) => {
  const ref = React.useRef(null);
  const scroll = (dir) => {
    if (!ref.current) return;
    const amount = 300;
    ref.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const renderCard = (p, key) => (
    <div key={key} className={styles.horizontalProductCard}>
      <div className={styles.productCard} onClick={() => onCardClick && onCardClick(p)}>
        <div className={styles.productImageContainer}>
          <img
            src={p.image}
            alt={p.name}
            className={styles.productImage}
            data-product-img={`${dataImgPrefix}-${p.id}`}
          />
          <div className={styles.productBadges}>
            <div className={styles.bestsellerBadge}>BÁN CHẠY</div>
            {p.discount ? <div className={styles.discountBadge}>-{p.discount}%</div> : null}
          </div>
          <Button
            type="default"
            shape="circle"
            icon={<ShoppingCartOutlined />}
            className={`${styles.addToCartButton} ${styles.addToCartFixed}`}
            onClick={(e) => { e.stopPropagation(); onAdd && onAdd(p); }}
          />
        </div>
        <div className={styles.productInfo}>
          {p.brand ? <Text className={styles.productBrand}>{p.brand}</Text> : null}
          <Text className={styles.productName}>{p.name}</Text>
          <div className={styles.productPriceContainer}>
            <Text className={styles.productPrice}>{((Math.round(p.price || 0)) * 1000).toLocaleString()} đ</Text>
            {p.originalPrice ? (
              <Text className={styles.originalPrice}>{((Math.round(p.originalPrice)) * 1000).toLocaleString()} đ</Text>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {title ? <Title level={4} style={{ marginBottom: 12 }}>{title}</Title> : null}
      <div className={styles.hsContainer}>
        <Button className={styles.hsNavBtn} icon={<LeftOutlined />} onClick={() => scroll("left")} />
        <div className={styles.hsWrapper} ref={ref}>
          <div className={styles.hsContent}>
            {products.map((p) => renderCard(p, p.id))}
            {products.map((p) => renderCard(p, `dup-${p.id}`))}
          </div>
        </div>
        <Button className={styles.hsNavBtn} icon={<RightOutlined />} onClick={() => scroll("right")} />
      </div>
    </div>
  );
};

export default BestsellerSlider;


