import React, { useContext, useState, useEffect, useMemo } from "react";
import { Layout, Menu, Button, Avatar } from "antd";
import { Link } from "react-router-dom";
import { UserAuthenticationContext } from "../provider/UserAuthenticationProvider";
import { useStravaProfile } from "../provider/UserStravaProvider";
import getStage from "../utility/getStage";
import logo from "../assets/workout_tracer.png";
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

  const isMobile = useMediaQuery({ maxWidth: 768 });

  const siteName = useMemo(() => {
    if (isMobile) return "Workout Tracer";
    return stage.toLowerCase() != "prod"
      ? `${stage} Workout Tracer`
      : "Workout Tracer";
  }, [stage, isMobile]);

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

  // Only show user/profile or signin menu, no Public Users link
  const rightMenuItems = [...items.slice(1)];

  return (
    <Header
      style={{
        position: "fixed",
        zIndex: 1001,
        width: "100%",
        top: 0,
        left: 0,
        backgroundColor: "#001529",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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
        items={rightMenuItems}
        theme="dark"
        style={{ backgroundColor: "transparent" }}
      />
    </Header>
  );
};

export default Navbar;
