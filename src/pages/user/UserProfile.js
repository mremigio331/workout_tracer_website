import React, { useMemo } from "react";
import { useUserProfile } from "../../provider/UserProfileProvider";
import { useStravaProfile } from "../../provider/UserStravaProvider";
import { Card, Row, Col, Avatar, Typography, Spin, Alert } from "antd";

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

const StravaProfileCard = ({ stravaProfile, isStravaFetching }) => (
  <Card
    title="Strava Profile"
    extra={
      <Avatar
        size={64}
        src={
          stravaProfile?.profile ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(stravaProfile?.firstname || "Strava")}`
        }
      />
    }
  >
    {isStravaFetching ? (
      <Spin />
    ) : stravaProfile ? (
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
    ) : (
      <Alert message="No Strava profile data." type="info" />
    )}
  </Card>
);

const UserProfile = () => {
  const { userProfile, isUserFetching } = useUserProfile();
  const { stravaProfile, isStravaFetching } = useStravaProfile();

  const userProfileMemo = useMemo(() => userProfile, [userProfile]);
  const stravaProfileMemo = useMemo(() => stravaProfile, [stravaProfile]);

  return (
    <Row gutter={32} justify="center" style={{ marginTop: 40 }}>
      <Col xs={24} md={10}>
        <UserProfileCard
          userProfile={userProfileMemo}
          isUserFetching={isUserFetching}
        />
      </Col>
      <Col xs={24} md={10}>
        <StravaProfileCard
          stravaProfile={stravaProfileMemo}
          isStravaFetching={isStravaFetching}
        />
      </Col>
    </Row>
  );
};

export default UserProfile;
