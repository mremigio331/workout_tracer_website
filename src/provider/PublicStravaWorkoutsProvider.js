import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";
import useGetPublicStravaWorkouts from "../hooks/useGetPublicStravaWorkouts";

const PublicStravaWorkoutsContext = createContext();

export const PublicStravaWorkoutsProvider = ({ children }) => {
  const [stravaId, setStravaId] = useState(null);

  const {
    publicStravaWorkouts,
    isPublicStravaWorkoutFetching,
    isPublicStravaWorkoutError,
    publicStravaWorkoutStatus,
    publicStravaWorkoutError,
    publicStravaWorkoutRefetch,
  } = useGetPublicStravaWorkouts({ stravaId });

  const setPublicStravaId = useCallback((id) => setStravaId(id), []);

  const value = useMemo(
    () => ({
      publicStravaWorkouts,
      isPublicStravaWorkoutFetching,
      isPublicStravaWorkoutError,
      publicStravaWorkoutStatus,
      publicStravaWorkoutError,
      publicStravaWorkoutRefetch,
      setPublicStravaId,
      stravaId,
    }),
    [
      publicStravaWorkouts,
      isPublicStravaWorkoutFetching,
      isPublicStravaWorkoutError,
      publicStravaWorkoutStatus,
      publicStravaWorkoutError,
      publicStravaWorkoutRefetch,
      setPublicStravaId,
      stravaId,
    ],
  );

  return (
    <PublicStravaWorkoutsContext.Provider value={value}>
      {children}
    </PublicStravaWorkoutsContext.Provider>
  );
};

export const usePublicStravaWorkouts = () =>
  useContext(PublicStravaWorkoutsContext);
