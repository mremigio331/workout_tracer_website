import axios from "axios";

export const apiRequestGet = async ({ apiEndpoint, accessToken }) => {
  const response = await axios.get(apiEndpoint, {
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });
  return response.data;
};

export const apiRequestPost = async ({ apiEndpoint, accessToken, body }) => {
  const response = await axios.post(apiEndpoint, body, {
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });
  return response.data;
};

export const apiRequestPut = async ({ apiEndpoint, accessToken, body }) => {
  const response = await axios.put(apiEndpoint, body, {
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });
  return response.data;
};

export const apiRequestDelete = async ({ apiEndpoint, accessToken }) => {
  const response = await axios.delete(apiEndpoint, {
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });
  return response.data;
};
