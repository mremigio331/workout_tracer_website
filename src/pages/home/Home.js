import React, { useContext } from "react";
import { Button, Layout, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title, Text } = Typography;
import HomeAuthenticated from "./HomeAuthenticated";
import HomeUnauthenticated from "./HomeUnauthenticated";
import { UserContext } from "../../provider/UserProvider";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(UserContext);
  console.log("isAuthenticated", isAuthenticated);

  return isAuthenticated ? <HomeAuthenticated /> : <HomeUnauthenticated />;
};

export default Home;
