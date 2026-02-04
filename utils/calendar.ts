/**
 * Generate calendar days for a given month
 */
export function generateCalendarDays(year: number, month: number): Array<{ day: number; isCurrentMonth: boolean }> {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const days: Array<{ day: number; isCurrentMonth: boolean }> = [];

    // Add previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        days.push({ day: prevMonthLastDay - i, isCurrentMonth: false });
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ day: i, isCurrentMonth: true });
    }

    // Add next month's days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
        days.push({ day: i, isCurrentMonth: false });
    }

    return days;
}

/**
 * Get month name in Spanish
 */
export function getMonthName(month: number): string {
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month];
}

/**
 * Get day name abbreviation in Spanish
 */
export function getDayName(day: number): string {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[day];
}

/**
 * Get short day names for calendar header
 */
export function getDayNames(): string[] {
    return ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
}

/**
 * Format date as YYYY-MM-DD (dateKey format)
 */
export function formatDateKey(year: number, month: number, day: number): string {
    const monthStr = (month + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
}

/**
 * Check if a date is today
 */
export function isToday(year: number, month: number, day: number): boolean {
    const today = new Date();
    return (
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === day
    );
}
