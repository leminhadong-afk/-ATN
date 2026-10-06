import { useEffect, useState } from "react";
import "./style-container-component.css";

const ContainerComponent = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const padding = isMobile ? 0 : 30;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  
  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: 12,
        padding: padding,
        boxShadow: "0px 0px 20px 1px rgba(148, 148, 148, 0.3)",
      }}
      className="container-component"
    >
      {children}
    </div>
  );
};

export default ContainerComponent;
