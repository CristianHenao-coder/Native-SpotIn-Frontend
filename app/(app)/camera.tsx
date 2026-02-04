import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as LocalAuthentication from 'expo-local-authentication';
import { attendanceService } from '../../services/attendance';
import { TARGET_LOCATION, getDistanceFromLatLonInM } from '../../constants/location';

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Necesitamos tu permiso para mostrar la cámara</Text>
        <Button onPress={requestPermission} title="Conceder permiso" />
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // 1. Get Location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Permiso de ubicación denegado');
        setIsProcessing(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      
      // 2. Validate Distance (Front-end check for UX)
      const distance = getDistanceFromLatLonInM(
        location.coords.latitude,
        location.coords.longitude,
        TARGET_LOCATION.latitude,
        TARGET_LOCATION.longitude
      );

      if (distance > TARGET_LOCATION.radiusMeters) {
        Alert.alert(
          'Fuera de Rango',
          `Debes estar en Riwi para marcar asistencia. Estás a ${Math.round(distance)}m de distancia.`
        );
        setIsProcessing(false);
        return;
      }

      // 3. Optional: Biometric Confirmation
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (compatible) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Confirma tu identidad para marcar asistencia',
        });
        if (!result.success) {
          setIsProcessing(false);
          return;
        }
      }

      // 4. Mark Attendance with Backend
      const response = await attendanceService.markAttendance(
        data, 
        location.coords.latitude, 
        location.coords.longitude
      );

      Alert.alert(
        '¡Asistencia Marcada!',
        `Estado: ${response.attendance.result === 'ON_TIME' ? 'Presente' : 'Tardanza'}`,
        [
          { 
            text: 'OK', 
            onPress: () => router.replace('/(app)/dashboard') 
          }
        ]
      );
    } catch (error: any) {
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        console.error('Error marking attendance:', error);
      }
      Alert.alert(
        'Error', 
        error.response?.data?.message || 'No se pudo registrar la asistencia. Verifica que el QR sea válido y estés en el rango permitido.'
      );
      setIsProcessing(false);
    }
  };

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={facing}
        onBarcodeScanned={isProcessing ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
            {isProcessing && (
                <View style={styles.processingContainer}>
                    <ActivityIndicator size="large" color="white" />
                    <Text style={styles.processingText}>Procesando...</Text>
                </View>
            )}
            
            <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                <Ionicons name="camera-reverse" size={20} color="white" style={{ marginBottom: 4 }} />
                <Text style={styles.text}>Voltear</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.button, { backgroundColor: '#ef4444' }]} 
                onPress={() => router.back()}
            >
                <Ionicons name="close" size={20} color="white" style={{ marginBottom: 4 }} />
                <Text style={styles.text}>Cerrar</Text>
            </TouchableOpacity>
            </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'space-between',
  },
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  processingText: {
    color: 'white',
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
