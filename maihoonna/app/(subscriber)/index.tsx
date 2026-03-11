import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    ActivityIndicator, TouchableOpacity, RefreshControl, Image, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { API_URL } from '@/constants/api';

export default function SubscriberDashboardScreen() {
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboard = async () => {
        try {
            const stored = await AsyncStorage.getItem('userData');
            if (!stored) {
                router.replace('/(auth)');
                return;
            }
            const user = JSON.parse(stored);
            setUserData(user);

            const response = await fetch(`${API_URL}/subscriber/dashboard/user/${user.id}`);
            const data = await response.json();

            if (data.success && data.beneficiaries) {
                setBeneficiaries(data.beneficiaries);
            }
        } catch (e) {
            console.error("Dashboard fetch error:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchDashboard(); }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboard();
    };

    if (loading || !userData) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FE6700" />
            </SafeAreaView>
        );
    }

    const renderEmptyState = () => (
        <View style={styles.emptyStateContainer}>
            <View style={styles.welcomeCard}>

                <View style={styles.iconCircleContainer}>
                    <View style={styles.personIconCircle}>
                        <Ionicons name="person-add-outline" size={32} color="#FE6700" />
                    </View>
                    <View style={styles.heartBadge}>
                        <Ionicons name="heart" size={12} color="#FFFFFF" />
                    </View>
                </View>

                <Text style={styles.welcomeTitle}>Welcome to SeniorCare!</Text>
                <Text style={styles.welcomeSubtitle}>
                    Start your journey by adding your first beneficiary. Provide them with professional care, companionship, and peace of mind.
                </Text>

                <View style={styles.featureBox}>
                    <View style={styles.featureIconBox}>
                        <Ionicons name="shield-checkmark-outline" size={20} color="#FE6700" />
                    </View>
                    <View style={styles.featureTextContainer}>
                        <Text style={styles.featureTitle}>Professional Care</Text>
                        <Text style={styles.featureDesc}>Trained care companions for daily support and health monitoring</Text>
                    </View>
                </View>

                <View style={styles.featureBox}>
                    <View style={styles.featureIconBox}>
                        <Ionicons name="heart-outline" size={20} color="#FE6700" />
                    </View>
                    <View style={styles.featureTextContainer}>
                        <Text style={styles.featureTitle}>Emotional Wellbeing</Text>
                        <Text style={styles.featureDesc}>Regular companionship and happiness tracking for your loved ones</Text>
                    </View>
                </View>

                <View style={styles.featureBox}>
                    <View style={styles.featureIconBox}>
                        <Ionicons name="time-outline" size={20} color="#FE6700" />
                    </View>
                    <View style={styles.featureTextContainer}>
                        <Text style={styles.featureTitle}>24/7 Monitoring</Text>
                        <Text style={styles.featureDesc}>Stay updated with real-time health vitals and activity reports</Text>
                    </View>
                </View>

                {/* The WhatsApp floating button embedded roughly around bottom right of card */}
                <TouchableOpacity style={styles.fabWhatsappEmpty}>
                    <MaterialCommunityIcons name="whatsapp" size={26} color="#FFFFFF" />
                </TouchableOpacity>

            </View>

            <TouchableOpacity
                style={styles.addFirstBtn}
                activeOpacity={0.8}
                onPress={() => router.push('/(setup)/subscribe-form')}
            >
                <Ionicons name="person-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.addFirstBtnText}>Add Your First Beneficiary</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 4, marginTop: 1 }} />
            </TouchableOpacity>
        </View>
    );

    const renderBeneficiaries = () => (
        <View style={{ flex: 1 }}>
            {beneficiaries.map((b, index) => (
                <View key={b.id || index.toString()}>
                    {/* Beneficiary Card */}
                    <TouchableOpacity
                        style={styles.beneficiaryCard}
                        activeOpacity={0.9}
                        onPress={() => router.push(`/(subscriber)/beneficiary-profile?id=${b.id}`)}
                    >
                        <View style={styles.bCardTop}>
                            <Image source={{ uri: b.photo || 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.bPhotoUrl} />
                            <View style={styles.bCardDetails}>
                                <Text style={styles.bCardName}>{b.name}</Text>
                                <Text style={styles.bCardMeta}>{b.age} years • {b.relationship || 'Relative'}</Text>

                                <View style={styles.statusBadgeRow}>
                                    <View style={styles.statusBadge}>
                                        <Ionicons name="heart-outline" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                                        <Text style={styles.statusBadgeText}>{b.status || 'Beneficiary Added'}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.activePackageBox}>
                            <Text style={styles.activePackageLabel}>Active Package</Text>
                            <Text style={styles.activePackageValue}>{b.activePlan || 'Premium Care Plan'}</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Tracker Card */}
                    <View style={styles.trackerCard}>
                        <View style={styles.trackerHeaderRow}>
                            <View style={styles.trackerIconCirc}>
                                <Ionicons name="heart-outline" size={20} color="#FFFFFF" />
                            </View>
                            <Text style={styles.trackerHeaderTitle}>
                                Welcome! Your beneficiary has been added successfully
                            </Text>
                        </View>
                        <Text style={styles.trackerSubTitle}>
                            Your care companion will be assigned shortly. You'll receive updates on visits, health monitoring, and daily activities.
                        </Text>

                        <View style={styles.stepsContainer}>
                            <View style={styles.stepBox}>
                                <View style={styles.stepTitleRow}>
                                    <Ionicons name="shield-checkmark-outline" size={16} color="#FE6700" style={{ marginRight: 6 }} />
                                    <Text style={styles.stepSubtitleText}>Step 1</Text>
                                </View>
                                <Text style={styles.stepTitleText}>Companion Assignment</Text>
                                <Text style={styles.stepDescText}>Within 24 hours</Text>
                            </View>

                            <View style={styles.stepBox}>
                                <View style={styles.stepTitleRow}>
                                    <Ionicons name="people-outline" size={16} color="#FE6700" style={{ marginRight: 6 }} />
                                    <Text style={styles.stepSubtitleText}>Step 2</Text>
                                </View>
                                <Text style={styles.stepTitleText}>First Visit</Text>
                                <Text style={styles.stepDescText}>Scheduled soon</Text>
                            </View>

                            <View style={styles.stepBox}>
                                <View style={styles.stepTitleRow}>
                                    <Ionicons name="time-outline" size={16} color="#FE6700" style={{ marginRight: 6 }} />
                                    <Text style={styles.stepSubtitleText}>Step 3</Text>
                                </View>
                                <Text style={styles.stepTitleText}>Regular Care</Text>
                                <Text style={styles.stepDescText}>Ongoing support</Text>
                            </View>
                        </View>
                    </View>
                </View>
            ))}
            <TouchableOpacity style={styles.fabWhatsapp}>
                <MaterialCommunityIcons name="whatsapp" size={32} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Dashboard</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.notificationIcon}>
                        <Ionicons name="notifications-outline" size={26} color="#111827" />
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>2</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/(subscriber)/profile')}>
                        <Ionicons name="menu-outline" size={32} color="#111827" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FE6700']} />}
            >
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Your Beneficiaries</Text>
                    {beneficiaries.length > 0 && (
                        <TouchableOpacity
                            style={styles.addBtnContainer}
                            onPress={() => router.push('/(setup)/subscribe-form')}
                        >
                            <Text style={styles.addBtnText}>+ Add Beneficiary</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {beneficiaries.length === 0 ? renderEmptyState() : renderBeneficiaries()}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FAF5F0' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF5F0' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 20 : 10, paddingBottom: 16,
        backgroundColor: '#FFFFFF',
    },
    headerTitle: { fontSize: 18, fontWeight: '500', color: '#111827' },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    notificationIcon: { marginRight: 20, position: 'relative' },
    badge: {
        position: 'absolute', top: -3, right: -4, backgroundColor: '#FE6700',
        borderRadius: 10, width: 16, height: 16, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#FFF'
    },
    badgeText: { color: '#FFF', fontSize: 9, fontWeight: '700' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 24, flexGrow: 1 },

    sectionHeaderRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20
    },
    sectionTitle: { fontSize: 18, fontWeight: '500', color: '#111827' },
    addBtnContainer: { backgroundColor: '#FE6700', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
    addBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

    // Empty State Styles
    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
    },
    welcomeCard: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, width: '100%', marginBottom: 20,
        position: 'relative',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
            android: { elevation: 2 },
        }),
    },
    iconCircleContainer: {
        alignItems: 'center', marginBottom: 20, position: 'relative', alignSelf: 'center'
    },
    personIconCircle: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF5ED',
        justifyContent: 'center', alignItems: 'center'
    },
    heartBadge: {
        position: 'absolute', top: 0, right: -4, width: 28, height: 28, borderRadius: 14,
        backgroundColor: '#FE6700', justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#FFF'
    },
    welcomeTitle: {
        fontSize: 20, fontWeight: '600', color: '#111827', textAlign: 'center', marginBottom: 8
    },
    welcomeSubtitle: {
        fontSize: 14, color: '#4B5563', textAlign: 'center', lineHeight: 22, marginBottom: 24
    },
    featureBox: {
        flexDirection: 'row', backgroundColor: '#FFF5ED', borderRadius: 12, padding: 16, marginBottom: 12,
        alignItems: 'center'
    },
    featureIconBox: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF',
        justifyContent: 'center', alignItems: 'center', marginRight: 16
    },
    featureTextContainer: { flex: 1 },
    featureTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 },
    featureDesc: { fontSize: 12, color: '#6B7280', lineHeight: 18 },

    addFirstBtn: {
        backgroundColor: '#FE6700', borderRadius: 8, paddingVertical: 16, paddingHorizontal: 20,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%'
    },
    addFirstBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    fabWhatsappEmpty: {
        position: 'absolute', bottom: -15, right: 15,
        width: 46, height: 46, borderRadius: 23, backgroundColor: '#25D366',
        justifyContent: 'center', alignItems: 'center', zIndex: 10,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
            android: { elevation: 6 },
        }),
    },

    // Populated state
    beneficiaryCard: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 20,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
            android: { elevation: 2 },
        }),
    },
    bCardTop: { flexDirection: 'row', marginBottom: 16 },
    bPhotoUrl: { width: 64, height: 64, borderRadius: 32, marginRight: 16, backgroundColor: '#E5E7EB' },
    bCardDetails: { flex: 1, justifyContent: 'center' },
    bCardName: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 2 },
    bCardMeta: { fontSize: 13, color: '#4B5563', marginBottom: 8 },
    statusBadgeRow: { flexDirection: 'row' },
    statusBadge: {
        backgroundColor: '#FE6700', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
        flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start'
    },
    statusBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '500' },
    activePackageBox: {
        backgroundColor: '#F9FAFB', borderRadius: 8, padding: 12, marginTop: 4
    },
    activePackageLabel: { fontSize: 11, color: '#6B7280', marginBottom: 2 },
    activePackageValue: { fontSize: 14, fontWeight: '500', color: '#111827' },

    trackerCard: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
            android: { elevation: 2 },
        }),
    },
    trackerHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingRight: 20 },
    trackerIconCirc: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#FE6700',
        justifyContent: 'center', alignItems: 'center', marginRight: 16
    },
    trackerHeaderTitle: { fontSize: 15, fontWeight: '500', color: '#111827', flex: 1, lineHeight: 20 },
    trackerSubTitle: { fontSize: 13, color: '#4B5563', lineHeight: 20, marginBottom: 20 },
    stepsContainer: { paddingVertical: 4 },
    stepBox: {
        borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 8, padding: 16, marginBottom: 12
    },
    stepTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    stepSubtitleText: { fontSize: 12, color: '#4B5563', fontWeight: '500' },
    stepTitleText: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 },
    stepDescText: { fontSize: 12, color: '#9CA3AF' },

    fabWhatsapp: {
        position: 'absolute', bottom: 24, right: 24,
        width: 56, height: 56, borderRadius: 28, backgroundColor: '#25D366',
        justifyContent: 'center', alignItems: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
            android: { elevation: 6 },
        }),
    }
});
