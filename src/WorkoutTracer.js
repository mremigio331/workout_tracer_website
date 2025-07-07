import React, { useState } from "react";
import { Layout, Alert } from "antd";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/home/Home";
import UserProfile from "./pages/user/UserProfile";
import PublicUsers from "./pages/user/PublicUsers";
import PublicUserTracer from "./pages/home/PublicUserTracer";
import PageNavigationBar from "./components/PageNavigationBar";
import { UserAuthenticationContext } from "./provider/UserAuthenticationProvider";

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
      <Route path="/users" element={<PublicUsers />} />
      <Route path="/users/:stravaId" element={<PublicUserTracer />} />
    </Routes>
  );
};

const WorkoutTracer = () => {
  const notifications = [];
  const [sideCollapsed, setSideCollapsed] = useState(true);
  const [sideHidden, setSideHidden] = useState(false);

  // Get authentication status
  const { isAuthenticated } = React.useContext(UserAuthenticationContext);

  const SIDENAV_WIDTH = 180;
  const SIDENAV_COLLAPSED_WIDTH = 80;

  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        {isAuthenticated && !sideHidden && (
          <PageNavigationBar
            collapsed={sideCollapsed}
            setCollapsed={setSideCollapsed}
          />
        )}
        <Layout>
          <Header
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1001,
              width: "100%",
              height: 64,
              padding: 0,
              margin: 0,
              background: "#001529",
              display: "flex",
              alignItems: "center",
              border: "none",
              boxShadow: "none",
              boxSizing: "border-box",
            }}
          >
            <Navbar />
            {/* Button to hide/show sidebar */}
            <button
              onClick={() => setSideHidden((h) => !h)}
              style={{
                marginLeft: 16,
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: 4,
                padding: "4px 12px",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: 14,
                float: "right",
              }}
            >
              {sideHidden ? "Show Sidebar" : "Hide Sidebar"}
            </button>
          </Header>
          <NotificationBar notifications={notifications} />
          <Content
            style={{
              padding: 0,
              margin: 0,
              boxSizing: "border-box",
              width: "100%",
              maxWidth: "100vw",
              overflowX: "hidden",
              minHeight: "calc(100vh - 64px)",
              transition: "all 0.2s",
            }}
          >
            <PageRoutes />
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

export default WorkoutTracer;
