import React, { useEffect, useContext, useState } from "react";
import { useUserProfile } from "../../provider/UserProfileProvider";
import { useStravaProfile } from "../../provider/UserStravaProvider";
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Spin,
  Alert,
  Button,
  Switch,
  message,
} from "antd";
import { STRAVA_CONFIGS } from "../../configs/stravaConfig";
import usePutStravaCallback from "../../hooks/usePutStravaCallback";
import usePutProfile from "../../hooks/usePutProfile";
import { UserAuthenticationContext } from "../../provider/UserAuthenticationProvider";
import getStage from "../../utility/getStage";

const { Title, Text } = Typography;

const UserProfileCard = ({
  userProfile,
  isUserFetching,
  onTogglePublic,
  updatingPublic,
  onNameSave,
  nameEditLoading,
}) => {
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(userProfile?.name || "");

  useEffect(() => {
    setNameValue(userProfile?.name || "");
  }, [userProfile?.name]);

  return (
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
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {editing ? (
              <>
                <input
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  style={{ fontSize: 18, padding: 4, marginRight: 8 }}
                  disabled={nameEditLoading}
                />
                <Button
                  size="small"
                  type="primary"
                  loading={nameEditLoading}
                  onClick={async () => {
                    if (nameValue && nameValue !== userProfile.name) {
                      await onNameSave(nameValue);
                    }
                    setEditing(false);
                  }}
                  style={{ marginRight: 4 }}
                >
                  Save
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setEditing(false);
                    setNameValue(userProfile.name || "");
                  }}
                  disabled={nameEditLoading}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Title level={4} style={{ margin: 0 }}>
                  {userProfile.name || "N/A"}
                </Title>
                <Button
                  size="small"
                  onClick={() => setEditing(true)}
                  style={{ marginLeft: 8 }}
                >
                  Edit
                </Button>
              </>
            )}
          </div>
          <Text type="secondary">{userProfile.email || "N/A"}</Text>
          <br />
          {userProfile.public_profile !== undefined ? (
            <>
              <Switch
                checked={userProfile.public_profile}
                loading={updatingPublic}
                onChange={onTogglePublic}
                checkedChildren="Public"
                unCheckedChildren="Private"
                style={{ marginRight: 8 }}
              />
              <Text
                style={{ color: userProfile.public_profile ? "green" : "red" }}
              >
                <b>
                  {userProfile.public_profile
                    ? "Public Profile"
                    : "Private Profile"}
                </b>
              </Text>
            </>
          ) : (
            <Text>N/A</Text>
          )}
        </>
      ) : (
        <Alert message="No user profile data." type="info" />
      )}
    </Card>
  );
};

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
  const { userProfile, isUserFetching, userRefetch } = useUserProfile();
  const {
    stravaProfile,
    isStravaFetching,
    stravaError,
    stravaRefetch: refetchStravaProfile,
  } = useStravaProfile();
  const { putStravaCallbackAsync, status: stravaCallbackStatus } =
    usePutStravaCallback();
  const {
    updateUserProfileAsync,
    updateUserProfileLoading,
    updateUserProfileError,
  } = usePutProfile();
  const { idToken } = useContext(UserAuthenticationContext);

  const [isCallbackLoading, setIsCallbackLoading] = useState(false);
  const [callbackError, setCallbackError] = useState(null);
  const [nameEditLoading, setNameEditLoading] = useState(false);

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

  // Handle toggle public/private
  const handleTogglePublic = async (checked) => {
    try {
      await updateUserProfileAsync({ public_profile: checked });
      message.success(`Profile is now ${checked ? "public" : "private"}.`);
      // Force a repull of the user profile
      if (typeof userRefetch === "function") {
        userRefetch();
      }
    } catch (err) {
      message.error("Failed to update profile privacy.");
    }
  };

  // Handle name save
  const handleNameSave = async (newName) => {
    setNameEditLoading(true);
    try {
      await updateUserProfileAsync({ name: newName });
      message.success("Name updated!");
      if (typeof userRefetch === "function") {
        userRefetch();
      }
    } catch (err) {
      message.error("Failed to update name.");
    } finally {
      setNameEditLoading(false);
    }
  };

  const stage = getStage();

  return (
    <Row gutter={32} justify="center" style={{ marginTop: 40 }}>
      <Col xs={24} md={10}>
        <UserProfileCard
          userProfile={userProfile}
          isUserFetching={isUserFetching}
          onTogglePublic={handleTogglePublic}
          updatingPublic={updateUserProfileLoading}
          onNameSave={handleNameSave}
          nameEditLoading={nameEditLoading}
        />
        {updateUserProfileError && (
          <Alert
            message="Failed to update profile privacy."
            description={updateUserProfileError.message}
            type="error"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
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
