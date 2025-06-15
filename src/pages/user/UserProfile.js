import React from "react";
import { useUserProfile } from "../../provider/UserProfileProvider";
import { useStravaProfile } from "../../provider/UserStravaProvider";
import { Card, Row, Col, Avatar, Typography, Spin, Alert, Button } from "antd";
import { STRAVA_CONFIGS } from "../../configs/stravaConfig";

const { Title, Text } = Typography;

const UserProfileCard = ({ userProfile, isUserFetching }) => (
  <Card
    title="User Profile"
    extra={
      <Avatar
        size={64}
        src={
          userProfile?.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.name || "User")}`
        }
      />
    }
  >
    {isUserFetching ? (
      <Spin />
    ) : userProfile ? (
      <>
        <Title level={4}>{userProfile.name || "N/A"}</Title>
        <Text type="secondary">{userProfile.email || "N/A"}</Text>
      </>
    ) : (
      <Alert message="No user profile data." type="info" />
    )}
  </Card>
);

const StravaProfileCard = ({
  stravaProfile,
  isStravaFetching,
  stravaError,
  stage = "dev",
}) => {
  // Detect if the error is "Strava profile not found."
  console.log("Strava Profile Error:", stravaError);
  const showConnectButton = stravaProfile === null;

  // Map stage to config key (DEV/STAGING/PROD)
  const configKey = (stage || "dev").toUpperCase();
  const stravaConfig = STRAVA_CONFIGS[configKey] || STRAVA_CONFIGS.DEV;
  const stravaAuthUrl = stravaConfig.OAUTH_URL;

  if (isStravaFetching) {
    return (
      <Card title="Strava Profile">
        <Spin />
      </Card>
    );
  }

  if (showConnectButton) {
    return (
      <Card title="Strava Profile">
        <Alert message="No Strava profile data." type="info" />
        <Button type="primary" style={{ marginTop: 16 }} href={stravaAuthUrl}>
          Connect To Strava
        </Button>
      </Card>
    );
  }

  if (!stravaProfile) {
    return (
      <Card title="Strava Profile">
        <Alert message="No Strava profile data." type="info" />
      </Card>
    );
  }

  return (
    <Card
      title="Strava Profile"
      extra={
        <Avatar
          size={64}
          src={
            stravaProfile?.profile ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              stravaProfile?.firstname || "Strava",
            )}`
          }
        />
      }
    >
      <>
        <Title level={4}>
          {stravaProfile.firstname} {stravaProfile.lastname}
        </Title>
        <Text type="secondary">{stravaProfile.username || "N/A"}</Text>
        <div style={{ marginTop: 16 }}>
          <Text>
            <b>City:</b> {stravaProfile.city || "N/A"}
          </Text>
          <br />
          <Text>
            <b>State:</b> {stravaProfile.state || "N/A"}
          </Text>
          <br />
          <Text>
            <b>Sex:</b> {stravaProfile.sex || "N/A"}
          </Text>
          <br />
          <Text>
            <b>Created:</b>{" "}
            {stravaProfile.created_at
              ? new Date(stravaProfile.created_at).toLocaleDateString()
              : "N/A"}
          </Text>
          <br />
        </div>
      </>
    </Card>
  );
};

const UserProfile = () => {
  // Debug: log on every render
  console.log("UserProfile component rerender");

  const { userProfile, isUserFetching } = useUserProfile();
  const { stravaProfile, isStravaFetching, stravaError } = useStravaProfile();

  // Log context values to help debug rerenders
  console.log("userProfile:", userProfile);
  console.log("isUserFetching:", isUserFetching);
  console.log("stravaProfile:", stravaProfile);
  console.log("isStravaFetching:", isStravaFetching);
  console.log("stravaError:", stravaError);

  // Use a stable stage value (avoid object destructuring from window)
  const stage = window.STRAVA_STAGE_CONFIG?.stage || "dev";

  return (
    <Row gutter={32} justify="center" style={{ marginTop: 40 }}>
      <Col xs={24} md={10}>
        <UserProfileCard
          userProfile={userProfile}
          isUserFetching={isUserFetching}
        />
      </Col>
      <Col xs={24} md={10}>
        <StravaProfileCard
          stravaProfile={stravaProfile}
          isStravaFetching={isStravaFetching}
          stravaError={stravaError}
          stage={stage}
        />
      </Col>
    </Row>
  );
};

export default UserProfile;
