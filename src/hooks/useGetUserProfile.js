import { useQuery } from "@tanstack/react-query";
import { useContext, useMemo } from "react";
import { UserAuthenticationContext } from "../provider/UserAuthenticationProvider";
import { apiRequestGet } from "../api/apiRequest";
import { useApi } from "../provider/ApiProvider";

const useGetUserProfile = (enabled = true) => {
  const { idToken } = useContext(UserAuthenticationContext);
  const { apiEndpoint, stage } = useApi();

  const isEnabled = useMemo(
    () =>
      enabled && !!idToken && typeof idToken === "string" && idToken.length > 0,
    [enabled, idToken],
  );

  const { data, isFetching, isError, status, error } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => apiRequestGet(apiEndpoint, "/user/profile", idToken),
    enabled: isEnabled,
    keepPreviousData: true,
  });

  if (stage === "dev" || stage === "staging") {
    console.log("User Profile Data:", data);
    console.log("User Profile Status:", status);
    console.log("User Profile Error:", error);
    console.log("User Profile isFetching:", isFetching);
    console.log("User Profile isError:", isError);
  }

  return {
    userProfile: data ? data.data.user_profile : {},
    isUserFetching: isFetching,
    isUserError: isError,
    userStatus: status,
    userError: error,
  };
};

export default useGetUserProfile;
