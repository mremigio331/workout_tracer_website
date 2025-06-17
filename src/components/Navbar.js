import React, { useContext, useState, useEffect, useMemo } from "react";
import { Layout, Menu, Button, Avatar } from "antd";
import { Link } from "react-router-dom";
import { UserAuthenticationContext } from "../provider/UserAuthenticationProvider";
import { useStravaProfile } from "../provider/UserStravaProvider";
import getStage from "../utility/getStage";
import logo from "../assets/workout_tracer.png"; // Import your logo
import { useMediaQuery } from "react-responsive";
const { Header } = Layout;

const Navbar = () => {
  const {
    user,
    nickname,
    isAuthenticated,
    initiateSignIn,
    initiateSignUp,
    logoutUser,
  } = useContext(UserAuthenticationContext);
  const [current, setCurrent] = useState("home");
  const { stravaProfile } = useStravaProfile();

  const stage = getStage();
  console.log("Current Stage:", stage);

  const siteName = useMemo(() => {
    return stage.toLowerCase() != "prod"
      ? `${stage} Workout Tracer`
      : "Workout Tracer";
  }, [stage]);

  // State for avatar image
  const [avatarImg, setAvatarImg] = useState(null);

  useEffect(() => {
    if (stravaProfile && stravaProfile.profile_medium) {
      setAvatarImg(stravaProfile.profile_medium);
    } else {
      setAvatarImg(null);
    }
  }, [stravaProfile]);

  const onClick = (e) => {
    console.log("click ", e);
    setCurrent(e.key);
  };

  const items = [
    {
      label: (
        <Link to="/" style={{ color: "white", textDecoration: "none" }}>
          {siteName}
        </Link>
      ),
      key: "home",
    },
    isAuthenticated
      ? {
          label: (
            <span>
              <Avatar
                style={{ backgroundColor: "#87d068" }}
                src={avatarImg ? avatarImg : undefined}
                icon={!avatarImg ? "user" : undefined}
              />
              <span style={{ color: "white", marginLeft: "10px" }}>
                {nickname}
              </span>
            </span>
          ),
          key: "user",
          children: [
            {
              label: (
                <Link to="/user/profile" style={{ color: "white" }}>
                  Profile
                </Link>
              ),
              key: "profile",
            },
            {
              label: (
                <Button
                  type="link"
                  onClick={logoutUser}
                  style={{ color: "white" }}
                >
                  Logout
                </Button>
              ),
              key: "logout",
            },
          ],
        }
      : {
          label: "Sign In",
          key: "signin",
          children: [
            {
              label: (
                <Button
                  type="link"
                  onClick={initiateSignIn}
                  style={{ color: "white" }}
                >
                  Sign In
                </Button>
              ),
              key: "signin",
            },
            {
              label: (
                <Button
                  type="link"
                  onClick={initiateSignUp}
                  style={{ color: "white" }}
                >
                  Sign Up
                </Button>
              ),
              key: "signup",
            },
          ],
        },
  ];

  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <Layout>
      <Header
        style={{
          position: "fixed",
          zIndex: 1,
          width: "100%",
          backgroundColor: "#001529",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "transparent",
          }}
        >
          <Link to="/" style={{ display: "flex", alignItems: "center" }}>
            <img
              src={logo}
              alt="Logo"
              style={{
                height: 36,
                marginRight: 12,
                display: "inline-block",
                verticalAlign: "middle",
              }}
            />
            <span
              style={{
                color: "white",
                fontSize: isMobile ? "15px" : "20px",
                fontWeight: "bold",
                backgroundColor: "transparent",
                verticalAlign: "middle",
              }}
            >
              {siteName}
            </span>
          </Link>
        </div>
        <Menu
          onClick={onClick}
          selectedKeys={[current]}
          mode="horizontal"
          items={items.slice(1)}
          theme="dark"
          style={{ backgroundColor: "transparent" }}
        />
      </Header>
    </Layout>
  );
};

export default Navbar;
