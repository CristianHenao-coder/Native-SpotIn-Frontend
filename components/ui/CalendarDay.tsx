import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CalendarDayProps {
    day: number;
    status?: 'present' | 'late' | 'absent' | null;
    isToday?: boolean;
    isCurrentMonth?: boolean;
    onPress?: () => void;
}

export default function CalendarDay({ 
    day, 
    status, 
    isToday = false, 
    isCurrentMonth = true,
    onPress 
}: CalendarDayProps) {
    const getBackgroundColor = () => {
        if (!isCurrentMonth) return 'transparent';
        if (status === 'present') return '#10b981'; // green
        if (status === 'late') return '#f59e0b'; // orange
        if (status === 'absent') return '#ef4444'; // red
        return 'transparent';
    };

    const getTextColor = () => {
        if (!isCurrentMonth) return '#d1d5db';
        if (status) return 'white';
        if (isToday) return '#2563eb';
        return '#1f2937';
    };

    return (
        <TouchableOpacity 
            style={[
                styles.container,
                { backgroundColor: getBackgroundColor() },
                isToday && !status && styles.todayBorder,
            ]}
            onPress={onPress}
            disabled={!isCurrentMonth}
            activeOpacity={0.7}
        >
            <Text style={[styles.dayText, { color: getTextColor() }]}>
                {day}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 2,
    },
    todayBorder: {
        borderWidth: 2,
        borderColor: '#2563eb',
    },
    dayText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
