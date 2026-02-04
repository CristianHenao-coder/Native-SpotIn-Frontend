import { View, Text, StyleSheet } from 'react-native';
import type { AttendanceResult, AttendanceStatus } from '../../types/api';
import { Ionicons } from '@expo/vector-icons';
import { 
    getAttendanceColor, 
    getAttendanceIcon, 
    getAttendanceStatusText 
} from '../../utils/attendance';

interface AttendanceHistoryItemProps {
    date: string;
    time: string;
    result: AttendanceResult;
    status: AttendanceStatus;
}

export default function AttendanceHistoryItem({ date, time, result, status }: AttendanceHistoryItemProps) {
    const color = getAttendanceColor(result, status);
    const icon = getAttendanceIcon(result, status);
    const statusText = getAttendanceStatusText(result, status);

    return (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <View style={styles.content}>
                <Text style={styles.statusText}>{statusText}</Text>
                <Text style={styles.dateText}>{date}</Text>
            </View>
            <Text style={styles.timeText}>{time}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    icon: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 2,
    },
    dateText: {
        fontSize: 14,
        color: '#6b7280',
    },
    timeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4b5563',
    },
});
