import { useQuery } from "@tanstack/react-query";
import { useContext, useMemo } from "react";
import { UserAuthenticationContext } from "../provider/UserAuthenticationProvider";
import { apiRequestGet } from "../api/apiRequest";
import { useApi } from "../provider/ApiProvider";

const useGetStravaProfile = () => {
  const { idToken } = useContext(UserAuthenticationContext);
  const { apiEndpoint, stage } = useApi();

  const isEnabled = useMemo(
    () => !!idToken && typeof idToken === "string" && idToken.length > 0,
    [idToken],
  );

  const { data, isFetching, isError, status, error, refetch } = useQuery({
    queryKey: ["stravaProfile"],
    queryFn: () =>
      apiRequestGet(apiEndpoint, "/strava/profile", idToken).then(
        (response) => response.data,
      ),
    enabled: isEnabled,
    keepPreviousData: true,
    retry: 0, // Only try once, do not retry on failure
    staleTime: 1000 * 60 * 10, // 10 minutes: prevents refetch if data is fresh
    cacheTime: 1000 * 60 * 30, // 30 minutes: keeps data in cache
  });

  if (stage === "dev" || stage === "staging") {
    console.log("Strava Profile Data:", data);
    console.log("Strava Profile Status:", status);
    console.log("Strava Profile Error:", error);
    console.log("Strava Profile isFetching:", isFetching);
    console.log("Strava Profile isError:", isError);

    // Add detailed error logging for API error responses
    if (error) {
      if (error.response && error.response.data) {
        console.log("Strava API Error Response:", error.response.data);
      } else {
        // This will log the Axios error object, including status and message
        console.log("Strava API Error (no response.data):", error);
        if (error.status) {
          console.log("Strava API Error Status:", error.status);
        }
        if (error.message) {
          console.log("Strava API Error Message:", error.message);
        }
      }
    }
  }

  return {
    stravaProfile: data?.athlete ?? null,
    isStravaFetching: isFetching,
    isStravaError: isError,
    stravaStatus: status,
    stravaRefetch: refetch,
    stravaError: error ?? null,
  };
};

export default useGetStravaProfile;
