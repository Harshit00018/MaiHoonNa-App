import prisma from '../core/database';
import { generateUUID, generateRandomPhone } from '../utils/helpers';
import { Prisma } from '@prisma/client';

export const createBeneficiary = async (data: {
  subscriberId: string;
  name: string;
  photo?: string;
  age: number;
  gender: string;
  address: string;
  medicalConditions?: string[];
  medications?: string[];
  emergencyContacts?: object[];
}) => {
  const user = await prisma.user.create({
    data: {
      id: generateUUID(),
      phone: generateRandomPhone(),
      name: data.name,
      role: 'beneficiary',
    },
  });

  return prisma.beneficiary.create({
    data: {
      id: generateUUID(),
      userId: user.id,
      subscriberId: data.subscriberId,
      name: data.name,
      photo: data.photo,
      age: data.age,
      gender: data.gender,
      address: data.address,
      medicalConditions: data.medicalConditions ?? [],
      medications: data.medications ?? [],
      emergencyContacts: (data.emergencyContacts ?? []) as Prisma.InputJsonValue,
    },
  });
};

export const getBeneficiary = async (beneficiaryId: string) => {
  const b = await prisma.beneficiary.findUnique({ where: { id: beneficiaryId } });
  if (!b) throw new Error('Beneficiary not found');
  return b;
};

export const getSubscriberBeneficiaries = async (subscriberId: string) => {
  return prisma.beneficiary.findMany({ where: { subscriberId } });
};

export const updateBeneficiary = async (beneficiaryId: string, updates: Prisma.BeneficiaryUpdateInput) => {
  return prisma.beneficiary.update({ where: { id: beneficiaryId }, data: updates });
};

export const getCareCompanions = async (zone?: string) => {
  return prisma.careCompanion.findMany({
    where: { isAvailable: true, ...(zone ? { zone } : {}) },
  });
};

export const getCareCompanion = async (ccId: string) => {
  const cc = await prisma.careCompanion.findUnique({ where: { id: ccId } });
  if (!cc) throw new Error('Care companion not found');
  return cc;
};