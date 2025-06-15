import React, {
  createContext,
  useReducer,
  useMemo,
  useContext,
  useEffect,
} from "react";
import useGetStravaWorkouts from "../hooks/useGetStravaWorkouts";

const StravaWorkoutsContext = createContext();

const initialState = {
  stravaWorkouts: [],
  isStravaWorkoutFetching: false,
  isStravaWorkoutError: false,
};

const stravaWorkoutsReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":
      return {
        ...state,
        isStravaWorkoutFetching: true,
        isStravaWorkoutError: null,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isStravaWorkoutFetching: false,
        stravaWorkouts: action.payload,
        isStravaWorkoutError: null,
      };
    case "FETCH_ERROR":
      return {
        ...state,
        isStravaWorkoutFetching: false,
        isStravaWorkoutError: action.payload,
      };
    case "CLEAR":
      return initialState;
    default:
      return state;
  }
};

export const StravaWorkoutsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(stravaWorkoutsReducer, initialState);

  const {
    stravaWorkouts: rawStravaWorkouts,
    isStravaWorkoutFetching: rawIsStravaWorkoutFetching,
    isStravaWorkoutError: rawIsStravaWorkoutError,
    stravaWorkoutRefetch,
  } = useGetStravaWorkouts();

  // Sync reducer state with hook values (pattern from UserStravaProvider)
  useEffect(() => {
    if (rawIsStravaWorkoutFetching) {
      dispatch({ type: "FETCH_START" });
    } else if (rawIsStravaWorkoutError) {
      dispatch({ type: "FETCH_ERROR", payload: rawIsStravaWorkoutError });
    } else if (Array.isArray(rawStravaWorkouts)) {
      dispatch({ type: "FETCH_SUCCESS", payload: rawStravaWorkouts });
    }
    // Only depend on raw values from the hook
  }, [rawStravaWorkouts, rawIsStravaWorkoutFetching, rawIsStravaWorkoutError]);

  const clearWorkouts = () => {
    dispatch({ type: "CLEAR" });
  };

  const value = useMemo(
    () => ({
      stravaWorkouts: state.stravaWorkouts,
      isStravaWorkoutFetching: state.isStravaWorkoutFetching,
      isStravaWorkoutError: state.isStravaWorkoutError,
      refetchStravaWorkouts: stravaWorkoutRefetch,
      clearWorkouts,
    }),
    [
      state.stravaWorkouts,
      state.isStravaWorkoutFetching,
      state.isStravaWorkoutError,
      stravaWorkoutRefetch,
    ],
  );

  return (
    <StravaWorkoutsContext.Provider value={value}>
      {children}
    </StravaWorkoutsContext.Provider>
  );
};

export const useStravaWorkouts = () => useContext(StravaWorkoutsContext);
