import { Link } from "react-router-dom";
import "./style-footer.css";
import { useEffect, useState } from "react";
import logo from "../../assets/img/logo.png"

const FooterComponent = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 50) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: 30,
          right: 30,
          zIndex: 500,
          cursor: "pointer",
          backgroundColor: "white",
          outline: "none",
          border: "1px solid rgba(148, 148, 148, 0.3)",
          borderRadius: "50%",
          boxShadow: "0px 0px 20px 1px rgba(148, 148, 148, 0.3)",
          transition: "0.5s",
          transform: isVisible ? "translateY(0)" : "translateY(50px)",
          opacity: isVisible ? 1 : 0,
        }}
        onClick={scrollToTop}
        role="button"
        aria-label="Scroll to top"
      >
        <img
          src={logo}
          alt="To Top"
          width={45}
          style={{ borderRadius: "50%" }}
        />
      </div>
      <div
        style={{
          justifyContent: "center",
          color: "gray",
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <img
          src={logo}
          alt=""
          style={{
            width: 45,
            height: 45,
            borderRadius: "50%",
            marginRight: 5,
          }}
        />{" "}
        <i
          className="copyright-admin-footer"
          style={{ color: "#003770", fontWeight: 500 }}
        >
          {" "}
          Developed by{" "}
          <Link
            to={`#`}
            style={{ color: "#003770" }}
            target="_blank"
          >
            <span
              style={{ textDecoration: "underline" }}
              className="digital-services"
            >
              ROYAL JEWELRY
            </span>
          </Link>
        </i>
      </div>
    </>
  );
};

export default FooterComponent;
