import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CompanionHeader } from '../../components/care-companion/CompanionHeader';
import { CompanionBottomNav } from '../../components/care-companion/CompanionBottomNav';

export default function CareCompanionDashboard() {
    // Replace with actual data fetch later
    const userName = "Sarah";

    return (
        <View style={styles.container}>
            <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>

                {/* Extracted Header Component */}
                <CompanionHeader userName={userName} />

                {/* Soft Beige Content Area */}
                <View style={styles.contentArea}>

                    {/* Top Numeric Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <View>
                                <Text style={styles.statLabel}>Today's Visits</Text>
                                <Text style={styles.statValue}>2</Text>
                            </View>
                            <View style={[styles.statIconBadge, { backgroundColor: '#FFF7ED' }]}>
                                <Ionicons name="calendar-outline" size={24} color="#EA580C" />
                            </View>
                        </View>

                        <View style={styles.statCard}>
                            <View>
                                <Text style={styles.statLabel}>Hours Today</Text>
                                <Text style={styles.statValue}>4.5</Text>
                            </View>
                            <View style={[styles.statIconBadge, { backgroundColor: '#FDF2F8' }]}>
                                <Ionicons name="time-outline" size={24} color="#DB2777" />
                            </View>
                        </View>
                    </View>

                    {/* Next Visit Prominent Card */}
                    <View style={styles.mainCard}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="notifications-outline" size={20} color="#EA580C" style={{ marginRight: 8 }} />
                            <Text style={styles.cardSectionTitle}>Next Visit</Text>
                        </View>

                        <View style={styles.visitDetailsHeader}>
                            <Text style={styles.patientName}>Sameer Tandon</Text>
                            <View style={styles.tagBadge}>
                                <Text style={styles.tagText}>Home Visit</Text>
                            </View>
                        </View>

                        <Text style={styles.addressText}>123 Oak Street, Apt 4B</Text>

                        <View style={styles.visitMetaRow}>
                            <View style={styles.metaItem}>
                                <Ionicons name="time-outline" size={16} color="#6B7280" />
                                <Text style={styles.metaText}>10:00 AM</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Ionicons name="location-outline" size={16} color="#6B7280" />
                                <Text style={styles.metaText}>2.3 km</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.startVisitBtn}>
                            <Text style={styles.startVisitBtnText}>Start Visit</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Quick Actions 2x2 Grid */}
                    <View style={styles.mainCardInnerTransparent}>
                        <Text style={[styles.cardSectionTitle, { marginBottom: 16 }]}>Quick Actions</Text>

                        <View style={styles.quickActionsGrid}>
                            <TouchableOpacity style={styles.quickActionBox}>
                                <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
                                <Text style={styles.quickActionText}>Schedule</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.quickActionBox}>
                                <Ionicons name="pulse-outline" size={24} color="#10B981" />
                                <Text style={styles.quickActionText}>History</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.quickActionBox}>
                                <MaterialCommunityIcons name="cake-variant-outline" size={24} color="#EC4899" />
                                <Text style={styles.quickActionText}>Celebrations</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.quickActionBox}>
                                <Ionicons name="school-outline" size={24} color="#F97316" />
                                <Text style={styles.quickActionText}>Training</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Upcoming Celebrations List */}
                    <View style={styles.mainCard}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="cake-variant-outline" size={22} color="#EA580C" style={{ marginRight: 8 }} />
                            <Text style={styles.cardSectionTitle}>Upcoming Celebrations</Text>
                        </View>

                        <View style={styles.celebrationRow}>
                            <View>
                                <Text style={styles.celebrantName}>Sameer Tandon</Text>
                                <Text style={styles.celebrationType}>Birthday</Text>
                            </View>
                            <View style={styles.dateChip}>
                                <Text style={styles.dateChipText}>Mar 10, 2026</Text>
                            </View>
                        </View>

                        <View style={[styles.celebrationRow, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
                            <View>
                                <Text style={styles.celebrantName}>Eleanor Davis</Text>
                                <Text style={styles.celebrationType}>Anniversary</Text>
                            </View>
                            <View style={styles.dateChip}>
                                <Text style={styles.dateChipText}>Mar 11, 2026</Text>
                            </View>
                        </View>
                    </View>

                    {/* Invisible Spacer so content scrolls fully above absolute tab bar */}
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* Extracted Bottom Nav */}
            <CompanionBottomNav />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAF3EB' },
    scrollContent: { flexGrow: 1 },
    contentArea: { paddingHorizontal: 20, paddingTop: 20 },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    statCard: {
        backgroundColor: '#FFFFFF',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginHorizontal: 5,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
    },
    statLabel: { fontSize: 13, color: '#4B5563', marginBottom: 4 },
    statValue: { fontSize: 24, fontWeight: '800', color: '#111827' },
    statIconBadge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

    mainCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
    },
    mainCardInnerTransparent: { marginBottom: 20 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    cardSectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },

    visitDetailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    patientName: { fontSize: 20, fontWeight: '800', color: '#111827' },
    tagBadge: { backgroundColor: '#FA6B0D', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    tagText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

    addressText: { color: '#4B5563', fontSize: 14, marginBottom: 16 },

    visitMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
    metaText: { color: '#4B5563', marginLeft: 6, fontSize: 13, fontWeight: '500' },

    startVisitBtn: { backgroundColor: '#FA6B0D', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
    startVisitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

    quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    quickActionBox: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 16,
        paddingVertical: 20,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1,
    },
    quickActionText: { color: '#111827', fontSize: 14, fontWeight: '700', marginTop: 10 },

    celebrationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, marginBottom: 16, borderBottomWidth: 1, borderColor: '#F3F4F6' },
    celebrantName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
    celebrationType: { fontSize: 14, color: '#6B7280' },
    dateChip: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
    dateChipText: { fontSize: 12, color: '#374151', fontWeight: '600' },
});
