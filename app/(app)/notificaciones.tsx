import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useNotifications, Notification } from "../../context/NotificationContext";

export default function NotificacionesScreen() {
  const router = useRouter();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'attendance': return 'checkmark-circle';
      case 'alert': return 'alert-circle';
      case 'info': return 'information-circle';
      default: return 'notifications';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'attendance': return '#10b981';
      case 'alert': return '#f59e0b';
      case 'info': return '#2563eb';
      default: return '#64748b';
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
      activeOpacity={0.7}
      onPress={() => markAsRead(item.id)}
    >
      <View style={[styles.iconContainer, { backgroundColor: getIconColor(item.type) + '15' }]}>
        <Ionicons name={getIcon(item.type) as any} size={24} color={getIconColor(item.type)} />
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, !item.isRead && styles.boldText]}>
            {item.title}
          </Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {item.message}
        </Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <TouchableOpacity onPress={markAllAsRead} style={styles.markReadButton}>
          <Text style={styles.markReadText}>Leído</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No tienes notificaciones</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  markReadButton: {
    padding: 4,
  },
  markReadText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
  },
  listContent: {
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  unreadItem: {
    backgroundColor: "#f8fafc",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    color: "#1e293b",
    flex: 1,
    marginRight: 8,
  },
  boldText: {
    fontWeight: "700",
  },
  timestamp: {
    fontSize: 12,
    color: "#94a3b8",
  },
  message: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563eb",
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#94a3b8",
    marginTop: 12,
  },
});
