import React, { useEffect, useContext, useState } from "react";
import { useUserProfile } from "../../provider/UserProfileProvider";
import { useStravaProfile } from "../../provider/UserStravaProvider";
import { Card, Row, Col, Avatar, Typography, Spin, Alert, Button } from "antd";
import { STRAVA_CONFIGS } from "../../configs/stravaConfig";
import usePutStravaCallback from "../../hooks/usePutStravaCallback";
import { UserAuthenticationContext } from "../../provider/UserAuthenticationProvider";
import getStage from "../../utility/getStage";

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
        <br />
        {userProfile.public_profile !== undefined ? (
          userProfile.public_profile ? (
            <Text style={{ color: "green" }}>
              <b>Public Profile</b>
            </Text>
          ) : (
            <Text style={{ color: "red" }}>
              <b>Private Profile</b>
            </Text>
          )
        ) : (
          <Text>N/A</Text>
        )}
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
  stage,
  isCallbackLoading,
  callbackError,
}) => {
  const showConnectButton = stravaProfile === null;

  const stageUpper = getStage().toUpperCase();
  const stravaConfig = STRAVA_CONFIGS[stageUpper];
  const stravaAuthUrl = stravaConfig?.OAUTH_URL;
  console.log("Strava Connect Debug:", {
    stageUpper,
    stageUpper,
    stravaConfig,
    stravaAuthUrl,
  });

  if (isStravaFetching || isCallbackLoading) {
    return (
      <Card title="Strava Profile">
        <Spin />
      </Card>
    );
  }

  if (callbackError) {
    return (
      <Card title="Strava Profile">
        <Alert
          message="Failed to connect to Strava."
          description={callbackError.message}
          type="error"
        />
        <Button type="primary" style={{ marginTop: 16 }} href={stravaAuthUrl}>
          Try Connecting Again
        </Button>
      </Card>
    );
  }

  if (showConnectButton) {
    return (
      <Card title="Strava Profile">
        <Alert message="No Strava profile data." type="info" />
        {stravaAuthUrl ? (
          <Button type="primary" style={{ marginTop: 16 }} href={stravaAuthUrl}>
            Connect To Strava
          </Button>
        ) : (
          <Alert
            message="Strava connection URL not configured."
            type="warning"
          />
        )}
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
  const { userProfile, isUserFetching } = useUserProfile();
  const {
    stravaProfile,
    isStravaFetching,
    stravaError,
    stravaRefetch: refetchStravaProfile,
  } = useStravaProfile();
  const { putStravaCallbackAsync, status: stravaCallbackStatus } =
    usePutStravaCallback();
  const { idToken } = useContext(UserAuthenticationContext);

  const [isCallbackLoading, setIsCallbackLoading] = useState(false);
  const [callbackError, setCallbackError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const isTokenReady = typeof idToken === "string" && idToken.length > 0;

    if (code && isTokenReady) {
      (async () => {
        setIsCallbackLoading(true);
        setCallbackError(null);
        try {
          await putStravaCallbackAsync(code);
          await refetchStravaProfile();
        } catch (err) {
          console.error("Strava callback failed:", err);
          setCallbackError(err);
        } finally {
          setIsCallbackLoading(false);
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        }
      })();
    }
  }, [putStravaCallbackAsync, idToken, refetchStravaProfile]);

  const stage = getStage();

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
          isCallbackLoading={isCallbackLoading}
          callbackError={callbackError}
          stage={stage}
        />
        {stravaCallbackStatus === "success" && (
          <Alert
            message="Strava account successfully connected! It may take about 30 minutes per 200 workouts for your profile to completely sync."
            type="success"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Col>
    </Row>
  );
};

export default UserProfile;
