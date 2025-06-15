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
        {/* Move NotificationBar outside of Header for better stacking and to avoid unnecessary rerenders */}
        <Header
          style={{
            position: "fixed",
            top: 0,
            zIndex: 1001,
            width: "100%",
            height: 64,
            padding: 0,
            background: "#001529",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Navbar />
        </Header>
        <NotificationBar notifications={notifications} />
        {/* Add paddingTop to push content below fixed header */}
        <Layout style={{ paddingTop: 64 }}>
          <Content style={{ padding: "24px", marginTop: 0 }}>
            <PageRoutes />
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

export default WorkoutTracer;
