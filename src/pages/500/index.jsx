import React from "react";
import { Result, Button } from "antd";
import { Link } from "react-router-dom";

function Oops() {
  return (
    <Result
      status="500"
      title="Oops"
      extra={
        <Link to={"/"}>
          <Button type="primary">Đăng nhập lại</Button>
        </Link>
      }
    />
  );
}

export default Oops;
