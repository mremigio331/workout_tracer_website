import React, { useContext } from "react";
import { Button, Layout, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { UserAuthenticationContext } from "../../provider/UserAuthenticationProvider";
import { useMediaQuery } from "react-responsive";
import logo from "../../assets/workout_tracer.png";
const { Content } = Layout;
const { Title, Text } = Typography;

const HomeUnauthenticated = () => {
  const { initiateSignIn, initiateSignUp } = useContext(
    UserAuthenticationContext,
  );
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: isMobile ? 0 : "50px" }}>
        <div
          style={{
            textAlign: "center",
            marginTop: isMobile ? 0 : "50px",
            height: isMobile ? "100vh" : undefined,
            display: "flex",
            flexDirection: "column",
            justifyContent: isMobile ? "flex-start" : undefined,
          }}
        >
          <img
            src={logo}
            alt="Workout Tracer Logo"
            style={{
              height: isMobile ? "30vh" : 120,
              maxHeight: isMobile ? "40vw" : undefined,
              width: isMobile ? "100vw" : undefined,
              objectFit: "cover",
              marginBottom: isMobile ? 0 : 24,
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
          <div
            style={{
              flex: isMobile ? 1 : undefined,
              display: "flex",
              flexDirection: "column",
              justifyContent: isMobile ? "flex-end" : undefined,
              alignItems: "center",
              height: isMobile ? "100%" : undefined,
              padding: isMobile ? "16px" : 0,
            }}
          >
            <Title
              level={2}
              style={{
                fontSize: isMobile ? 22 : undefined,
                marginTop: isMobile ? 24 : undefined,
              }}
            >
              Welcome to the Workout Tracer
            </Title>
            <Text>Let's get you signed in</Text>
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                justifyContent: isMobile ? "center" : "flex-end",
                maxWidth: "300px",
                margin: isMobile ? "20px auto 0 auto" : "20px auto",
                gap: 12,
              }}
            >
              <Button type="primary" onClick={initiateSignIn}>
                Sign In
              </Button>
              <Button type="primary" onClick={initiateSignUp}>
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default HomeUnauthenticated;
