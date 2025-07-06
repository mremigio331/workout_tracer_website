import { useQuery } from "@tanstack/react-query";
import { useContext, useMemo } from "react";
import { UserAuthenticationContext } from "../provider/UserAuthenticationProvider";
import { useApi } from "../provider/ApiProvider";
import { apiRequestGet } from "../api/apiRequest";

const fetchAllWorkouts = async (apiEndpoint, idToken, stravaId) => {
  let allWorkouts = [];
  let nextToken = null;
  let prevToken = null;
  const limit = 500;

  do {
    let endpoint = `/strava/public_workouts/${stravaId}?limit=${limit}`;
    if (nextToken) endpoint += `&next_token=${encodeURIComponent(nextToken)}`;

    const response = await apiRequestGet(apiEndpoint, endpoint, idToken);
    const data = response.data;

    allWorkouts = allWorkouts.concat(data.workouts || []);
    prevToken = nextToken;
    nextToken = data.next_token;

    if (!nextToken || nextToken === prevToken) {
      if (!nextToken) {
        console.log("No new token, finished fetching all workouts.");
      } else {
        console.warn(
          "Same next_token received, breaking to avoid infinite loop.",
        );
      }
      break;
    }
  } while (true);

  return allWorkouts;
};

const useGetPublicStravaWorkouts = ({ stravaId, enabled = true }) => {
  const { idToken } = useContext(UserAuthenticationContext);
  const { apiEndpoint, stage } = useApi();

  const isEnabled = useMemo(
    () =>
      enabled &&
      !!idToken &&
      typeof idToken === "string" &&
      idToken.length > 0 &&
      !!stravaId,
    [enabled, idToken, stravaId],
  );

  const { data, isFetching, isError, status, error, refetch } = useQuery({
    queryKey: ["stravaPublicWorkouts", stravaId],
    queryFn: () => fetchAllWorkouts(apiEndpoint, idToken, stravaId),
    enabled: isEnabled,
    keepPreviousData: true,
    retry: 0,
    staleTime: 1000 * 60 * 10, // 10 minutes: prevents refetch if data is fresh
    cacheTime: 1000 * 60 * 30, // 30 minutes: keeps data in cache
  });

  if (stage === "dev" || stage === "staging") {
    console.log("Strava Workouts Data:", data);
    console.log("Strava Workouts Status:", status);
    console.log("Strava Workouts Error:", error);
    console.log("Strava Workouts isFetching:", isFetching);
    console.log("Strava Workouts isError:", isError);
    if (error) {
      if (error.response && error.response.data) {
        console.log("Strava Workouts API Error Response:", error.response.data);
      } else {
        console.log("Strava Workouts API Error (no response.data):", error);
        if (error.status) {
          console.log("Strava Workouts API Error Status:", error.status);
        }
        if (error.message) {
          console.log("Strava Workouts API Error Message:", error.message);
        }
      }
    }
  }
  return {
    publicStravaWorkouts: data ?? [],
    isPublicStravaWorkoutFetching: isFetching,
    isPublicStravaWorkoutError: isError,
    publicStravaWorkoutStatus: status,
    publicStravaWorkoutError: error ?? null,
    publicStravaWorkoutRefetch: refetch,
  };
};

export default useGetPublicStravaWorkouts;
