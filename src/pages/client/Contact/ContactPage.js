import { Layout, Row, Col, Typography, Card, Form, Input, Button, Space, message } from "antd";
import React from "react";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  SendOutlined,
} from "@ant-design/icons";
import Header from "../HomePage/Header";
import Footer from "../HomePage/Footer";
import styles from "./ContactPage.module.css";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ContactPage = () => {
  const [form] = Form.useForm();

  const contactInfo = [
    {
      icon: <PhoneOutlined style={{ fontSize: 32, color: "#d4af37" }} />,
      title: "Điện thoại",
      content: "0123 456 789",
      description: "Hotline hỗ trợ 24/7",
    },
    {
      icon: <MailOutlined style={{ fontSize: 32, color: "#d4af37" }} />,
      title: "Email",
      content: "support@royaljewelry.com",
      description: "Gửi email trực tiếp cho chúng tôi",
    },
    {
      icon: <EnvironmentOutlined style={{ fontSize: 32, color: "#d4af37" }} />,
      title: "Địa chỉ",
      content: "Số 123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh",
      description: "Ghé thăm showroom trang sức của chúng tôi",
    },
    {
      icon: <ClockCircleOutlined style={{ fontSize: 32, color: "#d4af37" }} />,
      title: "Giờ làm việc",
      content: "Thứ 2 - Chủ nhật: 9:00 - 21:00",
      description: "Mở cửa tất cả các ngày trong tuần",
    },
  ];

  const socialLinks = [
    {
      icon: <FacebookOutlined style={{ fontSize: 24 }} />,
      name: "Facebook",
      url: "https://facebook.com/royaljewelry",
    },
    {
      icon: <InstagramOutlined style={{ fontSize: 24 }} />,
      name: "Instagram",
      url: "https://instagram.com/royaljewelry",
    },
    {
      icon: <YoutubeOutlined style={{ fontSize: 24 }} />,
      name: "Youtube",
      url: "https://youtube.com/royaljewelry",
    },
  ];

  const onFinish = async (values) => {
    try {
      // TODO: Gửi form liên hệ đến backend
      console.log("Form submitted:", values);
      message.success("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.");
      form.resetFields();
    } catch (error) {
      message.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  };

  return (
    <Layout className={styles.layout}>
      <Header />
      <Content className={styles.content}>
        {/* Hero Section */}
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <Text className={styles.brandText}>LIÊN HỆ</Text>
            <Title level={1} className={styles.heroTitle}>
              Liên hệ với chúng tôi
            </Title>
            <Paragraph className={styles.heroSubtitle}>
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy gửi tin nhắn cho chúng tôi
              hoặc liên hệ trực tiếp qua các kênh dưới đây.
            </Paragraph>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className={styles.contactInfoSection}>
          <div className={styles.container}>
            <Row gutter={[24, 24]}>
              {contactInfo.map((info, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <Card className={styles.contactCard} hoverable>
                    <div className={styles.contactIcon}>{info.icon}</div>
                    <Title level={4} className={styles.contactTitle}>
                      {info.title}
                    </Title>
                    <Text className={styles.contactContent}>{info.content}</Text>
                    <Text className={styles.contactDescription}>{info.description}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* Contact Form and Map Section */}
        <div className={styles.formSection}>
          <div className={styles.container}>
            <Row gutter={[48, 48]}>
              <Col xs={24} lg={12}>
                <Card className={styles.formCard}>
                  <Title level={2} className={styles.sectionTitle}>
                    Gửi tin nhắn cho chúng tôi
                  </Title>
                  <Paragraph className={styles.sectionSubtitle}>
                    Điền thông tin vào form bên dưới, chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                  </Paragraph>
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    className={styles.contactForm}
                  >
                    <Form.Item
                      name="name"
                      label="Họ và tên"
                      rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
                    >
                      <Input size="large" placeholder="Nhập họ và tên của bạn" />
                    </Form.Item>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: "Vui lòng nhập email" },
                        { type: "email", message: "Email không hợp lệ" },
                      ]}
                    >
                      <Input size="large" placeholder="Nhập email của bạn" />
                    </Form.Item>
                    <Form.Item
                      name="phone"
                      label="Số điện thoại"
                      rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                    >
                      <Input size="large" placeholder="Nhập số điện thoại của bạn" />
                    </Form.Item>
                    <Form.Item
                      name="subject"
                      label="Chủ đề"
                      rules={[{ required: true, message: "Vui lòng nhập chủ đề" }]}
                    >
                      <Input size="large" placeholder="Nhập chủ đề tin nhắn" />
                    </Form.Item>
                    <Form.Item
                      name="message"
                      label="Nội dung"
                      rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
                    >
                      <TextArea
                        rows={6}
                        placeholder="Nhập nội dung tin nhắn của bạn..."
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        icon={<SendOutlined />}
                        className={styles.submitButton}
                        block
                      >
                        Gửi tin nhắn
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card className={styles.mapCard}>
                  <Title level={2} className={styles.sectionTitle}>
                    Vị trí cửa hàng
                  </Title>
                  <Paragraph className={styles.sectionSubtitle}>
                    Ghé thăm cửa hàng của chúng tôi để trải nghiệm sản phẩm trực tiếp.
                  </Paragraph>
                  <div className={styles.mapContainer}>
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1268847143!2d106.6296633152604!3d10.823009392304!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752a4b8b8b8b8b%3A0x8b8b8b8b8b8b8b8b!2sHo%20Chi%20Minh%20City!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
                      width="100%"
                      height="400"
                      style={{ border: 0, borderRadius: "12px" }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Cửa hàng ROYAL JEWELRY"
                    ></iframe>
                  </div>
                  <div className={styles.mapInfo}>
                    <Text className={styles.mapAddress}>
                      <EnvironmentOutlined style={{ marginRight: 8, color: "#d4af37" }} />
                      123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
                    </Text>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </div>

        {/* Social Media Section */}
        <div className={styles.socialSection}>
          <div className={styles.container}>
            <Title level={2} className={styles.sectionTitle} style={{ textAlign: "center", marginBottom: 16 }}>
              Theo dõi chúng tôi
            </Title>
            <Text className={styles.sectionSubtitle} style={{ textAlign: "center", display: "block", marginBottom: 32 }}>
              Kết nối với chúng tôi trên các mạng xã hội để cập nhật những sản phẩm mới nhất
            </Text>
            <div className={styles.socialLinks}>
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  <div className={styles.socialIcon}>{social.icon}</div>
                  <Text className={styles.socialName}>{social.name}</Text>
                </a>
              ))}
            </div>
          </div>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default ContactPage;

