import React, {
  createContext,
  useReducer,
  useMemo,
  useContext,
  useEffect,
} from "react";
import useGetStravaProfile from "../hooks/useGetStravaProfile";

const UserStravaContext = createContext();

const initialState = {
  stravaProfile: null,
  isStravaFetching: false,
  isStravaError: false,
};

const userStravaReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isStravaFetching: true, isStravaError: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isStravaFetching: false,
        stravaProfile: action.payload,
        isStravaError: null,
      };
    case "FETCH_ERROR":
      return {
        ...state,
        isStravaFetching: false,
        isStravaError: action.payload,
      };
    case "CLEAR":
      return initialState;
    default:
      return state;
  }
};

export const UserStravaProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userStravaReducer, initialState);

  // Memoize hook values to avoid unnecessary rerenders
  const {
    stravaProfile: rawStravaProfile,
    isStravaFetching: rawIsStravaFetching,
    isStravaError: rawIsStravaError,
    stravaRefetch: rawStravaRefetch,
  } = useGetStravaProfile();

  const stravaProfile = useMemo(() => rawStravaProfile, [rawStravaProfile]);
  const isStravaFetching = useMemo(
    () => rawIsStravaFetching,
    [rawIsStravaFetching],
  );
  const isStravaError = useMemo(() => rawIsStravaError, [rawIsStravaError]);
  const stravaRefetch = useMemo(() => rawStravaRefetch, [rawStravaRefetch]);

  console.log("Strava Profile Data:", stravaProfile);
  // Sync reducer state with hook values
  useEffect(() => {
    if (isStravaFetching) {
      dispatch({ type: "FETCH_START" });
    } else if (stravaProfile) {
      dispatch({ type: "FETCH_SUCCESS", payload: stravaProfile });
    } else if (isStravaError) {
      dispatch({ type: "FETCH_ERROR", payload: isStravaError });
    }
    // Only run when these values change
  }, [stravaProfile, isStravaFetching, isStravaError]);

  const setAthlete = (stravaProfile) => {
    dispatch({ type: "FETCH_SUCCESS", payload: stravaProfile });
  };

  const clearAthlete = () => {
    dispatch({ type: "CLEAR" });
  };

  const value = useMemo(
    () => ({
      stravaProfile: state.stravaProfile,
      isStravaFetching: state.isStravaFetching,
      isStravaError: state.isStravaError,
      setAthlete,
      clearAthlete,
      stravaRefetch,
    }),
    [
      state.stravaProfile,
      state.isStravaFetching,
      state.isStravaError,
      stravaRefetch,
    ],
  );

  return (
    <UserStravaContext.Provider value={value}>
      {children}
    </UserStravaContext.Provider>
  );
};

export const useStravaProfile = () => useContext(UserStravaContext);
