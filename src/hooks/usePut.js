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

      const response = await apiRequestPut({
        apiEndpoint: `${apiEndpoint}/strava/profile/callback`,
        idToken,
        body: { auth_code: authCode },
      });
      return response.data;
    },
  });

  return {
    putStravaCallback: mutation.mutate,
    putStravaCallbackAsync: mutation.mutateAsync,
    isLoading: mutation.isLoading,
    isError: mutation.isError,
    error: mutation.error,
    status: mutation.status,
    data: mutation.data ?? null,
  };
};

export default usePutStravaCallback;
