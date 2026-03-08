import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function CompanionBottomNav() {
    const router = useRouter();

    return (
        <View style={styles.bottomTabBar}>
            <TouchableOpacity style={styles.tabItem}>
                <Ionicons name="home" size={24} color="#EA580C" />
                <Text style={[styles.tabText, { color: '#EA580C' }]}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabItem}>
                <Ionicons name="calendar-outline" size={24} color="#9CA3AF" />
                <Text style={styles.tabText}>Schedule</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabItem}>
                <Ionicons name="pulse-outline" size={24} color="#9CA3AF" />
                <Text style={styles.tabText}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/(care-companion)/profile')}>
                <Ionicons name="person-outline" size={24} color="#9CA3AF" />
                <Text style={styles.tabText}>Profile</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    bottomTabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: Platform.OS === 'ios' ? 85 : 70,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderColor: '#F3F4F6',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    tabItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    tabText: { fontSize: 11, marginTop: 4, fontWeight: '600', color: '#9CA3AF' }
});
