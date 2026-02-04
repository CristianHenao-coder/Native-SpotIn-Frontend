import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSession } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { useState, useEffect, useCallback } from "react";
import {
  getDistanceFromLatLonInM,
  TARGET_LOCATION,
} from "../../constants/location";
import { Image } from "expo-image";
import { attendanceService } from "../../services/attendance";
import type { Attendance } from "../../types/api";
import AttendanceHistoryItem from "../../components/ui/AttendanceHistoryItem";
import QRButton from "../../components/ui/QRButton";
import { formatAttendanceDate, formatAttendanceTime } from "../../utils/attendance";
import { Ionicons } from "@expo/vector-icons";
import { useNotifications } from "../../context/NotificationContext";

export default function Dashboard() {
  const { user, signOut } = useSession();
  const { unreadCount } = useNotifications();
  const router = useRouter();

  // State
  const [history, setHistory] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMarkedToday, setHasMarkedToday] = useState(false);
  const [locationName, setLocationName] = useState("Verificando ubicación...");
  const [isLocationVerified, setIsLocationVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setErrorMsg(null);
    try {
      const { items } = await attendanceService.getMyAttendance();
      setHistory(items);
      
      // Check if marked today
      const today = new Date().toISOString().split('T')[0];
      const markedToday = items.some(item => item.dateKey === today);
      setHasMarkedToday(markedToday);
    } catch (error: any) {
      if (error.response?.status === 403) {
        setErrorMsg("Acceso restringido a historial");
      } else if (error.response?.status !== 401) {
        console.error("Error fetching attendance history:", error);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const checkLocation = async () => {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        setLocationName("GPS desactivado");
        setIsLocationVerified(false);
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationName("Sin permiso GPS");
        setIsLocationVerified(false);
        return;
      }

      // Try last known first as it's instant
      const lastLocation = await Location.getLastKnownPositionAsync();
      if (lastLocation) {
        const distance = getDistanceFromLatLonInM(
          lastLocation.coords.latitude,
          lastLocation.coords.longitude,
          TARGET_LOCATION.latitude,
          TARGET_LOCATION.longitude,
        );
        if (distance <= TARGET_LOCATION.radiusMeters) {
          setIsLocationVerified(true);
          setLocationName("Campus Central - Edificio A");
          return; // Done if last known is good
        }
      }

      // Try current position with a timeout
      let location = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
      ]) as Location.LocationObject | null;

      if (!location) throw new Error("Could not get location");

      const distance = getDistanceFromLatLonInM(
        location.coords.latitude,
        location.coords.longitude,
        TARGET_LOCATION.latitude,
        TARGET_LOCATION.longitude,
      );

      if (distance <= TARGET_LOCATION.radiusMeters) {
        setIsLocationVerified(true);
        setLocationName("Campus Central - Edificio A");
      } else {
        setIsLocationVerified(false);
        setLocationName(`A ${Math.round(distance)}m del campus`);
      }
    } catch (error) {
      // Silently handle location errors as we show a UI status
      setLocationName("Ubicación no disponible");
      setIsLocationVerified(false);
    }
  };

  useEffect(() => {
    if (user) {
        fetchDashboardData();
        checkLocation();
    }
  }, [user]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
    checkLocation();
  };

  const handleOpenScanner = () => {
    router.push("/(app)/camera");
  };

  if (user?.role === 'ADMIN') {
    return (
        <View style={styles.loadingContainer}>
            <Ionicons name="shield-checkmark" size={60} color="#2563eb" style={{ marginBottom: 20 }} />
            <Text style={styles.userName}>Modo Administrador</Text>
            <Text style={[styles.userRole, { textAlign: 'center', marginTop: 10, paddingHorizontal: 40 }]}>
                Has iniciado sesión como Admin. Las funciones de asistencia móvil están reservadas para Estudiantes.
            </Text>
            <TouchableOpacity 
                style={[styles.logoutButton, { marginTop: 40, width: '80%' }]} 
                onPress={() => signOut()}
            >
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </View>
    );
  }

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const currentDate = new Intl.DateTimeFormat('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(new Date());

  return (
    <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
    >
      {/* Header Profile Section */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || "Usuario"}</Text>
            <Text style={styles.userRole}>
                {user?.program || "Estudiante"} {user?.group ? `• ${user?.group}` : ''}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => router.push("/(app)/notificaciones")}
          >
            <View style={styles.bellIcon}>
                <Ionicons name="notifications" size={24} color="#64748b" />
                {unreadCount > 0 && <View style={styles.notificationBadge} />}
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.dateLabel}>{currentDate}</Text>
      </View>

      {/* Attendance Status Card */}
      <View style={[styles.statusCard, { backgroundColor: hasMarkedToday ? '#e8f5e9' : '#fff9f0' }]}>
        <View style={[styles.statusIconContainer, { backgroundColor: hasMarkedToday ? '#10b98120' : '#f59e0b20' }]}>
          <Ionicons 
            name={hasMarkedToday ? 'checkmark-circle' : 'time'} 
            size={32} 
            color={hasMarkedToday ? '#10b981' : '#f59e0b'} 
          />
        </View>
        <View style={styles.statusContent}>
          <Text style={styles.statusTitle}>{hasMarkedToday ? 'Asistencia Marcada' : 'Pendiente'}</Text>
          <Text style={styles.statusSubtitle}>
            {hasMarkedToday 
              ? 'Has registrado tu asistencia correctamente' 
              : 'Aún no has marcado asistencia'}
          </Text>
        </View>
      </View>

      {/* Location Card */}
      <View style={styles.locationCard}>
        <View style={styles.locationHeader}>
          <View style={styles.locationIcon}>
            <Ionicons name="location" size={18} color="#10b981" />
          </View>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.locationTitle}>Ubicación</Text>
            {isLocationVerified && <Text style={styles.verifiedCheck}>✓</Text>}
          </View>
        </View>
        <Text style={styles.locationText}>{locationName}</Text>
      </View>

      {/* Main Action: QR Button */}
      {!hasMarkedToday && (
        <QRButton onPress={handleOpenScanner} />
      )}

      {/* History Section */}
      <View style={styles.historyContainer}>
        <Text style={styles.sectionTitle}>Historial reciente</Text>
        {errorMsg ? (
          <View style={styles.emptyHistory}>
            <Text style={{ ...styles.emptyHistoryText, color: '#ef4444' }}>{errorMsg}</Text>
          </View>
        ) : history.length > 0 ? (
          history.slice(0, 5).map((item) => (
            <AttendanceHistoryItem
              key={item._id}
              date={formatAttendanceDate(item.markedAt)}
              time={formatAttendanceTime(item.markedAt)}
              result={item.result}
              status={item.status}
            />
          ))
        ) : (
          <View style={styles.emptyHistory}>
            <Text style={styles.emptyHistoryText}>No hay registros recientes</Text>
          </View>
        )}
      </View>
      
      {/* Space at bottom for tab bar padding */}
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
    marginBottom: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  userRole: {
    fontSize: 14,
    color: '#64748b',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  bellIcon: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: 'white',
  },
  dateLabel: {
    fontSize: 14,
    color: '#94a3b8',
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
  },
  statusSubtitle: {
    fontSize: 13,
    color: '#b45309',
  },
  locationCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10b98110',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginRight: 4,
  },
  verifiedCheck: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: 'bold',
  },
  locationText: {
    marginLeft: 36,
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  historyContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyHistoryText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff5f5',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
});
