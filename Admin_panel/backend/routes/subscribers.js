const express = require('express');
const router = express.Router();
const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '../../../backend/node_modules/@prisma/client'));

const prisma = new PrismaClient();

// ── GET /api/subscribers ─────────────────────────────────────────────────────
// Fetches all users with role = 'subscriber' and their linked beneficiaries
router.get('/', async (req, res) => {
    try {
        const subscribers = await prisma.user.findMany({
            where: { role: 'subscriber' },
            orderBy: { createdAt: 'desc' },
            include: {
                subscriberBeneficiaries: {
                    select: { id: true, name: true, age: true }
                }
            }
        });

        // Fetch subscriptions separately mapped by subscriber
        const subscriberIds = subscribers.map(s => s.id);
        const subscriptions = await prisma.subscription.findMany({
            where: { subscriberId: { in: subscriberIds }, isActive: true },
            include: { package: { select: { name: true, type: true } } }
        });

        const subMap = {};
        subscriptions.forEach(s => {
            if (!subMap[s.subscriberId]) subMap[s.subscriberId] = s;
        });

        const mapped = subscribers.map(s => {
            const activeSub = subMap[s.id];
            return {
            id: s.id,
            name: s.name,
            phone: s.phone,
            email: s.email || null,
            address: s.address || null,
            isActive: s.isActive,
            createdAt: s.createdAt,
            beneficiaryCount: s.subscriberBeneficiaries?.length || 0,
            beneficiaries: s.subscriberBeneficiaries || [],
            activePackage: activeSub?.package?.name || null,
            subscriptionType: activeSub?.package?.type || null,
        };
    });

        res.json({ success: true, data: mapped, total: mapped.length });
    } catch (err) {
        console.error('GET /subscribers error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch subscribers' });
    }
});

// ── GET /api/subscribers/:id ─────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const s = await prisma.user.findUnique({
            where: { id: req.params.id, role: 'subscriber' },
            include: {
                subscriberBeneficiaries: true,
            }
        });
        if (!s) return res.status(404).json({ success: false, message: 'Subscriber not found' });
        
        // Fetch active subscription separately
        const sub = await prisma.subscription.findFirst({
            where: { subscriberId: s.id, isActive: true },
            include: { package: true }
        });

        res.json({ success: true, data: { ...s, beneficiaries: s.subscriberBeneficiaries, subscriptions: sub ? [sub] : [] } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
