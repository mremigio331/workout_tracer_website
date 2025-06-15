import { useQuery } from "@tanstack/react-query";
import { useContext, useMemo } from "react";
import { UserAuthenticationContext } from "../provider/UserAuthenticationProvider";
import { apiRequestGet } from "../api/apiRequest";
import { useApi } from "../provider/ApiProvider";

const useGetStravaProfile = () => {
  // Debug: log on every render
  console.log("useGetStravaProfile rerender");

  const { idToken } = useContext(UserAuthenticationContext);
  const { apiEndpoint, stage } = useApi();

  const isEnabled = useMemo(
    () => !!idToken && typeof idToken === "string" && idToken.length > 0,
    [idToken],
  );

  const { data, isFetching, isError, status, error } = useQuery({
    queryKey: ["stravaProfile"],
    queryFn: () =>
      apiRequestGet(apiEndpoint, "/strava/profile", idToken).then(
        (response) => response.data,
      ),
    enabled: isEnabled,
    keepPreviousData: true,
    retry: 0, // Only try once, do not retry on failure
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

  console.log("Strava Profile Data:", data);

  return {
    stravaProfile: data?.athlete ?? null,
    isStravaFetching: isFetching,
    isStravaError: isError,
    stravaStatus: status,
    stravaError: error ?? null, // error will now be the error message or object thrown in apiRequestGet
  };
};

export default useGetStravaProfile;
