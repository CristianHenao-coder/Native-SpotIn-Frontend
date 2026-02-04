import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { attendanceService } from "../../services/attendance";
import type { Attendance } from "../../types/api";
import CalendarDay from "../../components/ui/CalendarDay";
import { 
  generateCalendarDays, 
  getMonthName, 
  getDayNames, 
  formatDateKey, 
  isToday 
} from "../../utils/calendar";
import { groupAttendancesByDate } from "../../utils/attendance";
import { Ionicons } from "@expo/vector-icons";

export default function CalendarioScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [history, setHistory] = useState<Record<string, Attendance>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const fetchHistory = async () => {
      setErrorMsg(null);
      try {
        setIsLoading(true);
        const { items } = await attendanceService.getMyAttendance();
        setHistory(groupAttendancesByDate(items));
      } catch (error: any) {
        if (error.response?.status === 403) {
            setErrorMsg("Acceso restringido a calendario");
        } else if (error.response?.status !== 401) {
          console.error("Error fetching attendance history:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const changeMonth = (offset: number) => {
    const newDate = new Date(year, month + offset, 1);
    setCurrentDate(newDate);
  };

  const days = generateCalendarDays(year, month);
  const dayNames = getDayNames();

  // Statistics for current month
  const monthItems = Object.values(history).filter(item => {
    const itemDate = new Date(item.markedAt);
    return itemDate.getFullYear() === year && itemDate.getMonth() === month;
  });

  const presentCount = monthItems.filter(i => i.result === 'ON_TIME' && i.status !== 'REJECTED').length;
  const lateCount = monthItems.filter(i => i.result === 'LATE' && i.status !== 'REJECTED').length;
  const absentCount = monthItems.filter(i => i.status === 'REJECTED').length;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Calendario</Text>

      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={() => changeMonth(-1)}>
          <Ionicons name="chevron-back" size={24} color="#475569" />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {getMonthName(month)} De {year}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)}>
          <Ionicons name="chevron-forward" size={24} color="#475569" />
        </TouchableOpacity>
      </View>

      {errorMsg && (
        <View style={styles.errorBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="alert-circle" size={18} color="#b91c1c" style={{ marginRight: 6 }} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        </View>
      )}

      {/* Calendar Grid */}
      <View style={styles.calendarCard}>
        <View style={styles.dayNamesRow}>
          {dayNames.map(name => (
            <Text key={name} style={styles.dayNameText}>{name}</Text>
          ))}
        </View>
        <View style={styles.grid}>
          {days.map((dayObj, index) => {
            const dateKey = formatDateKey(year, month, dayObj.day);
            const attendance = history[dateKey];
            let status: 'present' | 'late' | 'absent' | null = null;

            if (attendance && dayObj.isCurrentMonth) {
              if (attendance.status === 'REJECTED') status = 'absent';
              else if (attendance.result === 'ON_TIME') status = 'present';
              else if (attendance.result === 'LATE') status = 'late';
            }

            return (
              <CalendarDay
                key={`${dateKey}-${index}`}
                day={dayObj.day}
                isCurrentMonth={dayObj.isCurrentMonth}
                isToday={dayObj.isCurrentMonth && isToday(year, month, dayObj.day)}
                status={status}
              />
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.legendText}>Presente</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.legendText}>Tardanza</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>Ausente</Text>
          </View>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: '#e6fffa' }]}>
          <View style={styles.summaryIconContainer}>
            <Ionicons name="checkmark" size={16} color="#10b981" />
          </View>
          <Text style={styles.summaryValue}>{presentCount}</Text>
          <Text style={styles.summaryLabel}>Presentes</Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: '#fffaf0' }]}>
          <View style={styles.summaryIconContainer}>
            <Ionicons name="time" size={16} color="#f59e0b" />
          </View>
          <Text style={styles.summaryValue}>{lateCount}</Text>
          <Text style={styles.summaryLabel}>Tardanzas</Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: '#fff5f5' }]}>
          <View style={styles.summaryIconContainer}>
            <Ionicons name="close" size={16} color="#ef4444" />
          </View>
          <Text style={styles.summaryValue}>{absentCount}</Text>
          <Text style={styles.summaryLabel}>Ausencias</Text>
        </View>
      </View>

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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 60,
    marginBottom: 20,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  navArrow: {
    fontSize: 20,
    color: '#475569',
    paddingHorizontal: 10,
  },
  calendarCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  dayNamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  dayNameText: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#64748b',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  errorBox: {
      backgroundColor: '#fee2e2',
      padding: 12,
      borderRadius: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#fecaca',
      alignItems: 'center',
  },
  errorText: {
      color: '#b91c1c',
      fontWeight: 'bold',
      fontSize: 14,
  }
});
