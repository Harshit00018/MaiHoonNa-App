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

export default function MedicalInfoScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [medicalForm, setMedicalForm] = useState({
        medicalConditions: '',
        currentMedications: '',
        physicianName: '',
        physicianPhone: '',
        hobbies: '',
    });

    const [vitals, setVitals] = useState({
        bloodPressure: false,
        heartRate: false,
        bloodSugar: false,
        temperature: false,
        oxygenSaturation: false,
        weight: false
    });

    const handleNext = () => {
        router.push({
            pathname: '/(setup)/emergency-contacts',
            params: {
                packageId: params.packageId,
                subscriberData: params.subscriberData,
                beneficiaryData: params.beneficiaryData,
                medicalData: JSON.stringify({ ...medicalForm, vitals })
            }
        });
    };

    const handleBack = () => {
        router.back();
    };

    const Checkbox = ({ label, checked, onPress }: { label: string, checked: boolean, onPress: () => void }) => (
        <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
            <Ionicons
                name={checked ? "checkbox" : "square-outline"}
                size={22}
                color={checked ? "#F97316" : "#9CA3AF"}
            />
            <Text style={styles.checkboxLabel}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTopRow}>
                        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#111827" />
                        </TouchableOpacity>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerTitle}>Subscribe to Care</Text>
                            <Text style={styles.headerSubtitle}>Step 3 of 5</Text>
                        </View>
                        <View style={styles.headerIcons}>
                            <View>
                                <Ionicons name="notifications-outline" size={26} color="#111827" />
                                <View style={styles.notifBadge}><Text style={styles.notifText}>2</Text></View>
                            </View>
                            <Ionicons name="menu-outline" size={30} color="#111827" style={{ marginLeft: 15 }} />
                        </View>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: '60%' }]} />
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.formCard}>
                        <Text style={styles.sectionTitle}>Medical Information</Text>

                        {/* Current Medical Conditions */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Current Medical Conditions</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="List any existing medical conditions (Diabetes, Hypertension, etc.)"
                                placeholderTextColor="#9CA3AF"
                                multiline
                                textAlignVertical="top"
                                value={medicalForm.medicalConditions}
                                onChangeText={(t) => setMedicalForm({ ...medicalForm, medicalConditions: t })}
                            />
                        </View>

                        {/* Current Medications */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Current Medications</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="List medications with dosage and frequency"
                                placeholderTextColor="#9CA3AF"
                                multiline
                                textAlignVertical="top"
                                value={medicalForm.currentMedications}
                                onChangeText={(t) => setMedicalForm({ ...medicalForm, currentMedications: t })}
                            />
                        </View>

                        {/* Vitals */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Vitals to Track During Home Visits</Text>
                            <Checkbox label="Blood Pressure" checked={vitals.bloodPressure} onPress={() => setVitals({ ...vitals, bloodPressure: !vitals.bloodPressure })} />
                            <Checkbox label="Heart Rate" checked={vitals.heartRate} onPress={() => setVitals({ ...vitals, heartRate: !vitals.heartRate })} />
                            <Checkbox label="Blood Sugar" checked={vitals.bloodSugar} onPress={() => setVitals({ ...vitals, bloodSugar: !vitals.bloodSugar })} />
                            <Checkbox label="Temperature" checked={vitals.temperature} onPress={() => setVitals({ ...vitals, temperature: !vitals.temperature })} />
                            <Checkbox label="Oxygen Saturation" checked={vitals.oxygenSaturation} onPress={() => setVitals({ ...vitals, oxygenSaturation: !vitals.oxygenSaturation })} />
                            <Checkbox label="Weight" checked={vitals.weight} onPress={() => setVitals({ ...vitals, weight: !vitals.weight })} />
                        </View>

                        {/* Primary Physician Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Primary Physician Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Dr. Name"
                                placeholderTextColor="#9CA3AF"
                                value={medicalForm.physicianName}
                                onChangeText={(t) => setMedicalForm({ ...medicalForm, physicianName: t })}
                            />
                        </View>

                        {/* Physician Phone */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Physician Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Contact number"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                value={medicalForm.physicianPhone}
                                onChangeText={(t) => setMedicalForm({ ...medicalForm, physicianPhone: t })}
                            />
                        </View>

                        {/* Hobbies & Interests */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Hobbies & Interests</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Reading, gardening, music, etc."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                textAlignVertical="top"
                                value={medicalForm.hobbies}
                                onChangeText={(t) => setMedicalForm({ ...medicalForm, hobbies: t })}
                            />
                            <Text style={styles.hintText}>This helps us create meaningful social connections</Text>
                        </View>
                    </View>

                </ScrollView>

                {/* Footer Buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.prevBtn} onPress={handleBack}>
                        <Text style={styles.prevBtnText}>Previous</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
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
    progressBarFill: { height: 4, backgroundColor: '#F97316', width: '60%' },

    scrollContent: { padding: 15 },
    formCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, elevation: 1 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 20 },

    label: { fontSize: 14, fontWeight: '500', color: '#111827', marginBottom: 10 },
    inputGroup: { marginBottom: 20 },
    input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 12, fontSize: 15, color: '#111827' },
    textArea: { height: 80, textAlignVertical: 'top' },
    hintText: { fontSize: 12, color: '#6B7280', marginTop: 8 },

    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    checkboxLabel: { fontSize: 14, color: '#4B5563', marginLeft: 10 },

    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 20 },
    prevBtn: { flex: 0.48, borderWidth: 1, borderColor: '#F97316', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
    prevBtnText: { color: '#F97316', fontSize: 16, fontWeight: '600' },
    nextBtn: { flex: 0.48, backgroundColor: '#F97316', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
    nextBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' }
});
