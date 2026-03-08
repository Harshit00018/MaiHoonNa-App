import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    ActivityIndicator, TouchableOpacity, Image, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GlobalHeader } from '../../components/GlobalHeader';

const API_URL = Platform.OS === "android" ? "http://10.0.2.2:8000/api" : "http://localhost:8000/api";

export default function BeneficiaryProfileScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { id } = params;

    const [beneficiary, setBeneficiary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchBeneficiary = async () => {
        try {
            const stored = await AsyncStorage.getItem('userData');
            if (!stored) {
                router.replace('/(auth)');
                return;
            }

            const user = JSON.parse(stored);

            // Need to pass the user ID in the headers since the backend validates `authenticate` via token or user ID
            const response = await fetch(`${API_URL}/beneficiaries/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.id}` // Use user ID as mockup token if needed
                }
            });
            const data = await response.json();

            if (data.success) {
                setBeneficiary(data.data);
            } else {
                console.error("Failed to load:", data.message);
            }
        } catch (e) {
            console.error("Beneficiary fetch error:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchBeneficiary();
        }
    }, [id]);

    if (loading) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#F97316" />
            </SafeAreaView>
        );
    }

    if (!beneficiary) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <Text style={{ color: '#6B7280' }}>Beneficiary not found.</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={{ color: '#FFF' }}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const imgSource = 'https://randomuser.me/api/portraits/lego/1.jpg'; // Mock image since we don't store it yet

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Beneficiary Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Top Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileTopRow}>
                        <Image source={{ uri: imgSource }} style={styles.profileImage} />
                        <View style={styles.profileMeta}>
                            <Text style={styles.nameText}>{beneficiary.name}</Text>
                            <Text style={styles.subText}>{beneficiary.age} Years • {beneficiary.gender}</Text>
                            <Text style={styles.subText}>{beneficiary.relationship || 'Relative'}</Text>
                        </View>
                    </View>

                    <View style={styles.contactRow}>
                        <Ionicons name="call-outline" size={16} color="#6B7280" />
                        <Text style={styles.contactText}>
                            {beneficiary.emergencyContacts?.[0]?.phone || 'No phone provided'}
                        </Text>
                    </View>

                    <View style={styles.contactRow}>
                        <Ionicons name="location-outline" size={16} color="#6B7280" />
                        <Text style={styles.contactText}>{beneficiary.address || "Address not provided"}</Text>
                    </View>
                </View>

                {/* Health Overview */}
                <Text style={styles.sectionTitle}>Health Overview</Text>
                <View style={styles.card}>
                    <View style={styles.statRow}>
                        <View style={styles.statColumn}>
                            <Text style={styles.statLabel}>Medical Conditions</Text>
                            <Text style={styles.statValue}>
                                {beneficiary.medicalConditions?.length > 0
                                    ? beneficiary.medicalConditions.join(", ")
                                    : "None reported"}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statRow}>
                        <View style={styles.statColumn}>
                            <Text style={styles.statLabel}>Primary Care Companion</Text>
                            <Text style={styles.statValue}>
                                {beneficiary.primaryCcId || "Pending Assignment"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Wellbeing Scores */}
                <Text style={styles.sectionTitle}>Wellbeing Tracking</Text>
                <View style={styles.card}>
                    <View style={styles.progressRow}>
                        <Text style={styles.statLabel}>Current Emotional Score</Text>
                        <Text style={styles.statValuePrimary}>{beneficiary.emotionalScore || 85}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${beneficiary.emotionalScore || 85}%`, backgroundColor: '#F97316' }]} />
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFF5ED' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF5ED' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, backgroundColor: '#FFFFFF'
    },
    backIcon: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
    scrollContent: { padding: 20, paddingBottom: 40 },

    profileCard: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
    },
    profileTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    profileImage: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#E5E7EB', marginRight: 16 },
    profileMeta: { flex: 1 },
    nameText: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
    subText: { fontSize: 13, color: '#4B5563', marginBottom: 2 },

    contactRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    contactText: { fontSize: 13, color: '#4B5563', marginLeft: 8 },

    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12, marginTop: 8 },
    card: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
    },
    statRow: { flexDirection: 'row', justifyContent: 'space-between' },
    statColumn: { flex: 1 },
    statLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
    statValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
    statValuePrimary: { fontSize: 14, fontWeight: '700', color: '#F97316' },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },

    progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressBarBg: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },

    backButton: { marginTop: 16, backgroundColor: '#F97316', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 }
});
