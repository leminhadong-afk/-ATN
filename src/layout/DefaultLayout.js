import React, { useState } from "react";
import { Layout, Space } from "antd";
import "./style-default-layout.css";
import { useAppDispatch, useAppSelector } from "../app/hook";
import {
  GetAdCollapsed,
  Toggle,
} from "../app/reducer/admin/AdCollapsedSlice.reducer";
import SidebarComponent from "./sidebar/SidebarComponent";
import HeaderComponent from "./header/HeaderComponent";
import FooterComponent from "./footer/FooterComponent";

const { Content, Sider } = Layout;

const DefaultLayout = ({ children }) => {
  const collapsed = useAppSelector(GetAdCollapsed);
  const dispatch = useAppDispatch();

  const toggleCollapsed = () => {
    dispatch(Toggle(!collapsed));
  };

  document.querySelector("body").style.backgroundImage = "url()";

  return (
    <Layout className="adminLayout" style={{ minHeight: "100vh", backgroundColor: "white" }}>
      <SidebarComponent
        collapsed={collapsed}
        toggleCollapsed={toggleCollapsed}
      />
      <Layout
        style={{
          transition: "margin-left 0.2s",
          minHeight: "100vh",
          marginLeft: collapsed ? 80 : 250,
        }}
      >
        <HeaderComponent
          collapsed={collapsed}
          toggleCollapsed={toggleCollapsed}
        />
        <Content
          style={{
            backgroundColor: "#f8f8f8",
            minHeight: "calc(100vh - 50px)",
            padding: 30,
            paddingTop: 80,
            transition: "0.25s",
          }}
        >
          {children}
          <div style={{ marginTop: 50 }}>
            <FooterComponent />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DefaultLayout;
