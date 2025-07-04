import {
  PROD_WEBSITE_ENDPOINT,
  STAGING_WEBSITE_ENDPOINT,
} from "../constants/endpoints";

const STAGING_REACT_APP_USER_POOL_ID = "us-west-2_rXYhgQr1l";
const STAGING_REACT_APP_USER_POOL_WEB_CLIENT_ID = "255dgs8d57tps872729dhgu6o8";
const STAGING_REACT_APP_REGION = "us-west-2";
const STAGING_REACT_APP_COGNITO_DOMAIN = "workouttracer-staging";

const PROD_REACT_APP_USER_POOL_ID = "us-west-2_Uw45nj28j";
const PROD_REACT_APP_USER_POOL_WEB_CLIENT_ID = "caq7e5fj6dfv6ograc3cca2bl";
const PROD_REACT_APP_REGION = "us-west-2";
const PROD_REACT_APP_COGNITO_DOMAIN = "workouttracer";

export const COGNITO_CONSTANTS = {
  DEV: {
    clientId: STAGING_REACT_APP_USER_POOL_WEB_CLIENT_ID,
    domain: STAGING_REACT_APP_COGNITO_DOMAIN,
    redirectUri: "http://localhost:8080/",
    region: STAGING_REACT_APP_REGION,
    userPoolId: STAGING_REACT_APP_USER_POOL_ID,
  },
  STAGING: {
    clientId: STAGING_REACT_APP_USER_POOL_WEB_CLIENT_ID,
    domain: STAGING_REACT_APP_COGNITO_DOMAIN,
    redirectUri: `${STAGING_WEBSITE_ENDPOINT}/`,
    region: STAGING_REACT_APP_REGION,
    userPoolId: STAGING_REACT_APP_USER_POOL_ID,
  },
  PROD: {
    clientId: PROD_REACT_APP_USER_POOL_WEB_CLIENT_ID,
    domain: PROD_REACT_APP_COGNITO_DOMAIN,
    redirectUri: `${PROD_WEBSITE_ENDPOINT}/`,
    region: PROD_REACT_APP_REGION,
    userPoolId: PROD_REACT_APP_USER_POOL_ID,
  },
};
