import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logoutWithConfirm } from '../../utils/logout';

import { API_URL } from '@/constants/api';

export default function ProfileScreen() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [toggles, setToggles] = useState({
        reminders: true,
        celebrations: true,
        training: false,
        geofence: true
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userStr = await AsyncStorage.getItem('userData');
                if (!userStr) {
                    router.replace('/(auth)');
                    return;
                }
                const user = JSON.parse(userStr);
                const token = await AsyncStorage.getItem('userToken');

                const response = await fetch(`${API_URL}/admin/users/companion-profile/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();

                if (data.success) {
                    setProfile(data.data);
                } else {
                    console.error("Failed to load profile", data.message);
                }
            } catch (err) {
                console.error("Error fetching profile", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleLogout = () => logoutWithConfirm();

    if (loading || !profile) {
        return (
            <SafeAreaView style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#F97316" />
            </SafeAreaView>
        );
    }

    const initials = profile.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
    const joinedStr = new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>

                {/* Orange Header Background */}
                <View style={styles.orangeHeader}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.headerTitle}>Profile</Text>
                            <Text style={styles.headerSub}>Manage your account</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.cardsWrapper}>
                    {/* Main Profile Info Card */}
                    <View style={[styles.card, styles.profileCard]}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarInitials}>{initials}</Text>
                            </View>
                            <View style={styles.cameraIconBadge}>
                                <Ionicons name="camera-outline" size={14} color="#F97316" />
                            </View>
                        </View>

                        <Text style={styles.name}>{profile.name}</Text>
                        <Text style={styles.role}>Care Companion</Text>

                        {profile.verified && (
                            <View style={styles.verifiedRow}>
                                <Ionicons name="shield-checkmark-outline" size={16} color="#10B981" />
                                <Text style={styles.verifiedText}>Verified</Text>
                            </View>
                        )}

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Ionicons name="mail-outline" size={18} color="#4B5563" />
                            <Text style={styles.infoText}>{profile.email || "N/A"}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="call-outline" size={18} color="#4B5563" />
                            <Text style={styles.infoText}>{profile.phone}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={18} color="#4B5563" />
                            <Text style={styles.infoText}>{profile.location}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="calendar-outline" size={18} color="#4B5563" />
                            <Text style={styles.infoText}>Member since {joinedStr}</Text>
                        </View>
                    </View>

                    {/* Notifications Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeaderRow}>
                            <Ionicons name="notifications-outline" size={22} color="#111827" />
                            <Text style={styles.cardHeaderTitle}>Notifications</Text>
                        </View>

                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Visit Reminders</Text>
                            <Switch
                                value={toggles.reminders}
                                onValueChange={v => setToggles({ ...toggles, reminders: v })}
                                trackColor={{ false: '#D1D5DB', true: '#1F2937' }}
                            />
                        </View>
                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Celebration Alerts</Text>
                            <Switch
                                value={toggles.celebrations}
                                onValueChange={v => setToggles({ ...toggles, celebrations: v })}
                                trackColor={{ false: '#D1D5DB', true: '#1F2937' }}
                            />
                        </View>
                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Training Updates</Text>
                            <Switch
                                value={toggles.training}
                                onValueChange={v => setToggles({ ...toggles, training: v })}
                                trackColor={{ false: '#D1D5DB', true: '#1F2937' }}
                            />
                        </View>
                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Geofence Alerts</Text>
                            <Switch
                                value={toggles.geofence}
                                onValueChange={v => setToggles({ ...toggles, geofence: v })}
                                trackColor={{ false: '#D1D5DB', true: '#1F2937' }}
                            />
                        </View>
                    </View>

                    {/* Settings Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeaderRow}>
                            <Ionicons name="settings-outline" size={22} color="#111827" />
                            <Text style={styles.cardHeaderTitle}>Settings</Text>
                        </View>

                        <TouchableOpacity style={styles.settingsLinkBtn}>
                            <Ionicons name="person-outline" size={18} color="#111827" />
                            <Text style={styles.settingsLinkText}>Edit Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.settingsLinkBtn}>
                            <Ionicons name="shield-checkmark-outline" size={18} color="#111827" />
                            <Text style={styles.settingsLinkText}>Privacy & Security</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.settingsLinkBtn}>
                            <Ionicons name="options-outline" size={18} color="#111827" />
                            <Text style={styles.settingsLinkText}>App Preferences</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Your Impact Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardHeaderTitleStringOnly}>Your Impact</Text>
                        <View style={styles.impactGrid}>
                            <View style={styles.impactBox}>
                                <Text style={styles.impactNumber}>{profile.stats.totalVisits}</Text>
                                <Text style={styles.impactLabel}>Total Visits</Text>
                            </View>
                            <View style={styles.impactBox}>
                                <Text style={styles.impactNumber}>{profile.stats.hours}</Text>
                                <Text style={styles.impactLabel}>Hours</Text>
                            </View>
                            <View style={styles.impactBox}>
                                <Text style={styles.impactNumber}>{profile.stats.clients}</Text>
                                <Text style={styles.impactLabel}>Clients</Text>
                            </View>
                        </View>
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity style={styles.logoutOutlineBtn} onPress={logoutWithConfirm}>
                        <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                        <Text style={styles.logoutOutlineText}>Logout</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAF3EB' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF3EB' },
    orangeHeader: {
        backgroundColor: '#FA6B0D',
        paddingTop: Platform.OS === 'ios' ? 70 : 60,
        paddingBottom: 60,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
    backButton: { marginRight: 16 },
    headerTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
    headerSub: { color: '#FFEDD5', fontSize: 14, marginTop: 2 },

    scrollContent: { paddingBottom: 100 },
    cardsWrapper: { paddingHorizontal: 16 },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    profileCard: {
        marginTop: -40, // overlap with header
        alignItems: 'center',
    },

    avatarContainer: { position: 'relative', marginBottom: 16 },
    avatarCircle: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: '#EF4444',
        alignItems: 'center', justifyContent: 'center'
    },
    avatarInitials: { color: '#FFFFFF', fontSize: 24, fontWeight: '600' },
    cameraIconBadge: {
        position: 'absolute', bottom: 0, right: 0,
        backgroundColor: '#FFFFFF', width: 28, height: 28,
        borderRadius: 14, alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#FFFFFF',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2
    },

    name: { fontSize: 22, fontWeight: '700', color: '#111827' },
    role: { fontSize: 15, color: '#4B5563', marginTop: 4 },
    verifiedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    verifiedText: { color: '#10B981', fontSize: 13, fontWeight: '600', marginLeft: 4 },

    divider: { height: 1, backgroundColor: '#F3F4F6', width: '100%', marginVertical: 20 },

    infoRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 14 },
    infoText: { marginLeft: 12, fontSize: 14, color: '#374151' },

    cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    cardHeaderTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginLeft: 10 },
    cardHeaderTitleStringOnly: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 20 },

    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    switchLabel: { fontSize: 15, color: '#111827' },

    settingsLinkBtn: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: '#E5E7EB',
        padding: 16, borderRadius: 12, marginBottom: 12
    },
    settingsLinkText: { marginLeft: 12, fontSize: 15, fontWeight: '500', color: '#111827' },

    impactGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    impactBox: { alignItems: 'center', flex: 1 },
    impactNumber: { fontSize: 28, fontWeight: '700', color: '#F97316' },
    impactLabel: { fontSize: 13, color: '#4B5563', marginTop: 8 },

    logoutOutlineBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#DC2626',
        borderRadius: 12, paddingVertical: 16,
        marginVertical: 8, backgroundColor: '#FEF2F2'
    },
    logoutOutlineText: { color: '#DC2626', fontSize: 16, fontWeight: '600', marginLeft: 10 }
});
