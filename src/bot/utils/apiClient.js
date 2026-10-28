const axios = require('axios');

const getBaseApiUrl = () => {
  if (process.env.INTERNAL_API_URL) {
    return process.env.INTERNAL_API_URL;
  }
  const port = process.env.PORT || 5000;
  // If API_URL is set and points to an external production URL (not localhost), use it
  if (process.env.API_URL && !process.env.API_URL.includes('localhost') && !process.env.API_URL.includes('127.0.0.1')) {
    return process.env.API_URL;
  }
  // Default to internal loopback on the active port (works locally and on Render/cloud)
  return `http://127.0.0.1:${port}/api`;
};

const getApiClient = (token = null) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return axios.create({
    baseURL: getBaseApiUrl(),
    headers,
    timeout: 20000 // 20 seconds timeout
  });
};

getApiClient.getApiClient = getApiClient;
getApiClient.getBaseApiUrl = getBaseApiUrl;

module.exports = getApiClient;
