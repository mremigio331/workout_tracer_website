import { useMutation } from "@tanstack/react-query";
import { useContext, useMemo } from "react";
import { UserAuthenticationContext } from "../provider/UserAuthenticationProvider";
import { apiRequestPut } from "../api/apiRequest";
import { useApi } from "../provider/ApiProvider";

const usePutStravaCallback = () => {
  const { idToken } = useContext(UserAuthenticationContext);
  const { apiEndpoint, stage } = useApi();

  const mutation = useMutation({
    mutationFn: async (authCode) => {
      if (!idToken || idToken.length === 0) {
        throw new Error("No ID token available.");
      }

      if (stage === "dev" || stage === "staging") {
        console.log("Using idToken:", idToken?.slice(0, 30));
      }

      // Await the axios call and return only the data
      const response = await apiRequestPut({
        apiEndpoint: `${apiEndpoint}/strava/profile/callback`,
        idToken,
        body: { auth_code: authCode },
      });
      return response.data; // <-- Only return the data, not the whole axios response
    },
  });

  return {
    putStravaCallback: mutation.mutate,
    putStravaCallbackAsync: mutation.mutateAsync,
    isLoading: mutation.isLoading,
    isError: mutation.isError,
    error: mutation.error,
    status: mutation.status,
    data: mutation.data ?? null, // <-- No longer need .data?.data
  };
};

export default usePutStravaCallback;
