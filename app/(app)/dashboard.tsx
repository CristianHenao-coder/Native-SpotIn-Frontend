import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  StyleSheet,
  Button,
} from "react-native";
import { useSession } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import * as LocalAuthentication from "expo-local-authentication";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import {
  getDistanceFromLatLonInM,
  TARGET_LOCATION,
} from "../../constants/location";
import { Image } from "expo-image";

export default function Dashboard() {
  const { signOut, user } = useSession();
  const router = useRouter();

  // State for Attendance Logic
  const [isValidLocation, setIsValidLocation] = useState(false);
  const [isQrScanned, setIsQrScanned] = useState(false);
  const [scannedData, setScannedData] = useState("");
  const [currentDistance, setCurrentDistance] = useState<number | null>(null);

  // Camera State
  const [permission, requestPermission] = useCameraPermissions();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleLogout = () => {
    signOut();
    setTimeout(() => router.replace("/(auth)/login"), 0);
  };

  const handleCheckLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Allow location access to mark attendance.",
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const distance = getDistanceFromLatLonInM(
        location.coords.latitude,
        location.coords.longitude,
        TARGET_LOCATION.latitude,
        TARGET_LOCATION.longitude,
      );

      setCurrentDistance(Math.round(distance));

      if (distance <= TARGET_LOCATION.radiusMeters) {
        setIsValidLocation(true);
        Alert.alert(
          "Success",
          `You are at the institution (${Math.round(distance)}m).`,
        );
      } else {
        setIsValidLocation(false);
        Alert.alert(
          "Too Far",
          `You are ${Math.round(distance)}m away. Move closer!`,
        );
      }
    } catch (error) {
      Alert.alert("Error", "Could not fetch location");
    }
  };

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setIsScannerOpen(false);
    setScannedData(data);
    setIsQrScanned(true);
    Alert.alert("QR Scanned", `Code: ${data}`);
  };

  const handleMarkAttendance = async () => {
    // Final security check (Optional: Biometric confirmation before marking)
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (compatible) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirm Attendance",
      });
      if (!result.success) {
        Alert.alert("Cancelled", "Authentication failed");
        return;
      }
    }

    Alert.alert(
      "Attendance Marked!",
      `User: ${user?.name}\nLocation: Verified\nQR: Verified`,
    );
    // Here you would call your API to save the attendance record
  };

  if (!permission) return <View />;

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: 20,
        backgroundColor: "#f3f4f6",
      }}
    >
      <View style={{ marginBottom: 30, alignItems: "center" }}>
        <Image
          source={require("../../assets/images/favicon.png")}
          style={{ width: 50, height: 50, marginBottom: 10 }}
        />
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#1f2937" }}>
          Dashboard
        </Text>
        <Text style={{ marginTop: 8, fontSize: 16, color: "#4b5563" }}>
          Welcome, {user?.name || "User"}!
        </Text>
      </View>

      <View style={{ gap: 16 }}>
        {/* Step 1: Scan QR */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Step 1: Scan QR Code</Text>
          <TouchableOpacity
            style={[
              styles.button,
              isQrScanned ? styles.buttonSuccess : styles.buttonPrimary,
            ]}
            onPress={() => {
              if (!permission.granted) requestPermission();
              setIsScannerOpen(true);
            }}
          >
            <Text style={styles.buttonText}>
              {isQrScanned ? "✅ QR Scanned" : "📸 Scan QR"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Step 2: Verify Location */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Step 2: Verify Location</Text>
          <TouchableOpacity
            style={[
              styles.button,
              isValidLocation ? styles.buttonSuccess : styles.buttonPrimary,
            ]}
            onPress={handleCheckLocation}
          >
            <Text style={styles.buttonText}>
              {isValidLocation ? "✅ Location Verified" : "📍 Check Location"}
            </Text>
          </TouchableOpacity>
          {currentDistance !== null && (
            <Text
              style={{ textAlign: "center", marginTop: 8, color: "#6b7280" }}
            >
              Distance: {currentDistance}m (Max: {TARGET_LOCATION.radiusMeters}
              m)
            </Text>
          )}
        </View>

        {/* Step 3: Mark Attendance */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Step 3: Mark Attendance</Text>
          <TouchableOpacity
            disabled={!isQrScanned || !isValidLocation}
            style={[
              styles.button,
              isQrScanned && isValidLocation
                ? styles.buttonAction
                : styles.buttonDisabled,
            ]}
            onPress={handleMarkAttendance}
          >
            <Text style={styles.buttonText}>📝 Mark Attendance</Text>
          </TouchableOpacity>
          {(!isQrScanned || !isValidLocation) && (
            <Text
              style={{
                textAlign: "center",
                marginTop: 8,
                color: "#ef4444",
                fontSize: 12,
              }}
            >
              Complete Step 1 & 2 first
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.button, { backgroundColor: "#ef4444", marginTop: 20 }]}
        >
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* QR Scanner Modal */}
      <Modal visible={isScannerOpen} animationType="slide">
        <View style={{ flex: 1 }}>
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
          >
            <View style={{ flex: 1, justifyContent: "flex-end", padding: 50 }}>
              <Button
                title="Close Scanner"
                onPress={() => setIsScannerOpen(false)}
                color="red"
              />
            </View>
          </CameraView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonPrimary: { backgroundColor: "#4f46e5" },
  buttonSuccess: { backgroundColor: "#10b981" }, // Green
  buttonAction: { backgroundColor: "#2563eb" }, // Blue
  buttonDisabled: { backgroundColor: "#9ca3af" }, // Gray
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
