import React, { createContext, useContext, useMemo } from "react";
import useGetStravaWorkouts from "../hooks/useGetStravaWorkouts";

const StravaWorkoutsContext = createContext();

export const StravaWorkoutsProvider = ({ children }) => {
  const {
    stravaWorkouts = [],
    isStravaWorkoutFetching,
    isStravaWorkoutError,
    stravaWorkoutRefetch,
  } = useGetStravaWorkouts();

  const value = useMemo(
    () => ({
      stravaWorkouts,
      isStravaWorkoutFetching,
      isStravaWorkoutError,
      refetchStravaWorkouts: stravaWorkoutRefetch,
    }),
    [
      stravaWorkouts,
      isStravaWorkoutFetching,
      isStravaWorkoutError,
      stravaWorkoutRefetch,
    ],
  );

  return (
    <StravaWorkoutsContext.Provider value={value}>
      {children}
    </StravaWorkoutsContext.Provider>
  );
};

export const useStravaWorkouts = () => {
  const context = useContext(StravaWorkoutsContext);
  if (!context) {
    throw new Error(
      "useStravaWorkouts must be used within a StravaWorkoutsProvider",
    );
  }
  return context;
};
