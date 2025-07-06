import React, { useContext, useState, useMemo, useEffect } from "react";

import { useStravaWorkouts } from "../../provider/StravaWorkoutsProvider";
import { useStravaProfile } from "../../provider/UserStravaProvider";
import WorkoutTracerDashboard from "../../components/WorkoutTracerDashboard";

const HomeAuthenticated = () => {
  const { stravaWorkouts, isStravaWorkoutFetching } = useStravaWorkouts();

  const { stravaProfile, isStravaFetching } = useStravaProfile();

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
