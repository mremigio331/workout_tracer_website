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
      <Content style={{ padding: 0 }}>
        <div
          style={{
            textAlign: "center",
            // Add top padding to push the logo down
            paddingTop: "64px",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            width: "100%",
            margin: 0,
          }}
        >
          <img
            src={logo}
            alt="Workout Tracer Logo"
            style={{
              height: "160px",
              maxHeight: "160px",
              width: "160px",
              objectFit: "cover",
              marginBottom: 8,
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start", // align content to top
              alignItems: "center",
              padding: "0", // remove extra padding
            }}
          >
            <Title
              level={2}
              style={{
                fontSize: 22,
                marginTop: 8,
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
