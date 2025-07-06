import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { UserAuthenticationContext } from "../provider/UserAuthenticationProvider";
import { apiRequestPut } from "../api/apiRequest";
import { useApi } from "../provider/ApiProvider";

const usePutProfile = () => {
  const { idToken } = useContext(UserAuthenticationContext);
  const { apiEndpoint } = useApi();

  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileFields) => {
      if (!idToken || idToken.length === 0) {
        throw new Error("No ID token available.");
      }
      // Only send allowed fields
      const allowedFields = ["name", "public_profile"];
      const body = {};
      for (const key of allowedFields) {
        if (profileFields[key] !== undefined) {
          body[key] = profileFields[key];
        }
      }
      const response = await apiRequestPut({
        apiEndpoint: `${apiEndpoint}/user/profile`,
        idToken,
        body,
      });
      return response.data;
    },
  });

  // Existing Strava callback mutation (unchanged)
  const stravaCallbackMutation = useMutation({
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
    // For updating user profile fields (email, name, public_profile)
    updateUserProfile: updateProfileMutation.mutate,
    updateUserProfileAsync: updateProfileMutation.mutateAsync,
    updateUserProfileLoading: updateProfileMutation.isLoading,
    updateUserProfileError: updateProfileMutation.error,
    updateUserProfileStatus: updateProfileMutation.status,
    updateUserProfileData: updateProfileMutation.data ?? null,

    // For Strava callback (legacy)
    putStravaCallback: stravaCallbackMutation.mutate,
    putStravaCallbackAsync: stravaCallbackMutation.mutateAsync,
    isLoading: stravaCallbackMutation.isLoading,
    isError: stravaCallbackMutation.isError,
    error: stravaCallbackMutation.error,
    status: stravaCallbackMutation.status,
    data: stravaCallbackMutation.data ?? null,
  };
};

export default usePutProfile;
