import api from './api';

// Define types for your API responses
interface AuthResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: 'ADMIN' | 'USER';
    };
}

export const authService = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/api/auth/login', { email, password });
        return response.data;
    },
};
