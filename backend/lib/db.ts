// @ts-nocheck
import { PrismaClient } from '@prisma/client';

export default (): PrismaClient => {
  return new PrismaClient();
};
