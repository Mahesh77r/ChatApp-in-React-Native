// apiClient.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Use AsyncStorage for React Native

const getHeader = () =>{
  const token = AsyncStorage.getItem('jwtToken');
  return {
    Authorization: token
  };
}

// Create an Axios instance with default settings
const apiClient = axios.create({
  baseURL: 'http://192.168.1.120:8000/api', 
  timeout: 5000, 
  headers: getHeader()
});

// Custom error handler
const handleError = (error) => {
    if (error.response) {
      console.error('Server responded with an error:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  };

  


export const loginUserNew = async (data, headers = {})=>{
    try {
      console.log(data)
        const endpoint = `/user/AllEmployeeLogin`
        const response = await apiClient.post(endpoint, data, { headers});
        return response;
      } catch (error) {
        handleError(error);
      }
};
export const getAllUsers = async (data, headers = {})=>{
    try {
        const endpoint = `/users`
        const response = await apiClient.get(endpoint, data, { headers});
        return response;
      } catch (error) {
        handleError(error);
      }
};



