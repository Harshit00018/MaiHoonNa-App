import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Platform.OS === "android" ? "http://10.0.2.2:8000/api" : "http://localhost:8000/api";

export default function CheckoutScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // E.g. passing packageId='premium' from previous steps. If none, default to basic.
    const packageId = (params.packageId as string) || 'silver';

    // State to toggle between Payment methods
    const [activeTab, setActiveTab] = useState<'UPI' | 'Cards' | 'Net Banking'>('UPI');

    const [upiId, setUpiId] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const [basePrice, setBasePrice] = useState(0);
    const [taxes, setTaxes] = useState(0);
    const [totalAmount, setTotalAmount] = useState('0.00');
    const [packageName, setPackageName] = useState('Subscription');

    React.useEffect(() => {
        const fetchPackage = async () => {
            try {
                const response = await fetch(`${API_URL}/subscriptions/packages`);
                const json = await response.json();
                if (json.success) {
                    const pkgType = packageId || 'silver';
                    const pkg = json.data.find((p: any) => p.type === pkgType) || json.data[0];
                    if (pkg) {
                        setPackageName(pkg.name);
                        const price = pkg.price;
                        setBasePrice(price);
                        const taxInc = price * 0.18;
                        setTaxes(taxInc);
                        setTotalAmount((price + taxInc).toFixed(2));
                    }
                }
            } catch (err) {
                console.error('Failed to fetch package:', err);
            }
        };
        fetchPackage();
    }, [packageId]);

    const handlePay = async () => {
        // 1. Strict Form Validation
        if (activeTab === 'UPI' && !upiId.includes('@')) {
            Alert.alert("Validation Error", "Please enter a valid UPI ID (e.g. name@bank).");
            return;
        }

        setIsProcessing(true);

        try {
            // 2. Read persistent user ID from AsyncStorage
            const storedUserData = await AsyncStorage.getItem('userData');
            if (!storedUserData) {
                throw new Error("You are not logged in. Session expired.");
            }
            const user = JSON.parse(storedUserData);

            // 3. Mock Beneficiary details (in a real flow, these would be passed from Step 2 of `subscribe-form.tsx`)
            const dummyBeneficiaryData = {
                name: "Mock Beneficiary",
                age: 65,
                gender: "Female",
                address: "789 Care Avenue",
                relationship: "Mother",
                phone: "9876543210"
            };

            // 4. Send API Request to backend to record Subscription + Beneficiary
            const response = await fetch(`${API_URL}/subscriptions/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Usually pass Bearer token here too
                },
                body: JSON.stringify({
                    userId: user.id, // the logged-in user!
                    packageId: packageId,
                    beneficiaryData: dummyBeneficiaryData
                })
            });

            const data = await response.json();

            if (data.success) {
                // Success! Go to Payment Success screen with details
                router.replace({
                    pathname: '/(setup)/payment-success',
                    params: {
                        orderId: data.subscriptionId,
                        packageName: data.package,
                        price: totalAmount
                    }
                });
            } else {
                throw new Error(data.message || "Payment attempt failed on server.");
            }

        } catch (error: any) {
            console.error("Checkout flow error:", error);
            Alert.alert("Checkout Failed", error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Checkout</Text>
                        <Text style={styles.headerSubtitle}>Complete your purchase securely</Text>
                    </View>
                    <View style={{ width: 40 }} /> {/* Spacer */}
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <Text style={styles.sectionTitle}>Payment Details</Text>
                    <Text style={styles.sectionSubtitle}>Choose your preferred payment method</Text>

                    {/* Secure Badge */}
                    <View style={styles.secureBadge}>
                        <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" />
                        <View style={{ marginLeft: 12 }}>
                            <Text style={styles.secureTitle}>100% Secure Payment</Text>
                            <Text style={styles.secureDesc}>Your payment information is encrypted and secure</Text>
                        </View>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabContainer}>
                        {['UPI', 'Cards', 'Net Banking'].map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
                                onPress={() => setActiveTab(tab as any)}
                            >
                                <Ionicons
                                    name={tab === 'UPI' ? 'phone-portrait-outline' : tab === 'Cards' ? 'card-outline' : 'business-outline'}
                                    size={16}
                                    color={activeTab === tab ? '#FFFFFF' : '#6B7280'}
                                    style={{ marginRight: 6 }}
                                />
                                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Tab Content Area */}
                    <View style={styles.contentCard}>

                        {activeTab === 'UPI' && (
                            <View>
                                <View style={styles.paymentMethodHeader}>
                                    <Ionicons name="qr-code-outline" size={20} color="#F97316" />
                                    <Text style={styles.paymentMethodTitle}>Pay using any UPI app</Text>
                                </View>

                                {/* Chips */}
                                <View style={styles.chipRow}>
                                    {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                                        <View key={app} style={styles.chip}>
                                            <Text style={styles.chipText}>{app}</Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Input block */}
                                <Text style={styles.inputLabel}>Enter UPI ID</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="yourname@paytm / yourname@okaxis"
                                    placeholderTextColor="#9CA3AF"
                                    value={upiId}
                                    onChangeText={setUpiId}
                                    autoCapitalize="none"
                                />
                                <Text style={styles.helpText}>Example: 9876543210@paytm</Text>

                                <View style={styles.qrPlaceholder}>
                                    <Ionicons name="qr-code" size={60} color="#9CA3AF" />
                                    <Text style={styles.qrText}>Or scan QR code with any UPI app</Text>
                                </View>
                            </View>
                        )}

                        {activeTab !== 'UPI' && (
                            <View style={styles.qrPlaceholder}>
                                <Text style={styles.qrText}>Integration details for {activeTab} coming soon.</Text>
                            </View>
                        )}

                        {/* Promo Area shared across tabs */}
                        <Text style={[styles.inputLabel, { marginTop: 24 }]}>Promo Code (Optional)</Text>
                        <View style={styles.promoRow}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                placeholder="Enter promo code"
                                placeholderTextColor="#9CA3AF"
                                value={promoCode}
                                onChangeText={setPromoCode}
                            />
                            <TouchableOpacity style={styles.applyBtn}>
                                <Text style={styles.applyBtnText}>Apply</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Total Payment Button */}
                        <TouchableOpacity
                            style={[styles.payButton, isProcessing && { opacity: 0.7 }]}
                            onPress={handlePay}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="lock-closed-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.payButtonText}>Pay ₹{totalAmount}</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.termsText}>
                            By completing this purchase, you agree to our Terms of Service and Privacy Policy
                        </Text>

                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFF5ED', // Warm MaiHoonNa background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 15,
        backgroundColor: '#FFFFFF',
    },
    backButton: { width: 40, height: 40, justifyContent: 'center' },
    headerTextContainer: { alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
    headerSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },

    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
    sectionSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 20 },

    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5', // Light green
        borderWidth: 1,
        borderColor: '#A7F3D0',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
    },
    secureTitle: { fontSize: 14, fontWeight: '700', color: '#065F46' },
    secureDesc: { fontSize: 12, color: '#047857', marginTop: 2 },

    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFEBE0',
        paddingVertical: 12,
        borderRadius: 20,
        marginHorizontal: 4,
    },
    tabButtonActive: {
        backgroundColor: '#F97316',
    },
    tabText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
    tabTextActive: { color: '#FFFFFF' },

    contentCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    paymentMethodHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        marginLeft: -20,
        marginRight: -20,
        marginTop: -20,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    paymentMethodTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginLeft: 8 },

    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    chip: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    chipText: { fontSize: 12, color: '#4B5563', fontWeight: '500' },

    inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#111827',
        marginBottom: 4,
    },
    helpText: { fontSize: 11, color: '#9CA3AF', marginBottom: 20 },

    qrPlaceholder: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrText: { fontSize: 13, color: '#6B7280', marginTop: 12, textAlign: 'center' },

    promoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    applyBtn: {
        marginLeft: 12,
        borderWidth: 1,
        borderColor: '#F97316',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    applyBtnText: { color: '#F97316', fontWeight: '600', fontSize: 14 },

    payButton: {
        backgroundColor: '#F97316',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    payButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

    termsText: {
        fontSize: 11,
        color: '#9CA3AF',
        textAlign: 'center',
        paddingHorizontal: 10,
        lineHeight: 16,
    },
});
