import {STAGING, PROD, DEV } from "../constants/stages";

const getStage = () => {
  const domain = window.location.hostname.trim(); // Trim any leading/trailing spaces

  if (domain.includes("workouttracer.com")) {
    return PROD;
  } else if (
    domain.includes("staging.workoutracer.com")
  ) {
    return STAGING;
  }

  return DEV;
};

export default getStage;
