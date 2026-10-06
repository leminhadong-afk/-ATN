import React, { useEffect, useState } from "react";
import { Rate, Progress, Avatar, Tag, Pagination, Image, Space, Typography, Card, Spin, Button, message } from "antd";
import { UserOutlined, StarFilled, MessageOutlined, FormOutlined } from "@ant-design/icons";
import { ReviewApi } from "../../../api/client/review/ReviewApi";
import CreateReviewModal from "../MyOrder/CreateReviewModal";
import { isTokenExpired } from "../../../util/common/utils";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

const ProductReviewSection = ({ productId, productName, onRequireLogin }) => {
  const [stat, setStat] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedStar, setSelectedStar] = useState(null);
  const [page, setPage] = useState(1);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const pageSize = 5;

  const fetchStat = async () => {
    try {
      const res = await ReviewApi.getProductReviewStat(productId);
      if (res && res.data) {
        setStat(res.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải thống kê đánh giá:", error);
    }
  };

  const fetchReviews = async (p = 1, starFilter = selectedStar) => {
    setLoading(true);
    try {
      const params = {
        page: p - 1,
        size: pageSize,
      };
      if (starFilter) {
        params.star = starFilter;
      }
      const res = await ReviewApi.getProductReviews(productId, params);
      if (res && res.data) {
        setReviews(res.data.content || []);
        setTotal(res.data.totalElements || 0);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách đánh giá:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchStat();
      fetchReviews(1, null);
    }
  }, [productId]);

  const handleOpenReviewModal = () => {
    const token = localStorage.getItem("token");
    if (!token || isTokenExpired(token)) {
      message.warning("Vui lòng đăng nhập để gửi đánh giá cho sản phẩm này!");
      if (onRequireLogin) {
        onRequireLogin();
      }
      return;
    }
    setReviewModalOpen(true);
  };

  const handleStarFilter = (star) => {
    const newStar = selectedStar === star ? null : star;
    setSelectedStar(newStar);
    setPage(1);
    fetchReviews(1, newStar);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchReviews(newPage, selectedStar);
  };

  if (!productId) return null;

  const totalReviews = stat?.totalReviews || 0;
  const avgStar = stat?.averageStar || 0.0;

  const calcPercent = (count) => {
    if (!totalReviews || totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  return (
    <Card style={{ marginTop: 32, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontSize: 20 }}>
          Đánh Giá & Nhận Xét Từ Khách Hàng
        </Title>
        <Button
          type="primary"
          icon={<FormOutlined />}
          style={{ backgroundColor: "#c59b27", borderColor: "#c59b27", borderRadius: 8 }}
          onClick={handleOpenReviewModal}
        >
          Viết đánh giá
        </Button>
      </div>

      {/* Overview Stat Section */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 32,
          padding: "24px",
          backgroundColor: "#fafafa",
          borderRadius: 12,
          marginBottom: 24,
        }}
      >
        {/* Left score */}
        <div style={{ textAlign: "center", minWidth: 140 }}>
          <div style={{ fontSize: 44, fontWeight: "bold", color: "#d4b106", lineHeight: 1 }}>
            {avgStar.toFixed(1)}
          </div>
          <div style={{ margin: "8px 0" }}>
            <Rate disabled allowHalf value={avgStar} style={{ fontSize: 18, color: "#fadb14" }} />
          </div>
          <Text type="secondary">{totalReviews} lượt đánh giá</Text>
        </div>

        {/* Right breakdown bars */}
        <div style={{ flex: 1, minWidth: 260 }}>
          {[5, 4, 3, 2, 1].map((starNum) => {
            const count = stat?.[`star${starNum}Count`] || 0;
            const percent = calcPercent(count);
            return (
              <div
                key={starNum}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 6,
                  cursor: "pointer",
                }}
                onClick={() => handleStarFilter(starNum)}
              >
                <Text style={{ width: 40, fontSize: 13 }}>{starNum} sao</Text>
                <Progress
                  percent={percent}
                  strokeColor="#fadb14"
                  trailColor="#e8e8e8"
                  showInfo={false}
                  style={{ flex: 1, margin: 0 }}
                />
                <Text type="secondary" style={{ width: 45, textAlign: "right", fontSize: 12 }}>
                  {count}
                </Text>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{ marginBottom: 24, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button
          type={selectedStar === null ? "primary" : "default"}
          shape="round"
          onClick={() => handleStarFilter(null)}
          style={{ backgroundColor: selectedStar === null ? "#c59b27" : undefined, borderColor: "#c59b27" }}
        >
          Tất cả ({totalReviews})
        </Button>
        {[5, 4, 3, 2, 1].map((s) => {
          const count = stat?.[`star${s}Count`] || 0;
          return (
            <Button
              key={s}
              type={selectedStar === s ? "primary" : "default"}
              shape="round"
              onClick={() => handleStarFilter(s)}
              icon={<StarFilled style={{ color: selectedStar === s ? "#fff" : "#fadb14" }} />}
              style={{
                backgroundColor: selectedStar === s ? "#c59b27" : undefined,
                borderColor: selectedStar === s ? "#c59b27" : undefined,
              }}
            >
              {s} sao ({count})
            </Button>
          );
        })}
      </div>

      {/* Review List */}
      <Spin spinning={loading}>
        {reviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#8c8c8c" }}>
            <MessageOutlined style={{ fontSize: 36, marginBottom: 12 }} />
            <div>Chưa có đánh giá nào. Hãy là người đầu tiên nhận xét về sản phẩm này!</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {reviews.map((rev) => {
              const imageList = rev.images
                ? (rev.images.includes("|||") ? rev.images.split("|||") : rev.images.split(","))
                    .map((img) => img.trim())
                    .filter((img) => img && !img.startsWith("blob:") && (!img.startsWith("data:image") || img.length > 200))
                : [];
              return (
                <div
                  key={rev.id}
                  style={{
                    padding: 16,
                    borderBottom: "1px solid #f0f0f0",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {/* User info & rating header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Space size={12}>
                      <Avatar
                        src={rev.customerAvatar}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: "#c59b27" }}
                      />
                      <div>
                        <Text strong style={{ fontSize: 14 }}>
                          {rev.customerName || "Khách hàng"}
                        </Text>
                        {rev.billId ? (
                          <Tag color="green" style={{ marginLeft: 8, fontSize: 11 }}>
                            Đã mua hàng
                          </Tag>
                        ) : (
                          <Tag color="blue" style={{ marginLeft: 8, fontSize: 11 }}>
                            Khách hàng
                          </Tag>
                        )}
                        <div>
                          <Rate disabled value={rev.star} style={{ fontSize: 13, color: "#fadb14" }} />
                        </div>
                      </div>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {rev.createdDate ? dayjs(rev.createdDate).format("DD/MM/YYYY HH:mm") : ""}
                    </Text>
                  </div>

                  {/* Comment Content */}
                  <Paragraph style={{ margin: 0, color: "#262626", fontSize: 14 }}>
                    {rev.comment}
                  </Paragraph>

                  {/* Images */}
                  {imageList.length > 0 && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                      <Image.PreviewGroup>
                        {imageList.map((imgUrl, idx) => (
                          <Image
                            key={idx}
                            src={imgUrl}
                            width={72}
                            height={72}
                            style={{ objectFit: "cover", borderRadius: 8 }}
                          />
                        ))}
                      </Image.PreviewGroup>
                    </div>
                  )}

                  {/* Shop Reply Box */}
                  {rev.reply && (
                    <div
                      style={{
                        backgroundColor: "#f6f6f6",
                        padding: "12px 16px",
                        borderRadius: 8,
                        marginTop: 4,
                        borderLeft: "3px solid #c59b27",
                      }}
                    >
                      <Text strong style={{ color: "#c59b27", fontSize: 13 }}>
                        Phản hồi từ Cửa hàng
                      </Text>
                      <Paragraph style={{ margin: "4px 0 0 0", color: "#595959", fontSize: 13 }}>
                        {rev.reply}
                      </Paragraph>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {total > pageSize && (
          <div style={{ marginTop: 24, textAlign: "right" }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        )}
      </Spin>

      {/* Modal viết đánh giá trực tiếp tại trang sản phẩm */}
      {reviewModalOpen && (
        <CreateReviewModal
          open={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          productId={productId}
          productName={productName || "Sản phẩm trang sức"}
          onSuccess={() => {
            message.success("Cảm ơn bạn đã gửi đánh giá cho sản phẩm!");
            fetchStat();
            fetchReviews(1, selectedStar);
          }}
        />
      )}
    </Card>
  );
};

export default ProductReviewSection;
