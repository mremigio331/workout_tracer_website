import { useQuery } from "@tanstack/react-query";
import { useContext, useMemo } from "react";
import { UserAuthenticationContext } from "../provider/UserAuthenticationProvider";
import { useApi } from "../provider/ApiProvider";
import { apiRequestGet } from "../api/apiRequest";

const fetchAllWorkouts = async (apiEndpoint, idToken) => {
  let allWorkouts = [];
  let nextToken = null;
  let prevToken = null;
  const limit = 500;

  do {
    let endpoint = `/strava/workouts?limit=${limit}`;
    if (nextToken) endpoint += `&next_token=${encodeURIComponent(nextToken)}`;
    console.log("Requesting endpoint:", endpoint);

    const response = await apiRequestGet(apiEndpoint, endpoint, idToken);
    const data = response.data;
    console.log("Fetched Strava Workouts:", data);
    console.log("Next Token:", data.next_token);

    allWorkouts = allWorkouts.concat(data.workouts || []);
    prevToken = nextToken;
    nextToken = data.next_token;

    // Guard: break if next_token does not change (prevents infinite loop)
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

const useGetStravaWorkouts = () => {
  const { idToken } = useContext(UserAuthenticationContext);
  const { apiEndpoint, stage } = useApi();

  const isEnabled = useMemo(
    () => !!idToken && typeof idToken === "string" && idToken.length > 0,
    [idToken],
  );

  const { data, isFetching, isError, status, error, refetch } = useQuery({
    queryKey: ["stravaWorkouts"],
    queryFn: () => fetchAllWorkouts(apiEndpoint, idToken),
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
    stravaWorkouts: data ?? [],
    isStravaWorkoutFetching: isFetching,
    isStravaWorkoutError: isError,
    stravaWorkoutStatus: status,
    stravaWorkoutError: error ?? null,
    stravaWorkoutRefetch: refetch,
  };
};

export default useGetStravaWorkouts;
