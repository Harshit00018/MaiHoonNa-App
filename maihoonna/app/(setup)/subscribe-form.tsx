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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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
            // Pass the grouped form data here as params
            router.push({
                pathname: '/(setup)/checkout',
                params: {
                    packageId: params.packageId || 'silver',
                    beneficiaryData: JSON.stringify({
                        name: beneficiaryForm.fullName,
                        age: 65, // Using a default age since dob needs parsing
                        gender: beneficiaryForm.gender || "Not specified",
                        address: beneficiaryForm.address,
                        relationship: beneficiaryForm.relationship,
                        phone: beneficiaryForm.phone
                    })
                }
            });
        }
    };

    const handleBack = () => {
        if (currentStep === 2) {
            setCurrentStep(1);
        } else {
            router.back();
        }
    };

    // Helper for Segmented buttons
    const SegmentedButton = ({ label, active, onPress }: { label: string, active: boolean, onPress: () => void }) => (
        <TouchableOpacity
            style={[styles.segmentBtn, active && styles.segmentBtnActive]}
            onPress={onPress}
        >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header matching Screenshot */}
                <View style={styles.header}>
                    <View style={styles.headerTopRow}>
                        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#111827" />
                        </TouchableOpacity>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerTitle}>Subscribe to Care</Text>
                            <Text style={styles.headerSubtitle}>Step {currentStep} of 5</Text>
                        </View>
                        <View style={styles.headerIcons}>
                            <View>
                                <Ionicons name="notifications-outline" size={26} color="#111827" />
                                <View style={styles.notifBadge}><Text style={styles.notifText}>2</Text></View>
                            </View>
                            <Ionicons name="menu-outline" size={30} color="#111827" style={{ marginLeft: 15 }} />
                        </View>
                    </View>
                    {/* Progress Bar */}
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: currentStep === 1 ? '20%' : '40%' }]} />
                    </View>
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

                                {/* Profile Photo Upload UI */}
                                <Text style={styles.label}>Profile Photo</Text>
                                <View style={styles.photoUploadContainer}>
                                    <TouchableOpacity style={styles.photoBox}>
                                        <MaterialCommunityIcons name="image-plus" size={32} color="#4B5563" />
                                        <Text style={styles.uploadLabel}>Upload Photo</Text>
                                        <TouchableOpacity style={styles.editIconBadge}>
                                            <Ionicons name="pencil" size={12} color="white" />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                    <Text style={styles.photoHint}>Add a clear photo for identification</Text>
                                </View>

                                {/* Beneficiary Name */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Beneficiary Name *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter beneficiary's full name"
                                        placeholderTextColor="#9CA3AF"
                                        value={beneficiaryForm.fullName}
                                        onChangeText={(t) => setBeneficiaryForm({ ...beneficiaryForm, fullName: t })}
                                    />
                                </View>

                                {/* Date of Birth */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Date of Birth *</Text>
                                    <View style={styles.inputWithIcon}>
                                        <TextInput
                                            style={styles.flexInput}
                                            placeholder="dd-mm-yyyy"
                                            placeholderTextColor="#9CA3AF"
                                            value={beneficiaryForm.dob}
                                            onChangeText={(t) => setBeneficiaryForm({ ...beneficiaryForm, dob: t })}
                                        />
                                        <Ionicons name="calendar-outline" size={20} color="#4B5563" />
                                    </View>
                                </View>

                                {/* Gender Segmented Selection */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Gender *</Text>
                                    <View style={styles.segmentContainer}>
                                        <SegmentedButton
                                            label="Male"
                                            active={beneficiaryForm.gender === 'Male'}
                                            onPress={() => setBeneficiaryForm({ ...beneficiaryForm, gender: 'Male' })}
                                        />
                                        <SegmentedButton
                                            label="Female"
                                            active={beneficiaryForm.gender === 'Female'}
                                            onPress={() => setBeneficiaryForm({ ...beneficiaryForm, gender: 'Female' })}
                                        />
                                    </View>
                                </View>

                                {/* Marital Status Segmented Selection */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Marital Status *</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.segmentContainer}>
                                        {['Single', 'Married', 'Widowed', 'Divorced'].map((status) => (
                                            <SegmentedButton
                                                key={status}
                                                label={status}
                                                active={beneficiaryForm.maritalStatus === status}
                                                onPress={() => setBeneficiaryForm({ ...beneficiaryForm, maritalStatus: status })}
                                            />
                                        ))}
                                    </ScrollView>
                                </View>

                                {/* Relationship Dropdown */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Relationship to Subscriber *</Text>
                                    <View style={styles.inputWithIcon}>
                                        <TextInput
                                            style={styles.flexInput}
                                            placeholder="E.g. Father, Mother"
                                            placeholderTextColor="#9CA3AF"
                                            value={beneficiaryForm.relationship}
                                            onChangeText={(t) => setBeneficiaryForm({ ...beneficiaryForm, relationship: t })}
                                        />
                                    </View>
                                </View>

                                {/* Phone Number */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Phone Number</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="10-digit mobile number"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="numeric"
                                        value={beneficiaryForm.phone}
                                        onChangeText={(t) => setBeneficiaryForm({ ...beneficiaryForm, phone: t })}
                                    />
                                </View>

                                {/* Address Area */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Address *</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        placeholder="Enter complete address"
                                        placeholderTextColor="#9CA3AF"
                                        multiline
                                        value={beneficiaryForm.address}
                                        onChangeText={(t) => setBeneficiaryForm({ ...beneficiaryForm, address: t })}
                                    />
                                </View>
                            </View>
                        )}

                    </View>
                </ScrollView>

                {/* Footer Buttons */}
                <View style={styles.buttonRow}>
                    {currentStep === 2 && (
                        <TouchableOpacity style={styles.prevBtn} onPress={handleBack}>
                            <Text style={styles.prevBtnText}>Previous</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[styles.nextBtn, { flex: currentStep === 1 ? 1 : 0.48 }]} onPress={handleNext}>
                        <Text style={styles.nextBtnText}>Next</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFF5ED' },
    header: { backgroundColor: '#FFFFFF', paddingTop: 10 },
    headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingBottom: 10 },
    headerIcons: { flexDirection: 'row', alignItems: 'center' },
    backButton: { width: 40 },
    headerTextContainer: { alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
    headerSubtitle: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
    notifBadge: { position: 'absolute', right: -4, top: -2, backgroundColor: '#E46C2B', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
    notifText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    progressBarBg: { height: 4, backgroundColor: '#E5E7EB', width: '100%' },
    progressBarFill: { height: 4, backgroundColor: '#F97316', width: '40%' },

    scrollContent: { padding: 15 },
    packageBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#3B82F6',
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

    formCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, elevation: 1 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 20 },

    label: { fontSize: 14, fontWeight: '500', color: '#111827', marginBottom: 10 },
    inputGroup: { marginBottom: 20 },
    input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 12, fontSize: 15, color: '#111827' },
    inputWithIcon: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 12 },
    flexInput: { flex: 1, fontSize: 15, color: '#111827' },
    textArea: { height: 80, textAlignVertical: 'top' },

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

    photoUploadContainer: { alignItems: 'center', marginBottom: 25 },
    photoBox: { width: 150, height: 90, borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
    uploadLabel: { fontSize: 12, color: '#4B5563', marginTop: 5 },
    editIconBadge: { position: 'absolute', bottom: -5, right: -5, backgroundColor: '#F97316', padding: 5, borderRadius: 10 },
    photoHint: { fontSize: 11, color: '#4B5563', marginTop: 10 },

    segmentContainer: { flexDirection: 'row', marginBottom: 5 },
    segmentBtn: { backgroundColor: '#E5E7EB', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginRight: 10 },
    segmentBtnActive: { backgroundColor: '#F97316' },
    segmentText: { fontSize: 13, color: '#4B5563' },
    segmentTextActive: { color: '#FFFFFF', fontWeight: '500' },

    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 20 },
    prevBtn: { flex: 0.48, borderWidth: 1, borderColor: '#F97316', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
    prevBtnText: { color: '#F97316', fontSize: 16, fontWeight: '600' },
    nextBtn: { backgroundColor: '#F97316', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
    nextBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' }
});
