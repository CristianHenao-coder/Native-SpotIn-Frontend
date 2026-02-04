import api from './api';
import type {
    MarkAttendanceRequest,
    MarkAttendanceResponse,
    GetAttendanceResponse
} from '../types/api';

export const attendanceService = {
    /**
     * Mark attendance by scanning QR code
     * POST /api/mobile/attendance/mark
     */
    markAttendance: async (qrToken: string, lat: number, lng: number): Promise<MarkAttendanceResponse> => {
        const response = await api.post<MarkAttendanceResponse>(
            '/api/mobile/attendance/mark',
            { qrToken, lat, lng }
        );
        return response.data;
    },

    /**
     * Get user's attendance history
     * GET /api/mobile/attendance/mine
     */
    getMyAttendance: async (): Promise<GetAttendanceResponse> => {
        const response = await api.get<GetAttendanceResponse>('/api/mobile/attendance/mine');
        return response.data;
    },
};
