import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { DeviceEventEmitter } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Interceptor to add JWT token
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await SecureStore.getItemAsync('auth_token');
            if (token) {
                console.log(`[API Request] Adding token for ${config.url}. Token starts with: ${token.substring(0, 20)}...`);
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                console.log(`[API Request] No token found for ${config.url}`);
            }
        } catch (error) {
            console.error("Error retrieving token for request", error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor to handle 401/403 errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;
        const url = error.config?.url;

        if (status === 401 || status === 403) {
            const isLoginRequest = url?.includes('/api/auth/login');
            const errorMessage = error.response?.data?.message || 'No specific error message provided';

            if (!isLoginRequest) {
                console.warn(`[API Response] Error ${status} on ${url}. Backend message: ${errorMessage}`);

                if (status === 401) {
                    console.warn(`[API Response] Clearing session due to 401 Unauthorized.`);
                    await SecureStore.deleteItemAsync('auth_token');
                    await SecureStore.deleteItemAsync('user_session');
                    DeviceEventEmitter.emit('unauthorized');
                } else {
                    console.warn(`[API Response] 403 Forbidden. Possible permission issue.`);
                }
            } else {
                console.log(`[API Response] Login failed with ${status}. Message: ${errorMessage}`);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
