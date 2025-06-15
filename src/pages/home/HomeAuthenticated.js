import React, { useContext } from "react";
import { Button, Layout, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { UserAuthenticationContext } from "../../provider/UserAuthenticationProvider";
import { useUserProfile } from "../../provider/UserProfileProvider";
import useGetStravaWorkouts from "../../hooks/useGetStravaWorkouts";
const { Content } = Layout;
const { Title, Text } = Typography;

const HomeAuthenticated = () => {
  const navigate = useNavigate();
  const { user, name } = useContext(UserAuthenticationContext);
  const { userProfile, isUserFetching } = useUserProfile();
  const { stravaWorkouts, isStravaFetching } = useGetStravaWorkouts();

  console.log("Strava Workouts:", stravaWorkouts);
  console.log("isStravaFetching:", isStravaFetching);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: "50px" }}>
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <Title level={2}>Welcome to the Workout Tracer</Title>
          {isUserFetching ? (
            <Text>Loading...</Text>
          ) : (
            <Text>{`You have signed in ${userProfile?.name || ""}`}</Text>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default HomeAuthenticated;
