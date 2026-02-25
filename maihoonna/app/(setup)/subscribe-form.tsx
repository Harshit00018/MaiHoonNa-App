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
    Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Mock Data structure for the package, simulating a future backend response
type PackageDetails = {
    id: string;
    name: string;
    price: number;
    durationString: string;
    hoursString: string;
};

const API_URL = Platform.OS === "android" ? "http://10.0.2.2:8000/api" : "http://localhost:8000/api";

export default function SubscribeFormScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Fetch dynamic selected package
    const [selectedPackage, setSelectedPackage] = useState<PackageDetails>({
        id: 'loading...',
        name: 'Loading Package...',
        price: 0,
        durationString: '...',
        hoursString: '...'
    });

    React.useEffect(() => {
        const fetchPackage = async () => {
            try {
                const response = await fetch(`${API_URL}/subscriptions/packages`);
                const json = await response.json();
                if (json.success) {
                    // Match the selected type, fallback to first item
                    const pkgType = params.packageId || 'silver';
                    const pkg = json.data.find((p: any) => p.type === pkgType) || json.data[0];
                    if (pkg) {
                        setSelectedPackage({
                            id: pkg.type,
                            name: pkg.name,
                            price: pkg.price,
                            durationString: '30 days',
                            hoursString: `${pkg.visitsPerWeek * 10} hours/month`
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to fetch package:', err);
            }
        };
        fetchPackage();
    }, [params.packageId]);

    const [currentStep, setCurrentStep] = useState<1 | 2>(1);

    // Form State
    const [subscriberForm, setSubscriberForm] = useState({
        fullName: '',
        phone: '',
        email: '',
        address: ''
    });

    const [beneficiaryForm, setBeneficiaryForm] = useState({
        fullName: '',
        dob: '',
        gender: '',
        maritalStatus: '',
        relationship: '',
        phone: '',
        address: ''
    });

    const handleNext = () => {
        if (currentStep === 1) {
            setCurrentStep(2);
        } else {
            // Both steps complete, proceed to checkout
            // You could pass the grouped form data here as params or via a global state manager (Redux/Zustand)
            router.push('/(setup)/checkout');
        }
    };

    const handleBack = () => {
        if (currentStep === 2) {
            setCurrentStep(1);
        } else {
            router.back();
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
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Subscribe to Care</Text>
                        <Text style={styles.headerSubtitle}>Step {currentStep} of 5</Text>
                    </View>
                    <View style={{ width: 40 }} /> {/* Layout spacer */}
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Sticky Package Banner */}
                    <View style={styles.packageBanner}>
                        <View>
                            <Text style={styles.packageName}>{selectedPackage.name}</Text>
                            <Text style={styles.packageSub}>{selectedPackage.hoursString}</Text>
                        </View>
                        <View style={styles.packagePriceContainer}>
                            <Text style={styles.packagePrice}>₹{selectedPackage.price.toLocaleString('en-IN')}</Text>
                            <Text style={styles.packageSub}>{selectedPackage.durationString}</Text>
                        </View>
                    </View>

                    {/* Form Container */}
                    <View style={styles.formCard}>

                        {/* --- STEP 1: SUBSCRIBER INFORMATION --- */}
                        {currentStep === 1 && (
                            <View>
                                <Text style={styles.sectionTitle}>Subscriber Information</Text>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Full Name *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your full name"
                                        placeholderTextColor="#9CA3AF"
                                        value={subscriberForm.fullName}
                                        onChangeText={(text) => setSubscriberForm({ ...subscriberForm, fullName: text })}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Phone Number</Text>
                                    <View style={styles.phoneInputContainer}>
                                        <View style={styles.countryCodeBox}>
                                            <Text style={styles.countryCodeText}>+91</Text>
                                        </View>
                                        <TextInput
                                            style={styles.phoneInput}
                                            placeholder="90000 90000"
                                            placeholderTextColor="#9CA3AF"
                                            keyboardType="numeric"
                                            maxLength={10}
                                            value={subscriberForm.phone}
                                            onChangeText={(text) => setSubscriberForm({ ...subscriberForm, phone: text })}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Email Address *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="your@email.com"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={subscriberForm.email}
                                        onChangeText={(text) => setSubscriberForm({ ...subscriberForm, email: text })}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Address *</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        placeholder="Enter complete address"
                                        placeholderTextColor="#9CA3AF"
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                        value={subscriberForm.address}
                                        onChangeText={(text) => setSubscriberForm({ ...subscriberForm, address: text })}
                                    />
                                </View>
                            </View>
                        )}

                        {/* --- STEP 2: BENEFICIARY INFORMATION --- */}
                        {currentStep === 2 && (
                            <View>
                                <Text style={styles.sectionTitle}>Beneficiary Information</Text>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Profile Photo</Text>
                                    <TouchableOpacity style={styles.uploadButton}>
                                        <Ionicons name="cloud-upload-outline" size={20} color="#4B5563" style={{ marginRight: 8 }} />
                                        <Text style={styles.uploadButtonText}>Upload Photo</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Beneficiary Name *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter beneficiary's full name"
                                        placeholderTextColor="#9CA3AF"
                                        value={beneficiaryForm.fullName}
                                        onChangeText={(text) => setBeneficiaryForm({ ...beneficiaryForm, fullName: text })}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Date of Birth *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="DD/MM/YYYY"
                                        placeholderTextColor="#9CA3AF"
                                        value={beneficiaryForm.dob}
                                        onChangeText={(text) => setBeneficiaryForm({ ...beneficiaryForm, dob: text })}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Gender *</Text>
                                    {/* Note: In a real app, use a picker library like @react-native-picker/picker. Using TextInput + Icon to match mockup for now */}
                                    <View style={styles.dropdownContainer}>
                                        <TextInput
                                            style={styles.dropdownInput}
                                            placeholder="Select Gender"
                                            placeholderTextColor="#9CA3AF"
                                            editable={false}
                                            value={beneficiaryForm.gender}
                                        />
                                        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Marital Status *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Single / Married / Widowed"
                                        placeholderTextColor="#9CA3AF"
                                        value={beneficiaryForm.maritalStatus}
                                        onChangeText={(text) => setBeneficiaryForm({ ...beneficiaryForm, maritalStatus: text })}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Relationship to Subscriber *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="E.g. Father, Mother"
                                        placeholderTextColor="#9CA3AF"
                                        value={beneficiaryForm.relationship}
                                        onChangeText={(text) => setBeneficiaryForm({ ...beneficiaryForm, relationship: text })}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Phone Number</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="10-digit mobile number"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="numeric"
                                        maxLength={10}
                                        value={beneficiaryForm.phone}
                                        onChangeText={(text) => setBeneficiaryForm({ ...beneficiaryForm, phone: text })}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Address *</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        placeholder="Enter complete address"
                                        placeholderTextColor="#9CA3AF"
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                        value={beneficiaryForm.address}
                                        onChangeText={(text) => setBeneficiaryForm({ ...beneficiaryForm, address: text })}
                                    />
                                </View>
                            </View>
                        )}

                    </View>
                </ScrollView>

                {/* Bottom Bar containing Next Button */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.nextButtonText}>Next</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFF5ED', // The app's warm background color
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
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTextContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    packageBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#3B82F6', // Blue border from mockup
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    packageName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    packageSub: {
        fontSize: 13,
        color: '#6B7280',
    },
    packagePriceContainer: {
        alignItems: 'flex-end',
    },
    packagePrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#F97316',
        marginBottom: 2,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#111827',
        backgroundColor: '#FFFFFF',
    },
    textArea: {
        height: 100,
        paddingTop: 12, // For android alignment when multiline
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    countryCodeBox: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F9FAFB',
        marginRight: 12,
    },
    countryCodeText: {
        fontSize: 15,
        color: '#374151',
        fontWeight: '500',
    },
    phoneInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#111827',
        backgroundColor: '#FFFFFF',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignSelf: 'flex-start',
    },
    uploadButtonText: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },
    dropdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
    },
    dropdownInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 15,
        color: '#111827',
    },
    bottomBar: {
        backgroundColor: '#FFF5ED',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#FDE6D5',
    },
    nextButton: {
        backgroundColor: '#F97316',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
