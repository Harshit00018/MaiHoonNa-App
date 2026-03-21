const express = require('express');
const router = express.Router();
const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '../../../backend/node_modules/@prisma/client'));

const prisma = new PrismaClient();

// ── GET /api/zones ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const zones = await prisma.zone.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: zones });
    } catch (err) {
        console.error('GET /zones error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch zones' });
    }
});

// ── GET /api/zones/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const zone = await prisma.zone.findUnique({
            where: { id: req.params.id }
        });
        if (!zone) return res.status(404).json({ success: false, message: 'Zone not found' });
        res.json({ success: true, data: zone });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch zone' });
    }
});

// ── POST /api/zones ────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
    try {
        const {
            name, city, address, state, pincode,
            latitude, longitude, phone,
            leaseStartDate, leaseEndDate,
            fieldManagerId
        } = req.body;

        // Basic validation
        if (!name || !city || !address || !state || !pincode) {
            return res.status(400).json({
                success: false,
                message: 'name, city, address, state, and pincode are required'
            });
        }

        const zone = await prisma.zone.create({
            data: {
                name,
                city,
                address,
                state,
                pincode,
                phone: phone || null,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                leaseStartDate: leaseStartDate ? new Date(leaseStartDate) : null,
                leaseEndDate: leaseEndDate ? new Date(leaseEndDate) : null,
                isActive: true,
                fieldManagerId: fieldManagerId || null,
            }
        });

        res.status(201).json({ success: true, data: zone });
    } catch (err) {
        console.error('POST /zones error:', JSON.stringify(err, null, 2) || err);
        res.status(500).json({ success: false, message: 'Failed to create zone', error: err.message });
    }
});

// ── PUT /api/zones/:id ─────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
    try {
        const {
            name, city, address, state, pincode,
            latitude, longitude, phone,
            leaseStartDate, leaseEndDate, isActive,
            fieldManagerId
        } = req.body;

        const zone = await prisma.zone.update({
            where: { id: req.params.id },
            data: {
                ...(name !== undefined && { name }),
                ...(city !== undefined && { city }),
                ...(address !== undefined && { address }),
                ...(state !== undefined && { state }),
                ...(pincode !== undefined && { pincode }),
                ...(phone !== undefined && { phone }),
                ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
                ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
                ...(leaseStartDate !== undefined && { leaseStartDate: new Date(leaseStartDate) }),
                ...(leaseEndDate !== undefined && { leaseEndDate: new Date(leaseEndDate) }),
                ...(isActive !== undefined && { isActive }),
                ...(fieldManagerId !== undefined && { fieldManagerId: fieldManagerId || null }),
            }
        });

        res.json({ success: true, data: zone });
    } catch (err) {
        console.error('PUT /zones/:id error:', err);
        if (err.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Zone not found' });
        }
        res.status(500).json({ success: false, message: 'Failed to update zone' });
    }
});

// ── PATCH /api/zones/:id/toggle ────────────────────────────────────────────
router.patch('/:id/toggle', async (req, res) => {
    try {
        const existing = await prisma.zone.findUnique({ where: { id: req.params.id } });
        if (!existing) return res.status(404).json({ success: false, message: 'Zone not found' });

        const zone = await prisma.zone.update({
            where: { id: req.params.id },
            data: { isActive: !existing.isActive }
        });

        res.json({ success: true, data: zone });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to toggle zone status' });
    }
});

// ── DELETE /api/zones/:id ──────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        await prisma.zone.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Zone deleted' });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Zone not found' });
        }
        res.status(500).json({ success: false, message: 'Failed to delete zone' });
    }
});

module.exports = router;
