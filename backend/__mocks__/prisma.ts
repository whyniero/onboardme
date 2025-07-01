// __mocks__/prisma.ts
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

export const prismaMock = mockDeep<PrismaClient>();

export type PrismaMock = DeepMockProxy<PrismaClient>;
