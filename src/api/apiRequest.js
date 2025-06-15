import axios from "axios";

export const apiRequestGet = (apiEndpoint, route, idToken) => {
  return axios.get(encodeURI(`${apiEndpoint}${route}`), {
    headers: {
      "Content-Type": "application/json",
      ...(idToken && { Authorization: `Bearer ${idToken}` }),
    },
  });
};

export const apiRequestPost = ({ apiEndpoint, idToken, body }) => {
  return axios.post(apiEndpoint, body, {
    headers: {
      "Content-Type": "application/json",
      ...(idToken && { Authorization: `Bearer ${idToken}` }),
    },
  });
};

export const apiRequestPut = ({ apiEndpoint, idToken, body }) => {
  return axios.put(apiEndpoint, body, {
    headers: {
      "Content-Type": "application/json",
      ...(idToken && { Authorization: `Bearer ${idToken}` }),
    },
  });
};

export const apiRequestDelete = ({ apiEndpoint, idToken }) => {
  return axios.delete(apiEndpoint, {
    headers: {
      "Content-Type": "application/json",
      ...(idToken && { Authorization: `Bearer ${idToken}` }),
    },
  });
};
