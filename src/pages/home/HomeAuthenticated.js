import React, { useContext, useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Typography, Button, Card, Row, Col } from "antd";
import { useMediaQuery } from "react-responsive";
import desktopExample from "../../assets/dashboard_desktop.png";
import mobileExample from "../../assets/dashboard_mobile.png";

import { useStravaWorkouts } from "../../provider/StravaWorkoutsProvider";
import { useStravaProfile } from "../../provider/UserStravaProvider";
import WorkoutTracerDashboard from "../../components/WorkoutTracerDashboard";
import NoStravaProfile from "./NoStravaProfile";

const { Title, Paragraph } = Typography;

const HomeAuthenticated = () => {
  const { stravaWorkouts, isStravaWorkoutFetching } = useStravaWorkouts();
  const { stravaProfile, isStravaFetching } = useStravaProfile();

  if (!stravaProfile) {
    return <NoStravaProfile />;
  }

  return (
    <WorkoutTracerDashboard
      stravaProfile={stravaProfile}
      stravaWorkouts={stravaWorkouts}
      isProfileLoading={isStravaFetching}
      isWorkoutsLoading={isStravaWorkoutFetching}
      headerFallback="User's Workout Tracer"
      stravaId={null}
    />
  );
};

export default HomeAuthenticated;
