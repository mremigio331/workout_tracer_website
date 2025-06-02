import React, {
  createContext,
  useReducer,
  useMemo,
  useContext,
  useEffect,
} from "react";
import useGetUserProfile from "../hooks/useGetUserProfile";

const UserProfileContext = createContext();

const initialState = {
  userProfile: null,
  isUserFetching: false,
  isUserError: false,
};

const userProfileReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isUserFetching: true, isUserError: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isUserFetching: false,
        userProfile: action.payload,
        isUserError: null,
      };
    case "FETCH_ERROR":
      return { ...state, isUserFetching: false, isUserError: action.payload };
    case "CLEAR":
      return initialState;
    default:
      return state;
  }
};

export const UserProfileProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userProfileReducer, initialState);

  const { userProfile, isUserFetching, isUserError } = useGetUserProfile();

  console.log("User Profile Data:", userProfile);

  useEffect(() => {
    if (isUserFetching) {
      dispatch({ type: "FETCH_START" });
    } else if (userProfile) {
      dispatch({ type: "FETCH_SUCCESS", payload: userProfile });
    } else if (isUserError) {
      dispatch({ type: "FETCH_ERROR", payload: isUserError });
    }
  }, [userProfile, isUserFetching, isUserError, isUserError]);

  const setUserProfile = (user) => {
    dispatch({ type: "FETCH_SUCCESS", payload: user });
  };

  const clearProfile = () => {
    dispatch({ type: "CLEAR" });
  };

  const value = useMemo(
    () => ({
      userProfile: state.userProfile,
      isUserFetching: state.isUserFetching,
      isUserError: state.isUserError,
      setUserProfile,
      clearProfile,
    }),
    [state.userProfile, state.isUserFetching, state.isUserError],
  );

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext);
