import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

// Update this if you run on a physical device to your computer's local IP (e.g., http://192.168.1.5:3000/api)
const API_URL = Platform.OS === "android" ? "http://10.0.2.2:8000/api" : "http://localhost:8000/api";

export default function AuthScreen() {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    // 1. Basic UI Validation
    if (phone.length !== 10) {
      Alert.alert("Invalid input", "Please enter a valid 10-digit phone number.");
      return;
    }

    setIsLoading(true);

    try {
      // 2. Call the Real Backend API to trigger the Twilio/Dev OTP
      // Make sure your backend (npm run dev) is running on port 3000
      // const response = await fetch(`${API_URL}/auth/send-otp`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ phone: `+91${phone}` }), // Add country code
      // });

      // const data = await response.json();

      // if (data.success) {
      // 3. Navigate ONLY if the backend confirms OTP was sent
      // We pass the phone number forward so the verify screen knows what to verify against
      router.push({
        pathname: "/(auth)/verify-otp",
        params: { phone: `+91${phone}` },
      });
      // } else {
      //   Alert.alert("Error", data.message || "Failed to send OTP.");
      // }
    } catch (error) {
      console.error("Login API Error:", error);
      Alert.alert("Network Error", "Could not connect to the backend server. Is it running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Header & Location */}
        <View style={styles.header}>
          <View style={styles.locationBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.locationText}>Location Services: Active</Text>
          </View>

          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoLetter}>M</Text>
            </View>
            <Text style={styles.logoText}>MaiHoonNa</Text>
          </View>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Login with Phone</Text>

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputRow}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit number"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity style={[styles.otpButton, isLoading && styles.otpButtonDisabled]} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.otpButtonText}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>Or continue with</Text>
          <View style={styles.line} />
        </View>

        {/* Biometric Button */}
        <TouchableOpacity style={styles.bioButton} disabled={isLoading}>
          <Text style={styles.bioIcon}>@</Text>
          <Text style={styles.bioButtonText}>Biometric Login</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>

          <TouchableOpacity onPress={() => router.push("/(auth)/login-password")}>
            <Text style={styles.newUser}>
              Already registered? <Text style={styles.orangeText}>Log In with Password</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={[styles.newUser, { marginBottom: 24 }]}>
              New user? <Text style={styles.orangeText}>Sign Up</Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            By continuing, you agree to our{"\n"}
            <Text style={styles.orangeText}>Terms of Service</Text> and{" "}
            <Text style={styles.orangeText}>Privacy Policy</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 40,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },
  locationText: {
    color: "#22C55E",
    fontSize: 12,
    fontWeight: "500",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  logoLetter: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
  },
  card: {
    backgroundColor: "#FFF5ED",
    padding: 24,
    borderRadius: 16,
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 24,
    textAlign: "center",
  },
  label: {
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 20,
    height: 48,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  countryCode: {
    fontSize: 16,
    color: "#111827",
    marginRight: 8,
    fontWeight: "500",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  otpButton: {
    backgroundColor: "#FBA56B",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    height: 50,
    justifyContent: "center"
  },
  otpButtonDisabled: {
    backgroundColor: "#FDBA8C",
  },
  otpButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#6B7280",
  },
  bioButton: {
    backgroundColor: "#000000",
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  bioIcon: {
    color: "#FFFFFF",
    marginRight: 8,
    fontSize: 16,
  },
  bioButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  footer: {
    alignItems: "center",
  },
  newUser: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
  },
  terms: {
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    color: "#9CA3AF",
  },
  orangeText: {
    color: "#F97316",
    fontWeight: "500",
  },
});
