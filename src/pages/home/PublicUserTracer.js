import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePublicStravaProfile } from "../../provider/PublicStravaProfileProvider";
import { usePublicStravaWorkouts } from "../../provider/PublicStravaWorkoutsProvider";
import WorkoutTracerDashboard from "../../components/WorkoutTracerDashboard";

const PublicUserTracer = () => {
  const { stravaId } = useParams();
  const {
    setPublicStravaId: setProfileStravaId,
    publicStravaProfile,
    isPublicStravaFetching,
  } = usePublicStravaProfile();
  const {
    setPublicStravaId: setWorkoutsStravaId,
    publicStravaWorkouts,
    isPublicStravaWorkoutFetching,
  } = usePublicStravaWorkouts();

  useEffect(() => {
    setProfileStravaId(stravaId);
    setWorkoutsStravaId(stravaId);
  }, [stravaId, setProfileStravaId, setWorkoutsStravaId]);

  return (
    <WorkoutTracerDashboard
      stravaProfile={publicStravaProfile}
      stravaWorkouts={publicStravaWorkouts}
      isProfileLoading={isPublicStravaFetching}
      isWorkoutsLoading={isPublicStravaWorkoutFetching}
      headerFallback="Public User's Workout Tracer"
      stravaId={stravaId}
    />
  );
};

export default PublicUserTracer;
