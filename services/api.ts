import axios from 'axios';

// Access the environment variable
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
});

// Optional: Add interceptors for tokens
api.interceptors.request.use(
    async (config) => {
        // You can add logic here to retrieve a token from SecureStore and add it to headers
        // const token = await SecureStore.getItemAsync('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
