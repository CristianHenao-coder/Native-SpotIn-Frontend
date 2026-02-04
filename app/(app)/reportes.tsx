import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { attendanceService } from "../../services/attendance";
import type { Attendance } from "../../types/api";
import StatCard from "../../components/ui/StatCard";
import { 
  calculateMonthlyStats, 
  getWeeklyStats, 
  getRealAchievements,
  type Achievement 
} from "../../utils/attendance";
import { Ionicons } from "@expo/vector-icons";

export default function ReportesScreen() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setErrorMsg(null);
      try {
        setIsLoading(true);
        const { items } = await attendanceService.getMyAttendance();
        setAttendances(items);
      } catch (error: any) {
        if (error.response?.status === 403) {
            setErrorMsg("Sin acceso a estadísticas");
        } else if (error.response?.status !== 401) {
          console.error("Error fetching attendance for reports:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const stats = calculateMonthlyStats(attendances);
  const weeklyStats = getWeeklyStats(attendances);
  const realAchievements = getRealAchievements(attendances);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const currentMonth = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reportes</Text>
        <Text style={styles.monthLabel}>{currentMonth}</Text>
      </View>

      {/* Main Stats */}
      <View style={styles.statsRow}>
        <StatCard
          title="Asistencia"
          subtitle="del período"
          percentage={errorMsg ? 0 : stats.attendancePercentage}
          trend={errorMsg ? 0 : 5} 
          color={errorMsg ? "#94a3b8" : "#2563eb"}
        />
        <StatCard
          title="Puntualidad"
          subtitle="a tiempo"
          percentage={errorMsg ? 0 : stats.punctualityPercentage}
          trend={errorMsg ? 0 : 2} 
          color={errorMsg ? "#94a3b8" : "#10b981"}
        />
      </View>

      {errorMsg && (
        <View style={styles.errorBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="alert-circle" size={20} color="#b91c1c" style={{ marginRight: 6 }} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
          <Text style={styles.errorSubtext}>No tienes permisos para ver el historial de asistencia detallado.</Text>
        </View>
      )}

      {/* Weekly Chart */}
      {!errorMsg && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Asistencia semanal</Text>
          <View style={styles.chartPlaceholder}>
              <View style={styles.chartContent}>
                  {weeklyStats.map((day, i) => (
                      <View key={i} style={styles.chartBarColumn}>
                          <View style={[styles.chartBar, { height: day.value * 0.8, backgroundColor: day.value > 50 ? '#2563eb' : '#e2e8f0' }]} />
                          <Text style={styles.chartDayText}>{day.label}</Text>
                      </View>
                  ))}
              </View>
          </View>
        </View>
      )}

      {/* Achievements Section */}
      {realAchievements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logros</Text>
          {realAchievements.map((achievement) => (
            <View key={achievement.id} style={styles.achievementCard}>
                <View style={[styles.achievementIcon, { backgroundColor: achievement.color }]}>
                    <Ionicons name={achievement.icon as any} size={24} color="#f97316" />
                </View>
                <View style={styles.achievementContent}>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementSubtitle}>{achievement.subtitle}</Text>
                </View>
                {achievement.badge && <Text style={styles.achievementBadge}>{achievement.badge}</Text>}
            </View>
          ))}
        </View>
      )}

      {/* Summary Box */}
      {(attendances.length > 0 || errorMsg) && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>
              <Text style={{fontWeight: 'bold'}}>Resumen:</Text> {
                errorMsg 
                  ? "No se pueden calcular tendencias sin acceso a datos." 
                  : stats.attendancePercentage > 80 
                    ? `¡Excelente! Tu asistencia del ${stats.attendancePercentage}% es ejemplar.`
                    : "Sigue esforzándote para mejorar tu récord de asistencia este mes."
              }
          </Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  monthLabel: {
    fontSize: 14,
    color: '#64748b',
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  chartPlaceholder: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    minHeight: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  chartBarColumn: {
    alignItems: 'center',
  },
  chartBar: {
    width: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    marginBottom: 8,
  },
  chartDayText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  achievementSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  achievementBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
    backgroundColor: '#10b98110',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  summaryBox: {
    backgroundColor: '#eff6ff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  summaryText: {
    fontSize: 14,
    color: '#1e3a8a',
    lineHeight: 20,
    textAlign: 'center',
  },
  errorBox: {
      backgroundColor: '#fee2e2',
      padding: 16,
      borderRadius: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: '#fecaca',
  },
  errorText: {
      color: '#b91c1c',
      fontWeight: 'bold',
      fontSize: 15,
      marginBottom: 4,
  },
  errorSubtext: {
      color: '#7f1d1d',
      fontSize: 13,
  }
});
