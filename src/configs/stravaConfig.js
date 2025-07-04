export const STRAVA_CONFIGS = {
  DEV: {
    OAUTH_URL:
      "https://www.strava.com/oauth/authorize?client_id=162695&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=read,activity:read",
  },
  STAGING: {
    OAUTH_URL:
      "https://www.strava.com/oauth/authorize?client_id=162695&response_type=code&redirect_uri=https://staging.workouttracer.com/user/profile&approval_prompt=force&scope=read,activity:read",
  },
  PROD: {
    OAUTH_URL:
      "https://www.strava.com/oauth/authorize?client_id=158981&response_type=code&redirect_uri=https://workouttracer.com/user/profile&approval_prompt=force&scope=read,activity:read",
  },
};
