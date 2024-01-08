import { PrismaClient } from '@prisma/client';
import {v4 as uuidv4} from 'uuid'
import { generateWallet } from '../lib/passphrase';
import range from 'lodash/range';

const prisma = new PrismaClient();

async function main() {
  const walletIds = range(5).map(() => uuidv4());

  await seedWallets(walletIds)
  await seedUsers(walletIds);
}

async function seedWallets(walletIds: string[]) {
  await prisma.wallet.createMany({
    data: [
      {
        id: walletIds[0],
        ...generateWallet(),
      },
      {
        id: walletIds[1],
        ...generateWallet(),
      },
      {
        id: walletIds[2],
        ...generateWallet(),
      },
      {
        id: walletIds[3],
        ...generateWallet(),
      },
      {
        id: walletIds[4],
        ...generateWallet(),
      }
    ]
  })
}

async function seedUsers(walletIds: string[]) {
   await prisma.user.createMany({
    data: [
      {
      id: uuidv4(),
      supabaseUserId: '1',
      walletId: walletIds[0],
      username: 'sbf',
      name: 'SBF',
      avatar: 'https://pbs.twimg.com/profile_images/1493575109424160772/AKRRTAI-_400x400.jpg',
    },
     {
      id: uuidv4(),
      supabaseUserId: '2',
      walletId: walletIds[1],
      username: 'kyledavies',
      name: 'Kyle Davies',
      avatar: 'https://pbs.twimg.com/profile_images/1663792394834255872/dpcjtQp4_400x400.jpg',
    },
     {
      id: uuidv4(),
      supabaseUserId: '3',
      walletId: walletIds[2],
      username: 'gcr',
      name: 'GCR',
      avatar: 'https://pbs.twimg.com/profile_images/1622015225573646336/jIHb2Pbs_400x400.jpg',
    },
     {
      id: uuidv4(),
      supabaseUserId: '4',
      walletId: walletIds[3],
      username: 'hsaka',
      name: 'Hsaka',
      avatar: 'https://pbs.twimg.com/profile_images/1690929913270792192/6n-PzBnB_400x400.jpg',
    },
     {
      id: uuidv4(),
      supabaseUserId: '5',
      walletId: walletIds[4],
      username: 'remilia',
      name: 'Remilia',
      avatar: 'https://pbs.twimg.com/profile_images/1728783465380720640/lsvlT9e6_400x400.jpg',
    },
  ],
  });
}

main()
  .then(async () => {
    console.log('🌱 Seeded Database');
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
