import {
  PROD_WEBSITE_ENDPOINT,
  STAGING_WEBSITE_ENDPOINT,
  PROD_API_ENDPOINT,
  STAGING_API_ENDPOINT,
} from "../constants/endpoints";

import { STAGING, PROD, DEV } from "../constants/stages";
import getStage from "./getStage";

const getApi = () => {
 
  const stage = getStage()

  console.log("getApi stage:", stage);

  if (stage == PROD ) {
    return PROD_API_ENDPOINT;
  } else if (stage == STAGING ) {
    return STAGING_API_ENDPOINT;
  }

  return STAGING_API_ENDPOINT;
  //return 'http://localhost:5000'; // Default to local API if no match
};

export default getApi;
