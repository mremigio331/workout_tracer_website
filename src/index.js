import * as React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AWS from "aws-sdk";
import WorkoutTracer from "./WorkoutTracer";
import UserAuthenticationProvider from "./provider/UserAuthenticationProvider";
import ApiProvider from "./provider/ApiProvider";
import { UserStravaProvider } from "./provider/UserStravaProvider";
import { UserProfileProvider } from "./provider/UserProfileProvider";
import { StravaWorkoutsProvider } from "./provider/StravaWorkoutsProvider";

const queryClient = new QueryClient();

AWS.config.update({
  region: "us-west-2",
});

createRoot(document.getElementById("app")).render(
  <QueryClientProvider client={queryClient}>
    <ApiProvider>
      <UserAuthenticationProvider>
        <UserProfileProvider>
          <UserStravaProvider>
            <StravaWorkoutsProvider>
              <WorkoutTracer />
            </StravaWorkoutsProvider>
          </UserStravaProvider>
        </UserProfileProvider>
      </UserAuthenticationProvider>
    </ApiProvider>
  </QueryClientProvider>,
);
