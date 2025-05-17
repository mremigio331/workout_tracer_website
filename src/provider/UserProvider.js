import React, { createContext, useState, useEffect } from "react";
import awsconfig from "../constants/aws-exports";
import getStage from "../utility/getStage";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import AWS from "aws-sdk";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState(null);
  const [email, setEmail] = useState(null);
  const [emailVerified, setEmailVerified] = useState(null);
  const [name, setName] = useState(null);
  const [preferredUsername, setPreferredUsername] = useState(null);
  const [additionalAttributes, setAdditionalAttributes] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const stage = getStage();

  const cognitoDomain =
    stage === "prod"
      ? process.env.PROD_REACT_APP_COGNITO_DOMAIN
      : process.env.DEV_REACT_APP_COGNITO_DOMAIN;
  const clientId =
    stage === "prod"
      ? process.env.PROD_REACT_APP_USER_POOL_WEB_CLIENT_ID
      : process.env.DEV_REACT_APP_USER_POOL_WEB_CLIENT_ID;
  const redirectUri =
    stage === "prod"
      ? "https://Workout Tracerbet.com/"
      : "http://localhost:8080/";
  const region = "us-west-2";
  const responseType = "code"; // Authorization code flow

  if (!cognitoDomain || !clientId || !redirectUri || !region) {
    throw new Error(
      "Missing required environment variables for Cognito configuration",
    );
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
    setUser(null);
    setNickname(null);
    setEmail(null);
    setEmailVerified(null);
    setName(null);
    setPreferredUsername(null);
    setAdditionalAttributes({});
    setIsAuthenticated(false);
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
          httpOnly: true,
        });
        Cookies.set("accessToken", data.access_token, {
          secure: true,
          sameSite: "Strict",
          httpOnly: true,
        });

        const decodedToken = jwtDecode(data.id_token);
        setUser(decodedToken);
        setNickname(decodedToken.nickname);
        setEmail(decodedToken.email);
        setEmailVerified(decodedToken.email_verified);
        setName(decodedToken.name);
        setPreferredUsername(decodedToken.preferred_username);
        setAdditionalAttributes(decodedToken);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error fetching user session:", error);
      }
    }
  };

  const fetchAdditionalUserAttributes = async (accessToken) => {
    AWS.config.update({
      region: region,
      credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: awsconfig.Auth.identityPoolId,
      }),
    });

    const cognitoIdentityServiceProvider =
      new AWS.CognitoIdentityServiceProvider();

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

      setAdditionalAttributes(attributes);
      setEmailVerified(attributes.email_verified);
      setName(attributes.name);
      setPreferredUsername(attributes.preferred_username);
    } catch (error) {
      console.error("Error fetching additional user attributes:", error);
    }
  };

  const loadUserSessionFromCookies = () => {
    const idToken = Cookies.get("idToken");
    const accessToken = Cookies.get("accessToken");
    if (idToken && accessToken) {
      const decodedToken = jwtDecode(idToken);
      setUser(decodedToken);
      setNickname(decodedToken.nickname);
      setEmail(decodedToken.email);
      setEmailVerified(decodedToken.email_verified);
      setName(decodedToken.name);
      setPreferredUsername(decodedToken.preferred_username);
      setAdditionalAttributes(decodedToken);
      setIsAuthenticated(true);
      fetchAdditionalUserAttributes(accessToken);
    }
  };

  useEffect(() => {
    loadUserSessionFromCookies();
    fetchUserSession();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        nickname,
        email,
        emailVerified,
        name,
        preferredUsername,
        additionalAttributes,
        isAuthenticated,
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
