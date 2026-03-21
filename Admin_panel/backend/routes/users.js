const express = require('express');
const router = express.Router();
const path = require('path');
// Use main backend Prisma client which has all models (CareCompanion, FieldManager, Team etc.)
const { PrismaClient } = require(path.join(__dirname, '../../../backend/node_modules/@prisma/client'));

const prisma = new PrismaClient();

// ── GET /api/users/field-managers ──────────────────────────────────────────
router.get('/field-managers', async (req, res) => {
    try {
        const managers = await prisma.fieldManager.findMany({
            include: {
                user: {
                    select: { name: true, phone: true, isActive: true }
                },
                teams: {
                    select: { id: true, name: true }
                }
            }
        });
        res.json({ success: true, data: managers });
    } catch (err) {
        console.error('GET /field-managers error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch field managers' });
    }
});

// ── POST /api/users/staff ──────────────────────────────────────────────────
router.post('/staff', async (req, res) => {
    try {
        const { name, phone, role, zoneId, bio, specialization } = req.body;
        
        // 1. Create User
        const user = await prisma.user.create({
            data: {
                name,
                phone,
                role: role || 'care_companion',
                isActive: true
            }
        });

        // 2. Create Profile
        if (user.role === 'care_companion') {
            await prisma.careCompanion.create({
                data: {
                    userId: user.id,
                    name,
                    zone: zoneId || 'Unassigned',
                    bio: bio || 'Professional Care Companion',
                    specialization: specialization || ['General Care'],
                    isAvailable: true
                }
            });
        } else if (user.role === 'field_manager') {
            await prisma.fieldManager.create({
                data: {
                    userId: user.id,
                    name,
                    zone: zoneId || 'Unassigned',
                    isAvailable: true
                }
            });
        }

        res.json({ success: true, data: user });
    } catch (err) {
        console.error('POST /staff error:', err);
        res.status(500).json({ success: false, message: 'Failed to create staff member' });
    }
});

// ── GET /api/users/care-companions ──────────────────────────────────────────
router.get('/care-companions', async (req, res) => {
    try {
        const companions = await prisma.careCompanion.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        phone: true,
                        isActive: true
                    }
                },
                team: {
                    select: {
                        name: true
                    }
                }
            }
        });
        res.json({ success: true, data: companions });
    } catch (err) {
        console.error('GET /care-companions error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch care companions' });
    }
});

module.exports = router;
