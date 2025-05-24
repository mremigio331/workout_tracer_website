import React, { createContext, useReducer, useEffect } from "react";
import getStage from "../utility/getStage";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import AWS from "aws-sdk";
import { COGNITO_CONSTANTS } from "../configs/cognitoConfig";

export const UserContext = createContext();

const initialState = {
  user: null,
  nickname: null,
  email: null,
  emailVerified: null,
  name: null,
  preferredUsername: null,
  additionalAttributes: null,
  isAuthenticated: null,
  idToken: null,
  accessToken: null,
};

const userReducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
      };
    case "SET_ADDITIONAL_ATTRIBUTES":
      return {
        ...state,
        additionalAttributes: action.payload,
        emailVerified: action.payload.email_verified,
        name: action.payload.name,
        preferredUsername: action.payload.preferred_username,
      };
    case "LOGOUT":
      return { ...initialState, isAuthenticated: false };
    default:
      return state;
  }
};

const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  const stage = getStage();
  const cognitoConfig = COGNITO_CONSTANTS[stage.toUpperCase()] || COGNITO_CONSTANTS.DEV;

  const cognitoDomain = cognitoConfig.domain;
  const clientId = cognitoConfig.clientId;
  const redirectUri = cognitoConfig.redirectUri;
  const region = cognitoConfig.region;
  const responseType = "code"; // Authorization code flow

  if (!cognitoDomain || !clientId || !redirectUri || !region) {
    throw new Error("Missing required Cognito configuration");
  }

  const constructHostedUIUrl = (path) => {
    return `https://${cognitoDomain}.auth.${region}.amazoncognito.com/${path}?response_type=${responseType}&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  const initiateSignIn = () => {
    const hostedUIUrl = constructHostedUIUrl("login");
    window.location.assign(hostedUIUrl);
  };

  const initiateSignUp = () => {
    const hostedUIUrl = constructHostedUIUrl("signup");
    window.location.assign(hostedUIUrl);
  };

  const logoutUser = () => {
    const hostedLogoutUrl = `https://${cognitoDomain}.auth.${region}.amazoncognito.com/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(redirectUri)}`;
    dispatch({ type: "LOGOUT" });
    Cookies.remove("idToken");
    Cookies.remove("accessToken");
    window.location.assign(hostedLogoutUrl);
  };

  const fetchUserSession = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authorizationCode = urlParams.get("code");

    if (authorizationCode) {
      const tokenUrl = `https://${cognitoDomain}.auth.${region}.amazoncognito.com/oauth2/token`;
      const body = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        code: authorizationCode,
        redirect_uri: redirectUri,
      });

      try {
        const response = await fetch(tokenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tokens");
        }

        const data = await response.json();
        Cookies.set("idToken", data.id_token, {
          secure: true,
          sameSite: "Strict",
        });
        Cookies.set("accessToken", data.access_token, {
          secure: true,
          sameSite: "Strict",
        });

        if (stage === "dev") {
          console.log("idToken:", data.id_token);
          console.log("accessToken:", data.access_token);
        }

        const decodedToken = jwtDecode(data.id_token);
        dispatch({
          type: "SET_USER",
          payload: {
            user: decodedToken,
            nickname: decodedToken.nickname,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
            name: decodedToken.name,
            preferredUsername: decodedToken.preferred_username,
            additionalAttributes: decodedToken,
            idToken: data.id_token,
            accessToken: data.access_token,
          },
        });
      } catch (error) {
        if (stage === "dev") {
          console.error("Error fetching user session:", error);
        }
      }
    }
  };

  const fetchAdditionalUserAttributes = async (accessToken) => {
    const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

    try {
      const userData = await cognitoIdentityServiceProvider
        .getUser({
          AccessToken: accessToken,
        })
        .promise();

      const attributes = userData.UserAttributes.reduce((acc, attribute) => {
        acc[attribute.Name] = attribute.Value;
        return acc;
      }, {});

      dispatch({ type: "SET_ADDITIONAL_ATTRIBUTES", payload: attributes });
    } catch (error) {
      if (stage === "dev") {
        console.error("Error fetching additional user attributes:", error);
      }
    }
  };

  const loadUserSessionFromCookies = () => {
    const idToken = Cookies.get("idToken");
    const accessToken = Cookies.get("accessToken");
    if (idToken && accessToken) {
      const decodedToken = jwtDecode(idToken);
      dispatch({
        type: "SET_USER",
        payload: {
          user: decodedToken,
          nickname: decodedToken.nickname,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
          name: decodedToken.name,
          preferredUsername: decodedToken.preferred_username,
          additionalAttributes: decodedToken,
          idToken,
          accessToken,
        },
      });
      fetchAdditionalUserAttributes(accessToken);
    }
  };

  useEffect(() => {
    loadUserSessionFromCookies();
    fetchUserSession();
    // eslint-disable-next-line
  }, []);

  return (
    <UserContext.Provider
      value={{
        ...state,
        initiateSignIn,
        initiateSignUp,
        logoutUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
