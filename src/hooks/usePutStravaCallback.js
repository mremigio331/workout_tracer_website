import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { UserAuthenticationContext } from "../provider/UserAuthenticationProvider";
import { apiRequestPut } from "../api/apiRequest";
import { useApi } from "../provider/ApiProvider";

const usePutStravaCallback = () => {
  const { idToken } = useContext(UserAuthenticationContext);
  const { apiEndpoint, stage } = useApi();

  const isEnabled =
    !!idToken && typeof idToken === "string" && idToken.length > 0;

  const mutation = useMutation({
    mutationFn: (authCode) =>
      apiRequestPut({
        apiEndpoint: `${apiEndpoint}/strava/profile/callback`,
        idToken,
        body: { auth_code: authCode },
      }),
    // No enabled option for useMutation
    select: (data) => ({
      status: "success",
      data,
    }),
  });

  if (stage === "dev" || stage === "staging") {
    console.log("Strava Callback Status:", mutation.status);
    console.log("Strava Callback Error:", mutation.error);
    console.log("Strava Callback isLoading:", mutation.isLoading);
    console.log("Strava Callback isError:", mutation.isError);
  }

  return {
    putStravaCallback: mutation.mutate,
    isLoading: mutation.isLoading,
    isError: mutation.isError,
    error: mutation.error,
    status: mutation.status,
    data: mutation.data?.data ?? null,
  };
};

export default usePutStravaCallback;
