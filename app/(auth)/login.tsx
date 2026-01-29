import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useSession } from '../../context/AuthContext';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

export default function Login() {
  const router = useRouter();
  const { signIn } = useSession();
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricSupported(compatible && enrolled);

      // Check if we have a stored session to offer auto-login
      const storedSession = await SecureStore.getItemAsync('user_session');
      if (storedSession && compatible && enrolled) {
         promptBiometrics();
      }
    })();
  }, []);

  const promptBiometrics = async () => {
      const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Welcome back! Login with Biometrics',
      });
      if (result.success) {
          // In a real app, you might validate the stored token here
          signIn(); 
          router.replace('/dashboard');
      }
  };

  const handleLogin = () => {
    signIn(); // This now stores the session in SecureStore
    router.replace('/dashboard');
  };

  const handleBiometricLogin = async () => await promptBiometrics();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6', padding: 20 }}>
      {/* Header */}
      <View style={{ marginBottom: 40, alignItems: 'center' }}>
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#1f2937' }}>SpotIn</Text>
        <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 8 }}>Welcome back! Please login.</Text>
      </View>

      {/* Form */}
      <View style={{ width: '100%', maxWidth: 400 }}>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: '600', color: '#374151' }}>Email</Text>
          <TextInput
            placeholder="email@example.com"
            style={{
              width: '100%',
              backgroundColor: 'white',
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: '600', color: '#374151' }}>Password</Text>
          <TextInput
            placeholder="********"
            secureTextEntry
             style={{
              width: '100%',
              backgroundColor: 'white',
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          />
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          style={{
            backgroundColor: '#4f46e5',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 16,
            shadowColor: '#4f46e5',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Sign In</Text>
        </TouchableOpacity>

        {isBiometricSupported && (
            <TouchableOpacity
            onPress={handleBiometricLogin}
            style={{
                backgroundColor: '#ffffff',
                padding: 16,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#e5e7eb'
            }}>
            <Text style={{ color: '#4f46e5', fontWeight: 'bold', fontSize: 16 }}>Login with Biometrics</Text>
            </TouchableOpacity>
        )}

        {/* Register Link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={{ color: '#6b7280' }}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={{ color: '#4f46e5', fontWeight: 'bold' }}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}
