import prisma from '../core/database';
import { generateUUID } from '../utils/helpers';
import { SubscriptionType } from '@prisma/client';

export const purchaseSubscription = async (
  userId: string,
  packageId: string, // We map this to SubscriptionType enum
  beneficiaryData: {
    name: string;
    age: number;
    gender: string;
    address: string;
    relationship: string;
    phone: string;
  }
) => {
  // Validate packageType
  const mappedType = packageId as SubscriptionType;

  // Ensure the packages exist and get the mapped one
  const packages = await getSubscriptionPackages();
  const subPackage = packages.find((p: any) => p.type === mappedType);
  if (!subPackage) {
    throw new Error(`Package type ${mappedType} not found in database.`);
  }

  // 1a. The Beneficiary is technically a user in this schema, so we create a simple placeholder user row first
  const newBeneficiaryUser = await prisma.user.create({
    data: {
      id: generateUUID(),
      phone: `+91111${Math.floor(Math.random() * 9000000)}`, // fake distinct phone
      name: beneficiaryData.name,
      role: 'beneficiary'
    }
  });

  // 1b. Create Beneficiary mapped to the logged-in User
  const beneficiary = await prisma.beneficiary.create({
    data: {
      id: generateUUID(),
      userId: newBeneficiaryUser.id,
      subscriberId: userId,
      name: beneficiaryData.name,
      age: beneficiaryData.age,
      gender: beneficiaryData.gender,
      address: beneficiaryData.address,
      emergencyContacts: [{
        name: "Subscriber",
        phone: beneficiaryData.phone,
        relation: beneficiaryData.relationship
      }],
    }
  });

  // 2. Create the Subscription record
  const subscription = await prisma.subscription.create({
    data: {
      id: generateUUID(),
      subscriberId: userId,
      beneficiaryId: beneficiary.id,
      packageType: mappedType,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      visitsTotal: subPackage.visitsPerWeek * 4,
    },
    include: {
      package: true,
    }
  });

  return {
    success: true,
    message: 'Subscription purchased successfully!',
    subscriptionId: subscription.id,
    package: subscription.package.name,
    beneficiaryName: beneficiary.name
  };
};

export const getUserDashboard = async (userId: string) => {
  // Find all active subscriptions for this specific user
  const activeSubscriptions = await prisma.subscription.findMany({
    where: {
      subscriberId: userId,
      isActive: true,
    },
    include: {
      package: true,
    }
  });

  // Find all beneficiaries linked to this user
  const beneficiaries = await prisma.beneficiary.findMany({
    where: {
      subscriberId: userId
    }
  });

  return {
    success: true,
    activeSubscriptions,
    beneficiaries
  };
};

export const getSubscriptionPackages = async () => {
  let packages = await prisma.subscriptionPackage.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' }
  });

  // If there are no packages, create the default ones and return them
  if (packages.length === 0) {
    const defaultPackages = [
      {
        id: generateUUID(),
        type: 'silver' as SubscriptionType,
        name: 'Basic Care',
        description: 'Personalized plans designed for peace of mind.',
        price: 2999,
        discountSixMonths: 10.0,
        discountAnnual: 20.0,
        durationMonths: 1,
        visitsPerWeek: 1,
        features: ['Weekly health checkups', 'Vitals monitoring', 'Emergency contact support', 'Basic companionship'],
        isActive: true,
      },
      {
        id: generateUUID(),
        type: 'gold' as SubscriptionType,
        name: 'Premium Care',
        description: 'Personalized plans designed for peace of mind.',
        price: 5999,
        discountSixMonths: 10.0,
        discountAnnual: 20.0,
        durationMonths: 1,
        visitsPerWeek: 3,
        features: ['Bi-weekly health checkups', 'Comprehensive vitals tracking', '24/7 emergency support'],
        isActive: true,
      }
    ];

    await prisma.subscriptionPackage.createMany({
      data: defaultPackages
    });

    packages = await prisma.subscriptionPackage.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });
  }

  return packages;
};