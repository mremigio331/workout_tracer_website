import * as React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AWS from "aws-sdk";
import App from "./App";
import UserProvider from "./provider/UserProvider";
import awsconfig from "./constants/aws-exports";

const queryClient = new QueryClient();

const validateAwsConfig = (config) => {
  const { identityPoolId, region, userPoolId, userPoolWebClientId } =
    config.Auth;

  if (!identityPoolId) {
    throw new Error("identityPoolId is missing.");
  }
  if (!region) {
    throw new Error("Region is missing.");
  }
  if (!userPoolId) {
    throw new Error("userPoolId is missing.");
  }
  if (!userPoolWebClientId) {
    throw new Error("userPoolWebClientId is missing.");
  }

  return true;
};

try {
  validateAwsConfig(awsconfig);

  // Configure AWS SDK with Cognito Identity Provider for user authentication
  AWS.config.update({
    region: awsconfig.Auth.region,
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: awsconfig.Auth.identityPoolId,
    }),
  });

  const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider(
    {
      region: awsconfig.Auth.region,
    },
  );

  console.log("AWS SDK configured successfully.");
} catch (error) {
  console.error("AWS SDK configuration error:", error.message);
}

createRoot(document.getElementById("app")).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <App />
      </UserProvider>
    </QueryClientProvider>
  </BrowserRouter>,
);
