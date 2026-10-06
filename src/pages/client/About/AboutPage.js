import { Layout, Row, Col, Typography, Card, Space, Button } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingOutlined,
  TrophyOutlined,
  HeartOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  StarOutlined,
  SafetyOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import Header from "../HomePage/Header";
import Footer from "../HomePage/Footer";
import styles from "./AboutPage.module.css";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const AboutPage = () => {
  const navigate = useNavigate();
  const iconStyle = { fontSize: 48, color: "#d4af37" };

  const features = [
    {
      icon: SafetyOutlined,
      title: "Sản phẩm chính hãng",
      description: "100% sản phẩm chính hãng từ các thương hiệu nổi tiếng thế giới với đầy đủ giấy tờ chứng minh nguồn gốc",
    },
    {
      icon: TrophyOutlined,
      title: "Chất lượng đảm bảo",
      description: "Cam kết chất lượng sản phẩm và dịch vụ tốt nhất cho khách hàng với chính sách bảo hành rõ ràng",
    },
    {
      icon: CustomerServiceOutlined,
      title: "Phục vụ tận tâm",
      description: "Đội ngũ nhân viên chuyên nghiệp, tư vấn nhiệt tình và chu đáo, hỗ trợ 24/7",
    },
    {
      icon: TeamOutlined,
      title: "Cộng đồng lớn mạnh",
      description: "Hơn 10,000 khách hàng tin tưởng và lựa chọn chúng tôi, xây dựng cộng đồng yêu thích trang sức vượng mạnh",
    },
  ];

  const values = [
    {
      icon: CheckCircleOutlined,
      title: "Uy tín",
      description: "Xây dựng niềm tin qua từng sản phẩm và dịch vụ, minh bạch trong mọi giao dịch",
    },
    {
      icon: CheckCircleOutlined,
      title: "Chất lượng",
      description: "Chỉ bán những sản phẩm đạt tiêu chuẩn cao nhất, kiểm tra kỹ lưỡng trước khi đến tay khách hàng",
    },
    {
      icon: CheckCircleOutlined,
      title: "Đổi mới",
      description: "Luôn cập nhật xu hướng và sản phẩm mới nhất từ các thương hiệu hàng đầu thế giới",
    },
    {
      icon: CheckCircleOutlined,
      title: "Khách hàng",
      description: "Đặt lợi ích khách hàng lên hàng đầu, lắng nghe và cải thiện dịch vụ không ngừng",
    },
  ];

  return (
    <Layout className={styles.layout}>
      <Header />
      <Content className={styles.content}>
        {/* Hero Section */}
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <Text className={styles.brandText}>ROYAL JEWELRY</Text>
            <Title level={1} className={styles.heroTitle}>
              Về <span className={styles.highlight}>ROYAL JEWELRY</span>
            </Title>
            <Paragraph className={styles.heroSubtitle}>
              Điểm đến tin cậy cho những món trang sức chính hãng chất lượng cao.
              Chúng tôi cam kết mang đến trải nghiệm mua sắm tuyệt vời nhất.
            </Paragraph>
            <Button
              type="primary"
              size="large"
              className={styles.exploreButton}
              onClick={() => navigate('/products')}
            >
              Khám phá sản phẩm
            </Button>
          </div>
        </div>

        {/* Story Section */}
        <div className={styles.section}>
          <div className={styles.container}>
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} lg={12}>
                <Title level={2} className={styles.sectionTitle}>
                  Câu chuyện của chúng tôi
                </Title>
                <Paragraph className={styles.paragraph}>
                  ROYAL JEWELRY được thành lập với sứ mệnh mang đến cho người tiêu dùng Việt Nam
                  những món trang sức chính hãng chất lượng cao từ các thương hiệu hàng đầu thế giới
                  với sự tinh tế và đẳng cấp vượt thời gian.
                </Paragraph>
                <Paragraph className={styles.paragraph}>
                  Với hơn 10 năm kinh nghiệm trong ngành, chúng tôi tự hào là địa chỉ tin cậy của hàng nghìn
                  khách hàng yêu thích trang sức. Chúng tôi cam kết chỉ bán sản phẩm chính hãng 100%,
                  có đầy đủ giấy tờ chứng minh nguồn gốc và kiểm định chất lượng đá quý.
                </Paragraph>
                <Paragraph className={styles.paragraph}>
                  Đội ngũ nghệ nhân và nhân viên của chúng tôi luôn nỗ lực không ngừng để mang đến trải nghiệm mua sắm tốt nhất,
                  từ việc tư vấn chọn mẫu mã phù hợp đến chính sách bảo hành, làm mới trang sức trọn đời và dịch vụ chăm sóc
                  khách hàng tận tâm.
                </Paragraph>
              </Col>
              <Col xs={24} lg={12}>
                <div className={styles.imageContainer}>
                  <img
                    src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                    alt="About Us"
                    className={styles.aboutImage}
                  />
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* Features Section */}
        <div className={styles.featuresSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <Title level={2} className={styles.sectionTitle}>
                Tại sao chọn ROYAL JEWELRY?
              </Title>
              <Text className={styles.sectionSubtitle}>
                Những lý do khiến chúng tôi trở thành lựa chọn hàng đầu của khách hàng
              </Text>
            </div>
            <Row gutter={[24, 24]}>
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Col xs={24} sm={12} lg={6} key={index}>
                    <Card className={styles.featureCard} hoverable>
                      <div className={styles.featureIcon}>
                        <IconComponent style={iconStyle} />
                      </div>
                      <Title level={4} className={styles.featureTitle}>
                        {feature.title}
                      </Title>
                      <Text className={styles.featureDescription}>{feature.description}</Text>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </div>
        </div>

        {/* Values Section */}
        <div className={styles.valuesSection}>
          <div className={styles.container}>
            <Row gutter={[48, 48]}>
              <Col xs={24} lg={12}>
                <div className={styles.imageContainer}>
                  <img
                    src="https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                    alt="Our Values"
                    className={styles.aboutImage}
                  />
                </div>
              </Col>
              <Col xs={24} lg={12}>
                <Title level={2} className={styles.sectionTitle}>
                  Giá trị cốt lõi
                </Title>
                <Space direction="vertical" size="large" style={{ width: "100%" }}>
                  {values.map((value, index) => {
                    const IconComponent = value.icon;
                    return (
                      <div key={index} className={styles.valueItem}>
                        <IconComponent style={{ fontSize: 24, color: "#d4af37", marginRight: 16 }} />
                        <div>
                          <Title level={4} className={styles.valueTitle}>
                            {value.title}
                          </Title>
                          <Text className={styles.valueDescription}>{value.description}</Text>
                        </div>
                      </div>
                    );
                  })}
                </Space>
              </Col>
            </Row>
          </div>
        </div>

        {/* Mission Section */}
        <div className={styles.missionSection}>
          <div className={styles.container}>
            <Card className={styles.missionCard}>
              <Title level={2} className={styles.sectionTitle} style={{ textAlign: "center", marginBottom: 24 }}>
                Sứ mệnh của chúng tôi
              </Title>
              <Paragraph className={styles.missionText}>
                ROYAL JEWELRY cam kết mang đến cho khách hàng những sản phẩm trang sức chính hãng chất lượng cao,
                giá cả hợp lý cùng dịch vụ chăm sóc khách hàng tận tâm. Chúng tôi không chỉ bán trang sức,
                mà còn mang đến cho bạn niềm đam mê, phong cách và sự quý phái độc bản.
              </Paragraph>
              <Paragraph className={styles.missionText}>
                Với phương châm <strong>"Đảm bảo chất lượng, khách hàng là bạn"</strong>, chúng tôi luôn đặt lợi ích
                và trải nghiệm của khách hàng lên hàng đầu, xây dựng một cộng đồng yêu thích trang sức vượng mạnh
                và phát triển bền vững.
              </Paragraph>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        {/* <div className={styles.statsSection}>
          <div className={styles.container}>
            <Title level={2} className={styles.statsTitle}>
              Thành tựu của chúng tôi
            </Title>
            <Row gutter={[32, 32]}>
              <Col xs={12} sm={6}>
                <div className={styles.statItem}>
                  <Title level={1} className={styles.statNumber}>
                    10,000+
                  </Title>
                  <Text className={styles.statLabel}>Khách hàng tin tưởng</Text>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className={styles.statItem}>
                  <Title level={1} className={styles.statNumber}>
                    5+
                  </Title>
                  <Text className={styles.statLabel}>Năm kinh nghiệm</Text>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className={styles.statItem}>
                  <Title level={1} className={styles.statNumber}>
                    100%
                  </Title>
                  <Text className={styles.statLabel}>Sản phẩm chính hãng</Text>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className={styles.statItem}>
                  <Title level={1} className={styles.statNumber}>
                    4.8
                    <StarOutlined style={{ fontSize: 24, color: "#FFD700", marginLeft: 8 }} />
                  </Title>
                  <Text className={styles.statLabel}>Đánh giá trung bình</Text>
                </div>
              </Col>
            </Row>
          </div>
        </div> */}
      </Content>
      <Footer />
    </Layout>
  );
};

export default AboutPage;
