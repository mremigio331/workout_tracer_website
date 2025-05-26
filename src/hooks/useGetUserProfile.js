import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { UserContext } from "../provider/UserProvider";
import { apiRequestGet } from "../api/apiRequest";
import { useApi } from "../provider/ApiProvider";

export const useGetUserProfile = () => {
  const { idToken, user_id } = useContext(UserContext);
  const { apiEndpoint, stage } = useApi();

  const { data, isFetching, isError, status, error } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () =>
      apiRequestGet({
        apiEndpoint: `${apiEndpoint}/user/profile?user_id=${user_id}`,
        idToken,
      }),
    enabled: !!idToken,
    select: (data) => ({
      status: "success",
      data,
    }),
  });

  if (stage === "dev" || stage === "staging") {
    console.log("User Profile Data:", data);
    console.log("User Profile Status:", status);
    console.log("User Profile Error:", error);
    console.log("User Profile isFetching:", isFetching);
    console.log("User Profile isError:", isError);
  }

  return {
    userProfile: data,
    isFetching,
    isError,
    status,
    error,
  };
};
