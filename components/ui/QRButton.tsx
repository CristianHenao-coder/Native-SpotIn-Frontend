import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QRButtonProps {
    onPress: () => void;
}

export default function QRButton({ onPress }: QRButtonProps) {
    return (
        <TouchableOpacity 
            style={styles.container} 
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Ionicons name="qr-code" size={60} color="white" style={{ marginBottom: 12 }} />
            <Text style={styles.text}>Escanear QR</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#2563eb',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
        alignSelf: 'center',
        marginVertical: 24,
    },
    qrIcon: {
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    qrGrid: {
        width: 60,
        height: 60,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    qrSquare: {
        width: 24,
        height: 24,
        backgroundColor: 'white',
        borderRadius: 4,
        margin: 3,
    },
    topLeft: {},
    topRight: {},
    bottomLeft: {},
    bottomRight: {},
    text: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
