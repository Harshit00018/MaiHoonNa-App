import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding mock data for teams...');

  // 0. Create Zones (Nodal Hubs)
  const zonesData = [
    { name: 'Noida Sector 62', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', address: 'Nodal Hub Noida, Sector 62' },
    { name: 'Delhi North Hub', city: 'Delhi', state: 'Delhi', pincode: '110001', address: 'Nodal Hub Delhi, CP' },
    { name: 'Gurgaon DLF Hub', city: 'Gurgaon', state: 'Haryana', pincode: '122001', address: 'Nodal Hub Gurgaon, Phase 3' },
    { name: 'Faridabad Hub', city: 'Faridabad', state: 'Haryana', pincode: '121001', address: 'Nodal Hub Faridabad, Sector 15' },
  ];

  for (const z of zonesData) {
    await prisma.zone.upsert({
      where: { name: z.name },
      update: {},
      create: {
        ...z,
        isActive: true,
      },
    });
    console.log(`Created Zone: ${z.name}`);
  }

  // 1. Create Field Managers
  const fms = [
    { name: 'Sarah Manager', phone: '9876543210', zone: 'South Delhi' },
    { name: 'James Field', phone: '9876543211', zone: 'Gurgaon' },
  ];

  for (const fm of fms) {
    const user = await prisma.user.upsert({
      where: { phone: fm.phone },
      update: {},
      create: {
        name: fm.name,
        phone: fm.phone,
        role: UserRole.field_manager,
        isActive: true,
      },
    });

    await prisma.fieldManager.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        name: fm.name,
        zone: fm.zone,
        isAvailable: true,
      },
    });
    console.log(`Created FM: ${fm.name}`);
  }

  // 2. Create Care Companions
  const ccs = [
    { name: 'John Companion', phone: '8765432101', zone: 'South Delhi', specialization: ['Dementia Care', 'Daily Living'] },
    { name: 'Mary Care', phone: '8765432102', zone: 'South Delhi', specialization: ['Physiotherapy'] },
    { name: 'Alice Helper', phone: '8765432103', zone: 'Gurgaon', specialization: ['Elderly Care'] },
    { name: 'Bob Support', phone: '8765432104', zone: 'Gurgaon', specialization: ['Post-surgery'] },
  ];

  for (const cc of ccs) {
    const user = await prisma.user.upsert({
      where: { phone: cc.phone },
      update: {},
      create: {
        name: cc.name,
        phone: cc.phone,
        role: UserRole.care_companion,
        isActive: true,
      },
    });

    await prisma.careCompanion.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        name: cc.name,
        zone: cc.zone,
        bio: 'Experienced care companion specializing in elderly support.',
        specialization: cc.specialization,
        isAvailable: true,
      },
    });
    console.log(`Created CC: ${cc.name}`);
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
