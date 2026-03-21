import { PrismaClient, UserRole, SubscriptionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test data...');

  // ─── 1. Hash Passwords ────────────────────────────────────────────────────
  const salt = await bcrypt.genSalt(10);
  const beneficiaryPasswordHash = await bcrypt.hash('123456', salt);
  const ccPasswordHash = await bcrypt.hash('123321', salt);
  const subscriberPasswordHash = await bcrypt.hash('password123', salt);

  // ─── 2. Create Subscriber (needed as parent for beneficiary) ─────────────
  console.log('Creating subscriber...');
  const subscriberUser = await prisma.user.upsert({
    where: { phone: '+919000000001' },
    update: {},
    create: {
      phone: '+919000000001',
      name: 'Rahul Kumar',
      age: 45,
      password: subscriberPasswordHash,
      role: UserRole.subscriber,
      isActive: true,
    },
  });
  console.log(`✅ Subscriber: ${subscriberUser.name} (${subscriberUser.phone})`);

  // ─── 3. Create Beneficiary User ──────────────────────────────────────────
  console.log('Creating beneficiary user...');
  const beneficiaryUser = await prisma.user.upsert({
    where: { phone: '+919956471834' },
    update: { password: beneficiaryPasswordHash },
    create: {
      phone: '+919956471834',
      name: 'Ravi Kumar',
      age: 72,
      password: beneficiaryPasswordHash,
      role: UserRole.beneficiary,
      isActive: true,
    },
  });
  console.log(`✅ Beneficiary User: ${beneficiaryUser.name} (${beneficiaryUser.phone})`);

  // ─── 4. Create Care Companion User ───────────────────────────────────────
  console.log('Creating care companion user...');
  const ccUser = await prisma.user.upsert({
    where: { phone: '+919956471833' },
    update: { password: ccPasswordHash },
    create: {
      phone: '+919956471833',
      name: 'Sarah Singh',
      age: 30,
      password: ccPasswordHash,
      role: UserRole.care_companion,
      isActive: true,
    },
  });
  console.log(`✅ Care Companion User: ${ccUser.name} (${ccUser.phone})`);

  // ─── 5. Create CareCompanion Profile ─────────────────────────────────────
  console.log('Creating care companion profile...');
  const ccProfile = await prisma.careCompanion.upsert({
    where: { userId: ccUser.id },
    update: {},
    create: {
      userId: ccUser.id,
      name: 'Sarah Singh',
      bio: 'Board-certified nurse practitioner with 8+ years of experience in geriatric care. Specialized in chronic disease management, medication adherence, and patient education.',
      specialization: ['Geriatric Care', 'Chronic Disease Management', 'Medication Adherence'],
      zone: 'Noida Sector 62',
      isAvailable: true,
    },
  });
  console.log(`✅ Care Companion Profile created (id: ${ccProfile.id})`);

  // ─── 6. Create Beneficiary Profile ───────────────────────────────────────
  console.log('Creating beneficiary profile...');
  const beneficiaryProfile = await prisma.beneficiary.upsert({
    where: { userId: beneficiaryUser.id },
    update: {},
    create: {
      userId: beneficiaryUser.id,
      subscriberId: subscriberUser.id,
      name: 'Ravi Kumar',
      age: 72,
      gender: 'Male',
      address: '42 Sector 18, Noida, Uttar Pradesh - 201301',
      medicalConditions: ['Type 2 Diabetes', 'Hypertension', 'Mild Arthritis'],
      medications: ['Metformin 500mg', 'Lisinopril 10mg', 'Aspirin 75mg'],
      emergencyContacts: [
        { name: 'Rahul Kumar', phone: '9000000001', relation: 'Son' }
      ],
      primaryCcId: ccProfile.id,
      emotionalScore: 8.0,
    },
  });
  console.log(`✅ Beneficiary Profile created (id: ${beneficiaryProfile.id})`);

  // ─── 7. Create Medications for Beneficiary ───────────────────────────────
  console.log('Creating medications...');
  const medsData = [
    { name: 'Metformin', dosage: '500mg', frequency: 'Diabetes Management', timeSlots: ['08:00 AM', '08:00 PM'] },
    { name: 'Lisinopril', dosage: '10mg', frequency: 'Blood Pressure Control', timeSlots: ['09:00 AM'] },
    { name: 'Aspirin', dosage: '75mg', frequency: 'Cardiac Protection', timeSlots: ['08:00 AM'] },
  ];

  for (const med of medsData) {
    // Check if medication already exists for this beneficiary
    const existing = await prisma.medication.findFirst({
      where: { beneficiaryId: beneficiaryProfile.id, name: med.name }
    });
    if (!existing) {
      await prisma.medication.create({
        data: {
          beneficiaryId: beneficiaryProfile.id,
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          timeSlots: med.timeSlots,
          startDate: new Date(),
          isActive: true,
        },
      });
    }
    console.log(`✅ Medication: ${med.name} ${med.dosage}`);
  }

  // ─── 8. Create a Scheduled Visit ─────────────────────────────────────────
  console.log('Creating test visit...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const existingVisit = await prisma.visit.findFirst({
    where: { beneficiaryId: beneficiaryProfile.id, careCompanionId: ccProfile.id }
  });

  if (!existingVisit) {
    await prisma.visit.create({
      data: {
        encounterId: `ENC-TEST-${Date.now()}`,
        beneficiaryId: beneficiaryProfile.id,
        careCompanionId: ccProfile.id,
        scheduledTime: tomorrow,
        status: 'scheduled',
      },
    });
    console.log(`✅ Visit scheduled for tomorrow at 10:00 AM`);
  } else {
    console.log(`ℹ️  Visit already exists, skipping.`);
  }

  // ─── 9. Create Subscription Packages (Browse Packages) ───────────────────
  console.log('Creating subscription packages...');
  const packages = [
    {
      type: SubscriptionType.silver,
      name: 'Silver Care',
      description: 'Essential care for your loved ones. Includes regular home visits, medication reminders, and basic health monitoring.',
      price: 4999,
      durationMonths: 1,
      visitsPerWeek: 2,
      discountSixMonths: 10,
      discountAnnual: 20,
      features: [
        '2 home visits per week',
        'Medication reminders',
        'Basic health monitoring (BP, Sugar)',
        'Emergency support line',
        'Monthly health report',
        'Care companion app access',
      ],
    },
    {
      type: SubscriptionType.gold,
      name: 'Gold Care',
      description: 'Comprehensive care with more frequent visits and advanced health tracking. Ideal for elders needing regular supervision.',
      price: 8999,
      durationMonths: 1,
      visitsPerWeek: 4,
      discountSixMonths: 12,
      discountAnnual: 22,
      features: [
        '4 home visits per week',
        'Daily medication management',
        'Advanced vitals tracking',
        '24/7 emergency response',
        'Weekly health report',
        'Dedicated care coordinator',
        'Diet & nutrition guidance',
        'Physiotherapy session (1/month)',
      ],
    },
    {
      type: SubscriptionType.platinum,
      name: 'Platinum Care',
      description: 'Our most complete care package. Daily visits, specialist consultations, and premium services for full peace of mind.',
      price: 14999,
      durationMonths: 1,
      visitsPerWeek: 7,
      discountSixMonths: 15,
      discountAnnual: 25,
      features: [
        'Daily home visits (7 days/week)',
        'Full medication management',
        'Comprehensive vitals & labs tracking',
        'Priority emergency response',
        'Daily health reports',
        'Personal care manager',
        'Specialist consultations (2/month)',
        'Physiotherapy sessions (4/month)',
        'Social & recreational activities',
        'Family dashboard access',
      ],
    },
  ];

  for (const pkg of packages) {
    await prisma.subscriptionPackage.upsert({
      where: { type: pkg.type },
      update: {
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        durationMonths: pkg.durationMonths,
        visitsPerWeek: pkg.visitsPerWeek,
        features: pkg.features,
        discountSixMonths: pkg.discountSixMonths,
        discountAnnual: pkg.discountAnnual,
      },
      create: pkg,
    });
    console.log(`✅ Package: ${pkg.name} - ₹${pkg.price}/month`);
  }

  // ─── Summary ───────────────────────────────────────────────────────────────
  console.log('\n✨ Test data seeded successfully!\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TEST CREDENTIALS:');
  console.log('  Beneficiary  → Phone: +919956471834 | Password: 123456');
  console.log('  Care Companion → Phone: +919956471833 | Password: 123321');
  console.log('  Subscriber   → Phone: +919000000001 | Password: password123');
  console.log('═══════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
