import React, { useContext } from "react";
import { Button, Layout, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../provider/UserProvider";
const { Content } = Layout;
const { Title, Text } = Typography;

const HomeAuthenticated = () => {
  const navigate = useNavigate();
  const { user, name } = useContext(UserContext);
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: "50px" }}>
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <Title level={2}>Welcome to the Workout Tracer</Title>
          <Text>{`You have signed in ${name}`}</Text>
        </div>
      </Content>
    </Layout>
  );
};

export default HomeAuthenticated;
