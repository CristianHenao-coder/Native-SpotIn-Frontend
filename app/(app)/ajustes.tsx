import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { useState, useEffect } from "react";
import { useSession } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";

interface SettingsItemProps {
    icon: string;
    title: string;
    subtitle?: string;
    showChevron?: boolean;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (val: boolean) => void;
    onPress?: () => void;
    isDestructive?: boolean;
}

function SettingsItem({ 
    icon, 
    title, 
    subtitle, 
    showChevron = true, 
    showSwitch = false,
    switchValue = false,
    onSwitchChange,
    onPress,
    isDestructive = false
}: SettingsItemProps) {
    return (
        <TouchableOpacity 
            style={styles.settingsItem} 
            onPress={onPress}
            disabled={showSwitch}
        >
            <View style={[styles.itemIconContainer, { backgroundColor: isDestructive ? '#fff5f5' : '#f8fafc' }]}>
                <Ionicons name={icon as any} size={20} color={isDestructive ? '#ef4444' : '#64748b'} />
            </View>
            <View style={styles.itemContent}>
                <Text style={[styles.itemTitle, isDestructive && { color: '#ef4444' }]}>{title}</Text>
                {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
            </View>
            {showSwitch ? (
                <Switch 
                    value={switchValue} 
                    onValueChange={onSwitchChange}
                    trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
                />
            ) : showChevron && (
                <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
            )}
        </TouchableOpacity>
    );
}

export default function AjustesScreen() {
  const { user, signOut } = useSession();
  const router = useRouter();

  // Settings State
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Modal States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    const loadPrefs = async () => {
        try {
            const loc = await SecureStore.getItemAsync('pref_location');
            const bio = await SecureStore.getItemAsync('pref_biometrics');
            const note = await SecureStore.getItemAsync('pref_notifications');

            if (loc !== null) setLocationEnabled(loc === 'true');
            if (bio !== null) setBiometricsEnabled(bio === 'true');
            if (note !== null) setNotificationsEnabled(note === 'true');
        } catch (e) {
            console.error("Error loading preferences", e);
        }
    };
    loadPrefs();
  }, []);

  // Save preference helper
  const savePref = async (key: string, val: boolean) => {
    try {
        await SecureStore.setItemAsync(key, val.toString());
    } catch (e) {
        console.error(`Error saving ${key}`, e);
    }
  };


  const toggleLocation = (val: boolean) => {
    setLocationEnabled(val);
    savePref('pref_location', val);
  };

  const toggleBiometrics = (val: boolean) => {
    setBiometricsEnabled(val);
    savePref('pref_biometrics', val);
  };

  const toggleNotifications = (val: boolean) => {
      setNotificationsEnabled(val);
      savePref('pref_notifications', val);
  };

  const handleLogout = () => {
    Alert.alert(
        "Cerrar Sesión",
        "¿Estás seguro de que quieres salir?",
        [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Sí, salir", 
                style: "destructive",
                onPress: () => {
                    signOut();
                    router.replace("/(auth)/login");
                }
            }
        ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ajustes</Text>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>
        <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || "Usuario"}</Text>
            <Text style={styles.profileEmail}>{user?.email || "usuario@correo.com"}</Text>
            <Text style={styles.profileRole}>
                {user?.program || "Estudiante"} {user?.group ? `• ${user?.group}` : ''}
            </Text>
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuenta</Text>
        <View style={styles.sectionContent}>
            <SettingsItem 
                icon="person" 
                title="Perfil" 
                subtitle="Ver información personal" 
                onPress={() => setShowProfileModal(true)}
            />
            <SettingsItem 
                icon="notifications" 
                title="Notificaciones" 
                subtitle="Configurar alertas" 
                showChevron={false}
                showSwitch={true}
                switchValue={notificationsEnabled}
                onSwitchChange={toggleNotifications}
            />
        </View>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferencias</Text>
        <View style={styles.sectionContent}>
            <SettingsItem 
                icon="location" 
                title="Ubicación" 
                subtitle="Permitir acceso GPS" 
                showChevron={false}
                showSwitch={true}
                switchValue={locationEnabled}
                onSwitchChange={toggleLocation}
            />
            <SettingsItem 
                icon="finger-print" 
                title="Biométricos" 
                subtitle="Huella o Face ID" 
                showChevron={false}
                showSwitch={true}
                switchValue={biometricsEnabled}
                onSwitchChange={toggleBiometrics}
            />
        </View>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Soporte</Text>
        <View style={styles.sectionContent}>
            <SettingsItem 
                icon="shield-checkmark" 
                title="Privacidad" 
                subtitle="Política de datos" 
                onPress={() => setShowPrivacyModal(true)}
            />
            <SettingsItem 
                icon="help-circle" 
                title="Ayuda" 
                subtitle="Centro de soporte" 
                onPress={() => setShowHelpModal(true)}
            />
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', marginTop: 0 }]} 
        onPress={async () => {
            Alert.alert(
                "Reiniciar App",
                "Se borrarán todos los datos locales y tendrás que iniciar sesión de nuevo.",
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Borrar Todo", style: "destructive", onPress: async () => {
                        await SecureStore.deleteItemAsync('auth_token');
                        await SecureStore.deleteItemAsync('user_session');
                        await SecureStore.deleteItemAsync('pref_dark_mode');
                        await SecureStore.deleteItemAsync('pref_location');
                        await SecureStore.deleteItemAsync('pref_biometrics');
                        await SecureStore.deleteItemAsync('pref_notifications');
                        signOut();
                        router.replace("/(auth)/login");
                    }}
                ]
            );
        }}
      >
        <Ionicons name="flash" size={20} color="#64748b" style={{ marginRight: 8 }} />
        <Text style={[styles.logoutText, { color: '#64748b' }]}>Forzar reinicio de sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color="#ef4444" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Versión 1.0.0 (Expo Core)</Text>

      {/* Profile Modal */}
      <Modal visible={showProfileModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Información del Perfil</Text>
                  <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Nombre:</Text>
                      <Text style={styles.infoValue}>{user?.name}</Text>
                  </View>
                  <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Correo:</Text>
                      <Text style={styles.infoValue}>{user?.email}</Text>
                  </View>
                  <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Programa:</Text>
                      <Text style={styles.infoValue}>{user?.program || "No asignado"}</Text>
                  </View>
                  <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Grupo:</Text>
                      <Text style={styles.infoValue}>{user?.group || "No asignado"}</Text>
                  </View>
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setShowProfileModal(false)}>
                      <Text style={styles.closeBtnText}>Cerrar</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>

      {/* Help Modal */}
      <Modal visible={showHelpModal} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Centro de Ayuda</Text>
                  <Text style={styles.helpText}>
                      Si tienes problemas para marcar asistencia, asegúrate de:{"\n\n"}
                      1. Tener el GPS activo.{"\n"}
                      2. Estar dentro del campus.{"\n"}
                      3. Que tu token QR sea válido.{"\n\n"}
                      Contacto Soporte: soporte@riwi.edu.co
                  </Text>
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setShowHelpModal(false)}>
                      <Text style={styles.closeBtnText}>Entendido</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>

      {/* Privacy Modal */}
      <Modal visible={showPrivacyModal} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Política de Privacidad</Text>
                  <ScrollView style={{maxHeight: 300}}>
                      <Text style={styles.helpText}>
                          En SpotIn protegemos tus datos. Recopilamos información de ubicación solo en el momento de marcar asistencia para validar tu presencia en el campus.{"\n\n"}
                          Tus datos no son compartidos con terceros y se utilizan exclusivamente para fines académicos de asistencia.
                      </Text>
                  </ScrollView>
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setShowPrivacyModal(false)}>
                      <Text style={styles.closeBtnText}>Cerrar</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>

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
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  chevron: {
    fontSize: 18,
    color: '#cbd5e1',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff5f5',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 20,
  },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
  },
  modalContent: {
      backgroundColor: 'white',
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: 30,
      minHeight: 300,
  },
  modalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: 24,
      textAlign: 'center',
  },
  infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
      fontSize: 15,
      color: '#64748b',
      fontWeight: '500',
  },
  infoValue: {
      fontSize: 15,
      color: '#1e293b',
      fontWeight: '600',
  },
  closeBtn: {
      backgroundColor: '#2563eb',
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
      marginTop: 20,
  },
  closeBtnText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
  },
  helpText: {
      fontSize: 15,
      color: '#475569',
      lineHeight: 24,
      textAlign: 'center',
  },
});
