import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Rate, Progress, Table, Spin, Avatar, Tag, Space } from "antd";
import { StarFilled, MessageOutlined, TrophyOutlined, LikeOutlined } from "@ant-design/icons";
import { AdminReviewApi } from "../../api/admin/review/AdminReviewApi";
import styles from "./AnalysisManagement.module.css";

const { Title, Text } = Typography;

const ReviewAnalysisSection = () => {
  const [stat, setStat] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStat = async () => {
    setLoading(true);
    try {
      const res = await AdminReviewApi.getReviewStatistics();
      if (res && res.data) {
        setStat(res.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thống kê đánh giá:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStat();
  }, []);

  if (loading) {
    return (
      <Card style={{ marginTop: 24, borderRadius: 16 }}>
        <Spin spinning={true} tip="Đang tải thống kê đánh giá..." />
      </Card>
    );
  }

  const total = stat?.totalReviews || 0;
  const avg = stat?.averageRating || 0.0;

  const topProductColumns = [
    {
      title: "#",
      key: "rank",
      width: 50,
      render: (_, __, idx) => (
        <span style={{ fontWeight: "bold", color: idx < 3 ? "#d4b106" : "#8c8c8c" }}>
          {idx + 1}
        </span>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (text) => <span style={{ fontWeight: 600, color: "#1a365d" }}>{text}</span>,
    },
    {
      title: "Điểm TB",
      dataIndex: "averageStar",
      key: "averageStar",
      align: "center",
      render: (val) => (
        <Space>
          <Rate disabled allowHalf value={val} style={{ fontSize: 13, color: "#fadb14" }} />
          <Text strong style={{ color: "#d4b106" }}>{val ? val.toFixed(1) : 0}</Text>
        </Space>
      ),
    },
    {
      title: "Số lượt đánh giá",
      dataIndex: "totalReviews",
      key: "totalReviews",
      align: "center",
      render: (count) => <Tag color="blue">{count} đánh giá</Tag>,
    },
  ];

  const calcPercent = (count) => {
    if (!total || total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div style={{ marginTop: 32 }}>
      <Title level={3} style={{ marginBottom: 20, color: "#1a365d" }}>
        <MessageOutlined style={{ marginRight: 10, color: "#c59b27" }} />
        Thống Kê Đánh Giá & Nhận Xét Sản Phẩm
      </Title>

      {/* Top 4 stat summary boxes */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 12, borderLeft: "4px solid #c59b27", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <Text type="secondary">Tổng số đánh giá</Text>
            <div style={{ fontSize: 28, fontWeight: "bold", color: "#1a365d", marginTop: 4 }}>
              {total}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 12, borderLeft: "4px solid #fadb14", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <Text type="secondary">Điểm đánh giá TB</Text>
            <div style={{ fontSize: 28, fontWeight: "bold", color: "#d4b106", marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
              {avg.toFixed(1)} / 5.0
              <StarFilled style={{ fontSize: 22, color: "#fadb14" }} />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 12, borderLeft: "4px solid #52c41a", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <Text type="secondary">Đánh giá 5 sao</Text>
            <div style={{ fontSize: 28, fontWeight: "bold", color: "#52c41a", marginTop: 4 }}>
              {stat?.star5Count || 0}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 12, borderLeft: "4px solid #ff4d4f", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <Text type="secondary">Đánh giá 1-2 sao</Text>
            <div style={{ fontSize: 28, fontWeight: "bold", color: "#ff4d4f", marginTop: 4 }}>
              {(stat?.star1Count || 0) + (stat?.star2Count || 0)}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Breakdown & Top Rated Products Grid */}
      <Row gutter={[24, 24]}>
        {/* Left Star Distribution */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <LikeOutlined style={{ color: "#c59b27" }} />
                <span>Phân bổ tỉ lệ sao</span>
              </Space>
            }
            style={{ borderRadius: 12, height: "100%", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            {[5, 4, 3, 2, 1].map((s) => {
              const count = stat?.[`star${s}Count`] || 0;
              const percent = calcPercent(count);
              return (
                <div key={s} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text strong>{s} sao</Text>
                    <Text type="secondary">{count} lượt ({percent}%)</Text>
                  </div>
                  <Progress percent={percent} strokeColor="#fadb14" trailColor="#f0f0f0" showInfo={false} />
                </div>
              );
            })}
          </Card>
        </Col>

        {/* Right Top Rated Products */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <TrophyOutlined style={{ color: "#d4b106" }} />
                <span>Top Sản phẩm được đánh giá cao nhất</span>
              </Space>
            }
            style={{ borderRadius: 12, height: "100%", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <Table
              dataSource={stat?.topRatedProducts || []}
              columns={topProductColumns}
              rowKey="productId"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReviewAnalysisSection;
