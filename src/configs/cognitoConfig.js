import { PROD_WEBSITE_ENDPOINT, STAGING_WEBSITE_ENDPOINT } from '../constants/endpoints';

const DEV_REACT_APP_USER_POOL_ID = 'us-west-2_bLFbQ7h8f';
const DEV_REACT_APP_USER_POOL_WEB_CLIENT_ID = '10tsgr1h5a5ub0ns22mgtbd02n';
const DEV_REACT_APP_REGION = 'us-west-2';
const DEV_REACT_APP_COGNITO_DOMAIN = 'workouttracer-staging';

const PROD_REACT_APP_USER_POOL_ID = 'us-west-2_tRJuGTBYS';
const PROD_REACT_APP_USER_POOL_WEB_CLIENT_ID = 'k9f1d1qm49dccuvu87hqb4csi';
const PROD_REACT_APP_REGION = 'us-west-2';
const PROD_REACT_APP_COGNITO_DOMAIN = 'workouttracer';



export const COGNITO_CONSTANTS = {
    DEV: {
        clientId: DEV_REACT_APP_USER_POOL_WEB_CLIENT_ID,
        domain: DEV_REACT_APP_COGNITO_DOMAIN,
        redirectUri: "http://localhost:8080/",
        region: DEV_REACT_APP_REGION,
        userPoolId: DEV_REACT_APP_USER_POOL_ID,
    },
    STAGING: {
        clientId: DEV_REACT_APP_USER_POOL_WEB_CLIENT_ID,
        domain: DEV_REACT_APP_COGNITO_DOMAIN,
        redirectUri: PROD_WEBSITE_ENDPOINT,
        region: DEV_REACT_APP_REGION,
        userPoolId: DEV_REACT_APP_USER_POOL_ID,
    },
    PROD: {
        clientId: PROD_REACT_APP_USER_POOL_WEB_CLIENT_ID,
        domain: PROD_REACT_APP_COGNITO_DOMAIN,
        redirectUri: STAGING_WEBSITE_ENDPOINT,
        region: PROD_REACT_APP_REGION,
        userPoolId: PROD_REACT_APP_USER_POOL_ID,
    },
}

