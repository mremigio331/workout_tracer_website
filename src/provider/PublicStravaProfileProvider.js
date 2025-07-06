import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";
import useGetPublicStravaProfile from "../hooks/useGetPublicStravaProfile";

const PublicStravaProfileContext = createContext();

export const PublicStravaProfileProvider = ({ children }) => {
  const [stravaId, setStravaId] = useState(null);

  const {
    publicStravaProfile,
    isPublicStravaFetching,
    isPublicStravaError,
    publicStravaStatus,
    publicStravaRefetch,
    publicStravaError,
  } = useGetPublicStravaProfile({ stravaId });

  const setPublicStravaId = useCallback((id) => setStravaId(id), []);

  const value = useMemo(
    () => ({
      publicStravaProfile,
      isPublicStravaFetching,
      isPublicStravaError,
      publicStravaStatus,
      publicStravaRefetch,
      publicStravaError,
      setPublicStravaId,
      stravaId,
    }),
    [
      publicStravaProfile,
      isPublicStravaFetching,
      isPublicStravaError,
      publicStravaStatus,
      publicStravaRefetch,
      publicStravaError,
      setPublicStravaId,
      stravaId,
    ],
  );
  return (
    <PublicStravaProfileContext.Provider value={value}>
      {children}
    </PublicStravaProfileContext.Provider>
  );
};

export const usePublicStravaProfile = () =>
  useContext(PublicStravaProfileContext);
