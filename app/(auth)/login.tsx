import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { useRouter, Link } from "expo-router";
import { useSession } from "../../context/AuthContext";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";

export default function Login() {
  const router = useRouter();
  const { signIn, isLoading } = useSession();
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricSupported(compatible && enrolled);

      // Check if we have a stored session to offer auto-login
      const storedSession = await SecureStore.getItemAsync("user_session");
      if (storedSession && compatible && enrolled) {
        promptBiometrics();
      }
    })();
  }, []);

  const promptBiometrics = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Welcome back! Login with Biometrics",
    });
    if (result.success) {
      // User is already logged in via stored session
      router.replace("/dashboard");
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      await signIn(email, password);
      router.replace("/dashboard");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid credentials");
    }
  };

  const handleBiometricLogin = async () => await promptBiometrics();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f3f4f6",
        padding: 20,
      }}
    >
      {/* Header */}
      <View style={{ marginBottom: 40, alignItems: "center" }}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={{
            width: 100,
            height: 100,
            marginBottom: 16,
            borderRadius: 20,
          }}
        />
        <Text style={{ fontSize: 32, fontWeight: "bold", color: "#1f2937" }}>
          SpotIn
        </Text>
        <Text style={{ fontSize: 16, color: "#6b7280", marginTop: 8 }}>
          Welcome back! Please login.
        </Text>
      </View>

      {/* Form */}
      <View style={{ width: "100%", maxWidth: 400 }}>
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              marginBottom: 8,
              fontSize: 14,
              fontWeight: "600",
              color: "#374151",
            }}
          >
            Email
          </Text>
          <TextInput
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            style={{
              width: "100%",
              backgroundColor: "white",
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            editable={!isLoading}
          />
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              marginBottom: 8,
              fontSize: 14,
              fontWeight: "600",
              color: "#374151",
            }}
          >
            Password
          </Text>
          <TextInput
            placeholder="********"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{
              width: "100%",
              backgroundColor: "white",
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? "#9ca3af" : "#4f46e5",
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
            marginBottom: 16,
            shadowColor: "#4f46e5",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
              Sign In
            </Text>
          )}
        </TouchableOpacity>

        {isBiometricSupported && !isLoading && (
          <TouchableOpacity
            onPress={handleBiometricLogin}
            style={{
              backgroundColor: "#ffffff",
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
              marginBottom: 16,
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}
          >
            <Text
              style={{ color: "#4f46e5", fontWeight: "bold", fontSize: 16 }}
            >
              Login with Biometrics
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
