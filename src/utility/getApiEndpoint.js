import {
  PROD_WEBSITE_ENDPOINT,
  STAGING_WEBSITE_ENDPOINT,
  PROD_API_ENDPOINT,
  STAGING_API_ENDPOINT,
} from "../constants/endpoints";

const getApi = () => {
  const domain = window.location.hostname.trim();

  // Extract hostnames from endpoints
  const prodHost = PROD_WEBSITE_ENDPOINT.replace(/^https?:\/\//, '');
  const stagingHost = STAGING_WEBSITE_ENDPOINT.replace(/^https?:\/\//, '');

  if (domain.includes(prodHost)) {
    return PROD_API_ENDPOINT;
  } else if (domain.includes(stagingHost)) {
    return STAGING_API_ENDPOINT;
  }

  return STAGING_API_ENDPOINT;
};

export default getApi;
