import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { GlobalHeader } from '../../components/GlobalHeader';

type PlanDuration = 'basic' | '6months' | 'annual';

const API_URL = Platform.OS === "android" ? "http://10.0.2.2:8000/api" : "http://localhost:8000/api";

export default function SubscriptionPackagesScreen() {
    const router = useRouter();
    const [activeDuration, setActiveDuration] = useState<PlanDuration>('basic');
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await fetch(`${API_URL}/subscriptions/packages`);
                const json = await response.json();
                if (json.success) {
                    setPackages(json.data);
                }
            } catch (err) {
                console.error('Failed to fetch packages:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    const handleSelectPackage = (packageId: string) => {
        // We pass the package "type" (e.g. silver/gold) directly to the subscribe form
        router.push({
            pathname: '/(setup)/subscribe-form',
            params: { packageId }
        });
    };

    const getPrice = (pkg: any) => {
        if (activeDuration === '6months') {
            return Math.round(pkg.price * 6 * (1 - pkg.discountSixMonths / 100));
        } else if (activeDuration === 'annual') {
            return Math.round(pkg.price * 12 * (1 - pkg.discountAnnual / 100));
        }
        return pkg.price;
    };

    const getDurationText = () => {
        if (activeDuration === '6months') return '6 months';
        if (activeDuration === 'annual') return '12 months';
        return '30 days';
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <GlobalHeader title="Subscription Packages" />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#F97316" />
                </View>
            </SafeAreaView>
        );
    }

    const discount6m = packages[0]?.discountSixMonths || 10;
    const discountAnnual = packages[0]?.discountAnnual || 20;

    return (
        <SafeAreaView style={styles.safeArea}>
            <GlobalHeader title="Subscription Packages" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Back navigation */}
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                    <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#111827' }}>Subscription Packages</Text>
                </TouchableOpacity>

                <View style={styles.headerArea}>
                    <Text style={styles.mainTitle}>Choose the Right Care for Your Loved Ones</Text>
                    <Text style={styles.subTitle}>Personalized plans designed for peace of mind.</Text>
                </View>

                {/* Segmented Toggle Control */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, activeDuration === 'basic' && styles.toggleBtnActive]}
                        onPress={() => setActiveDuration('basic')}
                    >
                        <Text style={[styles.toggleText, activeDuration === 'basic' && styles.toggleTextActive]}>Monthly</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toggleBtn, activeDuration === '6months' && styles.toggleBtnActive]}
                        onPress={() => setActiveDuration('6months')}
                    >
                        <Text style={[styles.toggleText, activeDuration === '6months' && styles.toggleTextActive]}>6 Months</Text>
                        <Text style={styles.discountText}>-{discount6m}% off</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toggleBtn, activeDuration === 'annual' && styles.toggleBtnActive]}
                        onPress={() => setActiveDuration('annual')}
                    >
                        <Text style={[styles.toggleText, activeDuration === 'annual' && styles.toggleTextActive]}>Annual</Text>
                        <Text style={styles.discountText}>-{discountAnnual}% off</Text>
                    </TouchableOpacity>
                </View>

                {/* Dynamic DB Driven Cards */}
                {packages.map((pkg: any) => {
                    const isPopular = pkg.type === 'gold';

                    return (
                        <View key={pkg.id} style={[styles.card, isPopular && styles.popularCard]}>
                            {isPopular && (
                                <View style={styles.popularBadge}>
                                    <Ionicons name="star" size={12} color="#FFF" style={{ marginRight: 4 }} />
                                    <Text style={styles.popularBadgeText}>Most Popular</Text>
                                </View>
                            )}

                            <View style={styles.cardHeaderRow}>
                                <View>
                                    <Text style={styles.planName}>{pkg.name}</Text>
                                    <Text style={isPopular ? styles.planPriceColor : styles.planPrice}>
                                        ₹{getPrice(pkg).toLocaleString('en-IN')}
                                    </Text>
                                    <Text style={styles.planDuration}>{getDurationText()}</Text>
                                </View>
                                <View style={isPopular ? styles.iconCirclePremium : styles.iconCircleBasic}>
                                    <Ionicons
                                        name={isPopular ? "heart-circle-outline" : "shield-checkmark-outline"}
                                        size={isPopular ? 36 : 32}
                                        color="#F97316"
                                    />
                                </View>
                            </View>

                            <Text style={styles.hoursText}>{pkg.visitsPerWeek * 10} hours/month</Text>

                            <View style={styles.featureList}>
                                {pkg.features.map((feature: string, fIdx: number) => (
                                    <View key={fIdx} style={styles.featureRow}>
                                        <Ionicons name="checkmark-circle" size={16} color="#F97316" />
                                        <Text style={styles.featureText}>{feature}</Text>
                                    </View>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={isPopular ? styles.selectBtnSolid : styles.selectBtnOutline}
                                onPress={() => handleSelectPackage(pkg.type)}
                            >
                                <Text style={isPopular ? styles.selectBtnSolidText : styles.selectBtnOutlineText}>
                                    Select Package
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFF5ED' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

    backBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 20 },
    headerArea: { marginBottom: 24 },
    mainTitle: { fontSize: 24, fontWeight: '800', color: '#111827', lineHeight: 32, marginBottom: 8 },
    subTitle: { fontSize: 14, color: '#4B5563' },

    toggleContainer: {
        flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 30, padding: 4,
        marginBottom: 30, borderWidth: 1, borderColor: '#FDE6D5', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4
    },
    toggleBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 26 },
    toggleBtnActive: { backgroundColor: '#F97316' },
    toggleText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
    toggleTextActive: { color: '#FFFFFF' },
    discountText: { fontSize: 9, color: '#9CA3AF', marginTop: 2 },

    card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    planName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
    planPrice: { fontSize: 32, fontWeight: '800', color: '#111827' },
    planPriceColor: { fontSize: 32, fontWeight: '800', color: '#F97316' },
    planDuration: { fontSize: 12, color: '#9CA3AF' },

    iconCircleBasic: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
    iconCirclePremium: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFEBE0', alignItems: 'center', justifyContent: 'center' },

    hoursText: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 16 },

    featureList: { marginBottom: 24 },
    featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    featureText: { fontSize: 13, color: '#4B5563', marginLeft: 8 },

    selectBtnOutline: { borderWidth: 1, borderColor: '#F97316', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
    selectBtnOutlineText: { color: '#F97316', fontSize: 15, fontWeight: '600' },

    popularCard: { borderWidth: 2, borderColor: '#F97316', position: 'relative', marginTop: 20 },
    popularBadge: {
        position: 'absolute', top: -14, left: '50%', transform: [{ translateX: -50 }],
        backgroundColor: '#F97316', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, flexDirection: 'row', alignItems: 'center'
    },
    popularBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
    selectBtnSolid: { backgroundColor: '#F97316', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
    selectBtnSolidText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' }
});
