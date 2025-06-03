import React from "react";
import { Layout, Alert } from "antd";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/home/Home";
import UserProfile from "./pages/user/UserProfile";

const { Header, Content } = Layout;

const NotificationBar = ({ notifications }) =>
  notifications && notifications.length > 0 ? (
    <div style={{ position: "sticky", top: 0, zIndex: 1002 }}>
      {notifications.map((n, i) => (
        <Alert key={i} message={n.message} type={n.type || "info"} showIcon />
      ))}
    </div>
  ) : null;

const PageRoutes = () => {
  const location = useLocation();

  return (
    <Routes location={location}>
      <Route path="/" element={<Home />} />
      <Route path="/user/profile" element={<UserProfile />} />
    </Routes>
  );
};

const WorkoutTracer = () => {
  const notifications = [];

  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        <Header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1001,
            width: "100%",
            padding: 0,
          }}
        >
          <Navbar />
        </Header>
        <NotificationBar notifications={notifications} />
        <Layout>
          <Content style={{ padding: "50px", marginTop: "24px" }}>
            <PageRoutes />
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

export default WorkoutTracer;
