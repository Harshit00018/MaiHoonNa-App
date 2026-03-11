import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    ActivityIndicator, TouchableOpacity, Image, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { API_URL } from '@/constants/api';

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

            const response = await fetch(`${API_URL}/subscriber/beneficiaries/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.id}`
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
                <Text style={styles.headerTitle}>Dashboard</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.notificationIcon}>
                        <Ionicons name="notifications-outline" size={24} color="#111827" />
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>2</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name="menu" size={28} color="#111827" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.pageHeader}>
                    <Text style={styles.pageTitle}>Your Beneficiaries</Text>
                    <TouchableOpacity style={styles.addBtn}>
                        <Ionicons name="add" size={16} color="#FFF" style={{ marginRight: 4 }} />
                        <Text style={styles.addBtnText}>Add Beneficiary</Text>
                    </TouchableOpacity>
                </View>

                {/* Top Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileTopRow}>
                        <Image source={{ uri: imgSource }} style={styles.profileImage} />
                        <View style={styles.profileMeta}>
                            <Text style={styles.nameText}>{beneficiary.name}</Text>
                            <Text style={styles.subText}>{beneficiary.age} years • {beneficiary.relationship || 'Relative'}</Text>

                            <View style={styles.addedBadge}>
                                <Ionicons name="heart-outline" size={12} color="#FFF" style={{ marginRight: 4 }} />
                                <Text style={styles.addedBadgeText}>Beneficiary Added</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.packageCard}>
                        <Text style={styles.packageLabel}>Active Package</Text>
                        <Text style={styles.packageValue}>Premium Care Plan</Text>
                    </View>
                </View>

                {/* Timeline Card */}
                <View style={styles.timelineCard}>
                    <View style={styles.welcomeBanner}>
                        <View style={styles.welcomeIconContainer}>
                            <Ionicons name="heart" size={24} color="#FFF" />
                        </View>
                        <Text style={styles.welcomeText}>
                            Welcome! Your beneficiary has been added successfully
                        </Text>
                    </View>

                    <Text style={styles.timelineDesc}>
                        Your care companion will be assigned shortly. You'll receive updates on visits, health monitoring, and daily activities.
                    </Text>

                    <View style={styles.timelineSteps}>
                        {/* Step 1 */}
                        <View style={styles.stepItem}>
                            <View style={styles.stepHeader}>
                                <Ionicons name="shield-checkmark-outline" size={16} color="#F97316" />
                                <Text style={styles.stepLabel}>Step 1</Text>
                            </View>
                            <Text style={styles.stepTitle}>Companion Assignment</Text>
                            <Text style={styles.stepSubtitle}>Within 24 hours</Text>
                        </View>

                        {/* Step 2 */}
                        <View style={styles.stepItem}>
                            <View style={styles.stepHeader}>
                                <Ionicons name="people-outline" size={16} color="#F97316" />
                                <Text style={styles.stepLabel}>Step 2</Text>
                            </View>
                            <Text style={styles.stepTitle}>First Visit</Text>
                            <Text style={styles.stepSubtitle}>Scheduled soon</Text>
                        </View>

                        {/* Step 3 */}
                        <View style={styles.stepItem}>
                            <View style={styles.stepHeader}>
                                <Ionicons name="time-outline" size={16} color="#F97316" />
                                <Text style={styles.stepLabel}>Step 3</Text>
                            </View>
                            <Text style={styles.stepTitle}>Regular Care</Text>
                            <Text style={styles.stepSubtitle}>Ongoing support</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>

            <TouchableOpacity style={styles.fab}>
                <Ionicons name="chatbubble-ellipses-outline" size={24} color="#FFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFF0E5' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF0E5' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, backgroundColor: '#FFFFFF'
    },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    notificationIcon: { marginRight: 20, position: 'relative' },
    badge: {
        position: 'absolute', top: -4, right: -4, backgroundColor: '#F97316',
        borderRadius: 10, width: 16, height: 16, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#FFF'
    },
    badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

    scrollContent: { padding: 20, paddingBottom: 80 },

    pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    pageTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
    addBtn: {
        backgroundColor: '#F97316', flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8
    },
    addBtnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },

    profileCard: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
    },
    profileTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
    profileImage: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E5E7EB', marginRight: 16 },
    profileMeta: { flex: 1 },
    nameText: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
    subText: { fontSize: 13, color: '#4B5563', marginBottom: 8 },
    addedBadge: {
        backgroundColor: '#F97316', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16,
        alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center'
    },
    addedBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '600' },

    packageCard: {
        backgroundColor: '#F9FAFB', borderRadius: 8, padding: 12, marginTop: 4
    },
    packageLabel: { fontSize: 11, color: '#6B7280', marginBottom: 4 },
    packageValue: { fontSize: 14, fontWeight: '600', color: '#111827' },

    timelineCard: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
    },
    welcomeBanner: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    welcomeIconContainer: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#F97316',
        justifyContent: 'center', alignItems: 'center', marginRight: 12
    },
    welcomeText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#111827', lineHeight: 22 },

    timelineDesc: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 24 },

    timelineSteps: { gap: 12 },
    stepItem: {
        borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 12, padding: 16,
    },
    stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    stepLabel: { fontSize: 12, fontWeight: '600', color: '#4B5563', marginLeft: 6 },
    stepTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 },
    stepSubtitle: { fontSize: 13, color: '#9CA3AF' },

    backButton: { marginTop: 16, backgroundColor: '#F97316', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },

    fab: {
        position: 'absolute', bottom: 24, right: 24,
        width: 56, height: 56, borderRadius: 28, backgroundColor: '#22C55E',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5
    }
});

