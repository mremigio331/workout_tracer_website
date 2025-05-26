import axios from "axios";

export const apiRequestGet = async ({ apiEndpoint, idToken }) => {
  const response = await axios.get(apiEndpoint, {
    headers: {
      "Content-Type": "application/json",
      ...(idToken && { Authorization: `Bearer ${idToken}` }),
    },
  });
  return response.data;
};

export const apiRequestPost = async ({ apiEndpoint, idToken, body }) => {
  const response = await axios.post(apiEndpoint, body, {
    headers: {
      "Content-Type": "application/json",
      ...(idToken && { Authorization: `Bearer ${idToken}` }),
    },
  });
  return response.data;
};

export const apiRequestPut = async ({ apiEndpoint, idToken, body }) => {
  const response = await axios.put(apiEndpoint, body, {
    headers: {
      "Content-Type": "application/json",
      ...(idToken && { Authorization: `Bearer ${idToken}` }),
    },
  });
  return response.data;
};

export const apiRequestDelete = async ({ apiEndpoint, idToken }) => {
  const response = await axios.delete(apiEndpoint, {
    headers: {
      "Content-Type": "application/json",
      ...(idToken && { Authorization: `Bearer ${idToken}` }),
    },
  });
  return response.data;
};
