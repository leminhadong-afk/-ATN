import { Tooltip } from "antd";
import "./style-image.css";
import { memo } from "react";
import LogoDefault from "../../assets/img/default-featured-image.png.jpg";

const Image = ({ url, picxel, marginRight, name }) => {
  return (
    <Tooltip title={name}>
      <img
        src={url ? url : LogoDefault}
        style={{
          width: picxel + "px",
          height: picxel + "px",
          marginRight: marginRight + "px",
          border: "2px solid rgb(235, 235, 235)",
        }}
        className="image_common"
        alt="."
      />
    </Tooltip>
  );
};

export default memo(Image);
