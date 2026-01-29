import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';

export default function Register() {
  const router = useRouter();

  const handleRegister = () => {
    // Implement register logic here
    console.log("Registering");
    router.replace('/login');
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6', padding: 20 }}>
      {/* Header */}
      <View style={{ marginBottom: 40, alignItems: 'center' }}>
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#1f2937' }}>Create Account</Text>
        <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 8 }}>Join SpotIn today!</Text>
      </View>

      {/* Form */}
      <View style={{ width: '100%', maxWidth: 400 }}>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: '600', color: '#374151' }}>Full Name</Text>
          <TextInput
            placeholder="John Doe"
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
          onPress={handleRegister}
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
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Sign Up</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={{ color: '#6b7280' }}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={{ color: '#4f46e5', fontWeight: 'bold' }}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
