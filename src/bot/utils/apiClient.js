const axios = require('axios');

const getApiClient = (token = null) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return axios.create({
    baseURL: process.env.API_URL || 'http://localhost:5000/api',
    headers,
    timeout: 10000 // 10 seconds timeout
  });
};

module.exports = getApiClient;
