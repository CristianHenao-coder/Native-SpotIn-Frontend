import api from './api';
import type { GetScheduleResponse, User } from '../types/api';

export const userService = {
    /**
     * Get user's schedule for today
     * GET /api/mobile/me/schedule
     */
    getMySchedule: async (): Promise<GetScheduleResponse> => {
        const response = await api.get<GetScheduleResponse>('/api/mobile/me/schedule');
        return response.data;
    },

    /**
     * Get current user profile (placeholder - endpoint may not exist yet)
     * GET /api/mobile/me
     */
    getMyProfile: async (): Promise<{ user: User }> => {
        const response = await api.get<{ user: User }>('/api/mobile/me');
        return response.data;
    },
};
