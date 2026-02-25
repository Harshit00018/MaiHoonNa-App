import prisma from '../core/database';

export const getUser = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  return user;
};

export const updateUser = async (userId: string, updates: Record<string, unknown>) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: updates,
  });
  return user;
};