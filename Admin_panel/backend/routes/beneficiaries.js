const express = require('express');
const router = express.Router();
const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '../../../backend/node_modules/@prisma/client'));

const prisma = new PrismaClient();

// ── GET /api/beneficiaries ───────────────────────────────────────────────────
// Fetches all beneficiaries from the beneficiary table
router.get('/', async (req, res) => {
    try {
        const beneficiaries = await prisma.beneficiary.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                subscriber: {
                    select: { name: true, phone: true, email: true }
                },
                primaryCC: {
                    select: { name: true, zone: true }
                },
                secondaryCC: {
                    select: { name: true, zone: true }
                },
                fieldManager: {
                    select: { name: true }
                }
            }
        });

        // Fetch active subscriptions separately since relation isn't in schema
        const beneficiaryIds = beneficiaries.map(b => b.id);
        const subscriptions = await prisma.subscription.findMany({
            where: { beneficiaryId: { in: beneficiaryIds }, isActive: true },
            include: { package: { select: { name: true } } }
        });
        
        // Create a map for fast lookup
        const subMap = {};
        subscriptions.forEach(s => {
            if (!subMap[s.beneficiaryId]) subMap[s.beneficiaryId] = s;
        });

        const mapped = beneficiaries.map(b => {
            const activeSub = subMap[b.id];
            return {
                id: b.id,
            userId: b.userId,
            name: b.name,
            photo: b.photo,
            age: b.age,
            gender: b.gender,
            address: b.address,
            medicalConditions: b.medicalConditions || [],
            medications: b.medications || [],
            emotionalScore: b.emotionalScore,
            emergencyContacts: b.emergencyContacts,
            subscriberId: b.subscriberId,
            subscriberName: b.subscriber?.name || null,
            subscriberPhone: b.subscriber?.phone || null,
            careCompanion: b.primaryCC?.name || null, // Note: Prisma relation is strictly "primaryCC" (cc uppercase)
            careCompanionZone: b.primaryCC?.zone || null,
            secondaryCareCompanion: b.secondaryCC?.name || null,
            fieldManager: b.fieldManager?.name || null,
            activePackage: activeSub?.package?.name || null,
            createdAt: b.createdAt,
        };
    });

        res.json({ success: true, data: mapped, total: mapped.length });
    } catch (err) {
        console.error('GET /beneficiaries error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch beneficiaries' });
    }
});

// ── GET /api/beneficiaries/:id ───────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const b = await prisma.beneficiary.findUnique({
            where: { id: req.params.id },
            include: {
                subscriber: true,
                primaryCC: true,
                secondaryCC: true,
                fieldManager: true,
                visits: { orderBy: { scheduledTime: 'desc' }, take: 5 }
            }
        });
        if (!b) return res.status(404).json({ success: false, message: 'Beneficiary not found' });
        
        // Fetch active subscription separately
        const sub = await prisma.subscription.findFirst({
            where: { beneficiaryId: b.id, isActive: true },
            include: { package: true }
        });
        
        res.json({ success: true, data: { ...b, subscriptions: sub ? [sub] : [] } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
