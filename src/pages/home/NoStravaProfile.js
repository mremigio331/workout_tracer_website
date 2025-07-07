import React from "react";
import { Link } from "react-router-dom";
import { Typography, Button, Card, Row, Col } from "antd";
import { useMediaQuery } from "react-responsive";
import desktopExample from "../../assets/dashboard_desktop.png";
import mobileExample from "../../assets/dashboard_mobile.png";

const { Title, Paragraph } = Typography;

const NoStravaProfile = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fafcff",
        padding: 0,
        margin: 0,
      }}
    >
      <div style={{ width: "100%", maxWidth: 900, padding: 24 }}>
        <Row
          gutter={[24, 24]}
          justify="center"
          style={{
            flexDirection: isMobile ? "row" : "column",
            display: "flex",
          }}
        >
          <Col xs={24} md={24}>
            <Card>
              <Title level={2}>Connect Your Strava Account</Title>
              <Paragraph>
                To get started, connect your Strava account on your{" "}
                <Link to="/user/profile">Profile page</Link>.
              </Paragraph>
              <div style={{ marginTop: 24 }}>
                <Button type="primary" block>
                  <Link to="/user/profile">Go to Profile & Connect Strava</Link>
                </Button>
              </div>
            </Card>
          </Col>
          <Col
            xs={24}
            md={24}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Card
              bodyStyle={{
                padding: isMobile ? 8 : 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f8f8f8",
              }}
              style={{ width: "100%", textAlign: "center" }}
              bordered={false}
            >
              <img
                src={isMobile ? mobileExample : desktopExample}
                style={{
                  width: isMobile ? "90vw" : "100%",
                  maxWidth: isMobile ? 350 : 600,
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  margin: "0 auto",
                }}
              />
              <div
                style={{
                  fontSize: 13,
                  color: "#888",
                  marginTop: 8,
                }}
              ></div>
            </Card>
          </Col>
          <Col xs={24} md={24}>
            <Card>
              <Title level={4}>How does Workout Tracer work?</Title>
              <Paragraph>
                Workout Tracer connects to your Strava account (with your
                permission) and securely fetches your workout data. Your
                activities are visualized on a map, and you can view stats,
                filter, and explore your history.
              </Paragraph>
              <Paragraph>
                <b>Privacy:</b> Workout Tracer only displays geodata
                (map/location information) for activities that you have set as
                visible on Strava. Private or hidden activity locations are
                never shown.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={24}>
            <Card>
              <Title level={4}>Sharing Your Map</Title>
              <Paragraph>
                If you want other users on Workout Tracer to see your map, you
                can set your profile to <b>public</b> in your profile settings.
                Only users who have signed up for Workout Tracer can view your
                map and activities. Your map will never be visible to the
                general public or search engines.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={24}>
            <Card>
              <Title level={4}>Explore Public Profiles</Title>
              <Paragraph>
                You can also view <Link to="/users">public profiles</Link> of
                other users who have shared their workouts.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default NoStravaProfile;
