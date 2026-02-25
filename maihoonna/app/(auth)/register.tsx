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
    ActivityIndicator,
    ScrollView
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = Platform.OS === "android" ? "http://10.0.2.2:8000/api" : "http://localhost:8000/api";

export default function RegisterPasswordScreen() {
    const [form, setForm] = useState({
        phone: "",
        name: "",
        age: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async () => {
        // Basic validation
        if (form.phone.length !== 10) {
            Alert.alert("Invalid input", "Please enter a valid 10-digit phone number.");
            return;
        }
        if (!form.name || !form.password) {
            Alert.alert("Missing Fields", "Please fill in all required fields.");
            return;
        }

        const ageNum = parseInt(form.age, 10);
        if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
            Alert.alert("Invalid Age", "Please enter a valid age (18+).");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/register-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone: `+91${form.phone}`,
                    name: form.name,
                    age: ageNum,
                    password: form.password
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Save user session!
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(data.user));

                // Registration successful! Store tokens/details and go to dashboard
                router.push({
                    pathname: "/(auth)/dashboard-preview",
                    params: { user: JSON.stringify(data.user) }
                });
            } else {
                Alert.alert("Registration Failed", data.message || "Something went wrong.");
            }
        } catch (error) {
            console.error("Register Error:", error);
            Alert.alert("Network Error", "Could not connect to the backend server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.container}>

                    <View style={styles.header}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Sign up to access MaiHoonNa services.</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="John Doe"
                                placeholderTextColor="#999"
                                value={form.name}
                                onChangeText={(text) => setForm({ ...form, name: text })}
                                editable={!isLoading}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Age</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 35"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                                maxLength={3}
                                value={form.age}
                                onChangeText={(text) => setForm({ ...form, age: text })}
                                editable={!isLoading}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <View style={styles.phoneRow}>
                                <Text style={styles.countryCode}>+91</Text>
                                <TextInput
                                    style={styles.phoneInput}
                                    placeholder="10-digit mobile number"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                    maxLength={10}
                                    value={form.phone}
                                    onChangeText={(text) => setForm({ ...form, phone: text })}
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Secure password (min 6 chars)"
                                placeholderTextColor="#999"
                                secureTextEntry
                                value={form.password}
                                onChangeText={(text) => setForm({ ...form, password: text })}
                                editable={!isLoading}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Sign Up</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => router.push("/(auth)/login-password")}
                            disabled={isLoading}
                        >
                            <Text style={styles.secondaryButtonText}>Already have an account? Log In</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
    container: { flexGrow: 1, padding: 24, justifyContent: "center" },
    header: { marginBottom: 30, alignItems: "center" },
    title: { fontSize: 28, fontWeight: "700", color: "#111827", marginBottom: 8 },
    subtitle: { fontSize: 14, color: "#6B7280", textAlign: "center" },
    card: { backgroundColor: "#FFF5ED", padding: 24, borderRadius: 16 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, color: "#4B5563", marginBottom: 8, fontWeight: "500" },
    input: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#F3F4F6",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: "#111827",
    },
    phoneRow: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        alignItems: "center",
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#F3F4F6",
    },
    countryCode: { fontSize: 16, color: "#111827", marginRight: 8, fontWeight: "500" },
    phoneInput: { flex: 1, paddingVertical: 14, fontSize: 16, color: "#111827" },
    primaryButton: {
        backgroundColor: "#FBA56B",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    primaryButtonDisabled: { backgroundColor: "#FDBA8C" },
    primaryButtonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 16 },
    secondaryButton: { marginTop: 20, alignItems: "center" },
    secondaryButtonText: { color: "#F97316", fontWeight: "500", fontSize: 14 },
});
