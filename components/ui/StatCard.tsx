import { View, Text, StyleSheet } from 'react-native';

interface StatCardProps {
    title: string;
    subtitle: string;
    percentage: number;
    trend?: number; // positive or negative percentage
    color: string;
}

export default function StatCard({ title, subtitle, percentage, trend, color }: StatCardProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                    <Text style={[styles.icon, { color }]}>📊</Text>
                </View>
                {trend !== undefined && (
                    <View style={[styles.trendBadge, { backgroundColor: trend >= 0 ? '#10b98120' : '#ef444420' }]}>
                        <Text style={[styles.trendText, { color: trend >= 0 ? '#10b981' : '#ef4444' }]}>
                            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                        </Text>
                    </View>
                )}
            </View>
            
            <View style={styles.progressContainer}>
                <View style={styles.progressCircle}>
                    <Text style={[styles.percentageText, { color }]}>{percentage}%</Text>
                </View>
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        flex: 1,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 18,
    },
    trendBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    trendText: {
        fontSize: 12,
        fontWeight: '600',
    },
    progressContainer: {
        alignItems: 'center',
        marginVertical: 12,
    },
    progressCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 8,
        borderColor: '#e5e7eb',
        alignItems: 'center',
        justifyContent: 'center',
    },
    percentageText: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
    },
});
