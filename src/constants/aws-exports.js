const awsconfig = {
  Auth: {
    identityPoolId: process.env.DEV_REACT_APP_IDENTITY_POOL_ID,
    region: process.env.DEV_REACT_APP_REGION,
    userPoolId: process.env.DEV_REACT_APP_USER_POOL_ID,
    userPoolWebClientId: process.env.DEV_REACT_APP_USER_POOL_WEB_CLIENT_ID,
  },
};

export default awsconfig;
