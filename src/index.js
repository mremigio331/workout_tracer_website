import * as React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AWS from "aws-sdk";
import App from "./App";
import UserProvider from "./provider/UserProvider";
import ApiProvider from "./provider/ApiProvider";

const queryClient = new QueryClient();

AWS.config.update({
  region: "us-west-2",
});

createRoot(document.getElementById("app")).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <ApiProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </ApiProvider>
    </QueryClientProvider>
  </BrowserRouter>,
);
