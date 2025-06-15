import { STAGING, PROD, DEV } from "../constants/stages";

const getStage = () => {
  const domain = window.location.hostname.trim();

  console.log("Current Domain:", domain);

  if (domain === "staging.workouttracer.com") {
    return STAGING;
  } else if (
    domain === "workouttracer.com" ||
    domain === "www.workouttracer.com"
  ) {
    return PROD;
  }

  return DEV;
};

export default getStage;
