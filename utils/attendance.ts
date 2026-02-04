import type { Attendance, AttendanceResult, AttendanceStatus } from '../types/api';

/**
 * Get color for attendance status
 */
export function getAttendanceColor(result: AttendanceResult, status: AttendanceStatus): string {
    if (status === 'REJECTED') return '#ef4444'; // red
    if (result === 'ON_TIME') return '#10b981'; // green
    if (result === 'LATE') return '#f59e0b'; // orange
    return '#6b7280'; // gray
}

/**
 * Get icon for attendance status
 */
export function getAttendanceIcon(result: AttendanceResult, status: AttendanceStatus): any {
    if (status === 'REJECTED') return 'close-circle';
    if (status === 'PENDING') return 'time-outline';
    if (result === 'ON_TIME') return 'checkmark-circle';
    if (result === 'LATE') return 'alert-circle';
    return 'ellipse';
}

/**
 * Get display text for attendance status
 */
export function getAttendanceStatusText(result: AttendanceResult, status: AttendanceStatus): string {
    if (status === 'REJECTED') return 'Ausente';
    if (status === 'PENDING') return 'Pendiente';
    if (result === 'ON_TIME') return 'Presente';
    if (result === 'LATE') return 'Tardanza';
    return 'Desconocido';
}

/**
 * Format date for display
 */
export function formatAttendanceDate(dateString: string): string {
    const date = new Date(dateString);
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];

    return `${dayName} ${day} ${month}`;
}

/**
 * Format time for display (HH:MM)
 */
export function formatAttendanceTime(dateString: string): string {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * Calculate monthly statistics from attendance records
 */
export function calculateMonthlyStats(attendances: Attendance[]) {
    const total = attendances.length;
    if (total === 0) {
        return {
            totalDays: 0,
            presentDays: 0,
            lateDays: 0,
            absentDays: 0,
            attendancePercentage: 0,
            punctualityPercentage: 0,
        };
    }

    const presentDays = attendances.filter(a => a.result === 'ON_TIME' && a.status !== 'REJECTED').length;
    const lateDays = attendances.filter(a => a.result === 'LATE' && a.status !== 'REJECTED').length;
    const absentDays = attendances.filter(a => a.status === 'REJECTED').length;

    const attendedDays = presentDays + lateDays;
    const attendancePercentage = Math.round((attendedDays / total) * 100);
    const punctualityPercentage = attendedDays > 0 ? Math.round((presentDays / attendedDays) * 100) : 0;

    return {
        totalDays: total,
        presentDays,
        lateDays,
        absentDays,
        attendancePercentage,
        punctualityPercentage,
    };
}

/**
 * Get weekly attendance stats (for the last 7 days)
 */
export function getWeeklyStats(attendances: Attendance[]) {
    const days = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    const result = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayKey = date.toISOString().split('T')[0];
        const dayLabel = days[date.getDay()];

        const attended = attendances.some(a => a.dateKey === dayKey && a.status !== 'REJECTED');
        result.push({
            label: dayLabel,
            value: attended ? 100 : 10, // 100% height if attended, 10% if not
        });
    }
    return result;
}

/**
 * Get real achievements based on data
 */
export interface Achievement {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    color: string;
    badge?: string;
}

export function getRealAchievements(attendances: Attendance[]): Achievement[] {
    const achievements: Achievement[] = [];

    // 1. Perfect Week Check (at least 5 on-time attendances in the last 7 items)
    const recent = attendances.slice(0, 7);
    const perfectCount = recent.filter(a => a.result === 'ON_TIME' && a.status !== 'REJECTED').length;
    if (perfectCount >= 5) {
        achievements.push({
            id: 'perfect_week',
            title: 'Semana perfecta',
            subtitle: '5 días consecutivos a tiempo',
            icon: 'medal',
            color: '#fff7ed',
            badge: 'Nuevo'
        });
    }

    // 2. Early Bird Check (first attendance ever or many on-times)
    const onTimeTotal = attendances.filter(a => a.result === 'ON_TIME').length;
    if (onTimeTotal >= 10) {
        achievements.push({
            id: 'punctual_king',
            title: 'Rey de la Puntualidad',
            subtitle: 'Más de 10 registros a tiempo',
            icon: 'ribbon',
            color: '#eff6ff',
        });
    }

    // 3. Commitment check
    if (attendances.length >= 20) {
        achievements.push({
            id: 'commited',
            title: 'Compromiso Total',
            subtitle: '20 asistencias registradas',
            icon: 'flame',
            color: '#f0fdf4',
        });
    }

    return achievements;
}

/**
 * Group attendances by date (dateKey)
 */
export function groupAttendancesByDate(attendances: Attendance[]): Record<string, Attendance> {
    return attendances.reduce((acc, attendance) => {
        acc[attendance.dateKey] = attendance;
        return acc;
    }, {} as Record<string, Attendance>);
}
