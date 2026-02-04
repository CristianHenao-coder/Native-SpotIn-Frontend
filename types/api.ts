// API Type Definitions for SpotIn Backend

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
    classroomId?: string;
    program?: string;
    group?: string;
}

export interface UserProfile extends User {
    isActive: boolean;
    createdAt: string;
}

export type AttendanceResult = 'ON_TIME' | 'LATE';
export type AttendanceStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

export interface Attendance {
    _id: string;
    userId: string;
    siteId: string;
    scheduleId?: string;
    qrSessionId: string;
    dateKey: string; // "YYYY-MM-DD"
    markedAt: string; // ISO date string
    location: {
        type: 'Point';
        coordinates: [number, number]; // [lng, lat]
    };
    distanceMeters: number;
    result: AttendanceResult;
    status: AttendanceStatus;
    reviewedByAdminId?: string;
    reviewedAt?: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Schedule {
    _id: string;
    userId: string;
    siteId: string;
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // "HH:MM"
    endTime: string; // "HH:MM"
    lateAfterMinutes: number;
    isActive: boolean;
}

export interface Site {
    _id: string;
    name: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [lng, lat]
    };
    allowedRadiusMeters: number;
    isActive: boolean;
}

export interface MarkAttendanceRequest {
    qrToken: string;
    lat: number;
    lng: number;
}

export interface MarkAttendanceResponse {
    attendance: Attendance;
}

export interface GetAttendanceResponse {
    items: Attendance[];
}

export interface GetScheduleResponse {
    schedule: Schedule | null;
}
