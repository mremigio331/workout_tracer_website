import { STAGING, PROD, DEV } from "../constants/stages";

const getStage = () => {
  const domain = window.location.hostname.trim();

  if (domain === "staging.workouttracer.com") {
    return STAGING;
  } else if (domain === "workouttracer.com") {
    return PROD;
  }

  return DEV;
};

export default getStage;
