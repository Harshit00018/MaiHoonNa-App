import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    ActivityIndicator, TouchableOpacity, RefreshControl, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { GlobalHeader } from '../../components/GlobalHeader';

const API_URL = Platform.OS === "android" ? "http://10.0.2.2:8000/api" : "http://localhost:8000/api";

export default function DashboardScreen() {
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'Subscriber' | 'Beneficiary' | 'Care Companion'>('Subscriber');

    const fetchDashboard = async () => {
        try {
            const stored = await AsyncStorage.getItem('userData');
            if (!stored) {
                router.replace('/(auth)');
                return;
            }
            const user = JSON.parse(stored);
            setUserData(user);

            const response = await fetch(`${API_URL}/dashboard/user/${user.id}`);
            const data = await response.json();

            if (data.success) {
                setDashboardData(data);
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
                <ActivityIndicator size="large" color="#F97316" />
            </SafeAreaView>
        );
    }

    // Use real backend data if available, else fallback safely
    const beneficiaries = dashboardData?.beneficiaries || [];

    return (
        <SafeAreaView style={styles.safeArea}>

            {/* Top App Bar handled by Global Component */}
            <GlobalHeader title="Dashboard" />

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                    {['Subscriber', 'Beneficiary', 'Care Companion'].map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                            onPress={() => setActiveTab(tab as any)}
                        >
                            <Ionicons
                                name={tab === 'Subscriber' ? 'person-outline' : tab === 'Beneficiary' ? 'people-outline' : 'heart-outline'}
                                size={16}
                                color={activeTab === tab ? '#FFF' : '#4B5563'}
                                style={{ marginRight: 6 }}
                            />
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F97316']} />}
            >
                {activeTab === 'Subscriber' ? (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Your Beneficiaries</Text>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(setup)/subscribe-form')}>
                                <Text style={styles.actionBtnText}>+ Add Beneficiary</Text>
                            </TouchableOpacity>
                        </View>

                        {/* List Beneficiaries */}
                        {beneficiaries.length > 0 ? (
                            beneficiaries.map((b: any, index: number) => {
                                // Creating mock images + stats based on the backend name/age
                                const imgSource = index % 2 === 0
                                    ? 'https://randomuser.me/api/portraits/men/32.jpg'
                                    : 'https://randomuser.me/api/portraits/women/44.jpg';

                                return (
                                    <View key={b.id} style={styles.beneficiaryCard}>
                                        <Image source={{ uri: imgSource }} style={styles.bPhoto} />
                                        <View style={styles.bDetails}>
                                            <Text style={styles.bName}>{b.name}</Text>
                                            <Text style={styles.bMeta}>{b.age} years • Relative</Text>

                                            {/* Stats Rows */}
                                            <View style={styles.statRow}>
                                                <Text style={styles.statLabel}>Happiness Score</Text>
                                                <Text style={styles.statValue}>85</Text>
                                            </View>
                                            <View style={styles.progressBarBg}>
                                                <View style={[styles.progressBarFill, { width: '85%', backgroundColor: '#F97316' }]} />
                                            </View>

                                            <View style={styles.statRow}>
                                                <Text style={styles.statLabel}>Hours Used</Text>
                                                <Text style={styles.statValue}>65</Text>
                                            </View>
                                            <View style={styles.progressBarBg}>
                                                <View style={[styles.progressBarFill, { width: '65%', backgroundColor: '#111827' }]} />
                                            </View>
                                        </View>
                                    </View>
                                );
                            })
                        ) : (
                            <View style={styles.emptyBox}>
                                <Text style={{ color: '#6B7280' }}>No beneficiaries linked yet.</Text>
                            </View>
                        )}

                        {/* Inbox Section */}
                        <Text style={[styles.sectionTitle, { marginTop: 16, marginBottom: 12 }]}>Inbox</Text>

                        <View style={styles.inboxCard}>
                            {/* Message 1 */}
                            <View style={styles.msgRow}>
                                <Ionicons name="chatbubble-outline" size={20} color="#F97316" style={{ marginTop: 2, marginRight: 12 }} />
                                <View style={{ flex: 1 }}>
                                    <View style={styles.msgHeader}>
                                        <Text style={styles.msgTitle}>Care Companion Update</Text>
                                        <View style={styles.msgBadge}><Text style={styles.msgBadgeTxt}>New</Text></View>
                                    </View>
                                    <Text style={styles.msgTime}>2026-02-14 • 10:00 AM - 11:30 AM</Text>
                                    <Text style={styles.msgBody}>Patient was cheerful and enjoyed the morning walk. Medication taken on time.</Text>
                                </View>
                            </View>

                            <View style={styles.separator} />

                            {/* Message 2 */}
                            <View style={styles.msgRow}>
                                <Ionicons name="chatbubble-outline" size={20} color="#F97316" style={{ marginTop: 2, marginRight: 12 }} />
                                <View style={{ flex: 1 }}>
                                    <View style={styles.msgHeader}>
                                        <Text style={styles.msgTitle}>Care Companion Update</Text>
                                    </View>
                                    <Text style={styles.msgTime}>2026-02-12 • 3:00 PM - 4:30 PM</Text>
                                    <Text style={styles.msgBody}>Enjoyed reading the newspaper together. Completed light stretching.</Text>
                                </View>
                            </View>
                        </View>

                    </>
                ) : (
                    <View style={styles.emptyBox}>
                        <Text style={{ color: '#6B7280' }}>{activeTab} view not accessible for this demo yet.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
    scrollContent: { padding: 20, paddingBottom: 40 },

    tabContainer: { backgroundColor: '#FFFFFF', paddingBottom: 12 },
    tabBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 12 },
    tabBtnActive: { backgroundColor: '#F97316' },
    tabText: { fontSize: 13, color: '#4B5563', fontWeight: '500' },
    tabTextActive: { color: '#FFFFFF' },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    actionBtn: { backgroundColor: '#F97316', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
    actionBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

    beneficiaryCard: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16,
        flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
    },
    bPhoto: { width: 56, height: 56, borderRadius: 28, marginRight: 16, backgroundColor: '#E5E7EB' },
    bDetails: { flex: 1 },
    bName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 2 },
    bMeta: { fontSize: 13, color: '#6B7280', marginBottom: 12 },

    statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, marginTop: 4 },
    statLabel: { fontSize: 12, color: '#4B5563' },
    statValue: { fontSize: 12, fontWeight: '600', color: '#111827' },
    progressBarBg: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, marginBottom: 8, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 3 },

    inboxCard: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
    },
    msgRow: { flexDirection: 'row', marginVertical: 4 },
    msgHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
    msgTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
    msgBadge: { backgroundColor: '#F97316', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    msgBadgeTxt: { color: '#FFF', fontSize: 10, fontWeight: '600' },
    msgTime: { fontSize: 11, color: '#6B7280', marginBottom: 8 },
    msgBody: { fontSize: 13, color: '#4B5563', lineHeight: 20 },
    separator: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },

    emptyBox: { padding: 30, alignItems: 'center', justifyContent: 'center' }
});
