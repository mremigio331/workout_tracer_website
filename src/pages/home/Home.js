import React, { useContext } from "react";
import { Button, Layout, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title, Text } = Typography;
import HomeAuthenticated from "./HomeAuthenticated";
import HomeUnauthenticated from "./HomeUnauthenticated";
import { UserAuthenticationContext } from "../../provider/UserAuthenticationProvider";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(UserAuthenticationContext);

  // Debug: log on every render
  console.log("Home component rerender, isAuthenticated:", isAuthenticated);

  return isAuthenticated ? <HomeAuthenticated /> : <HomeUnauthenticated />;
};

export default Home;
