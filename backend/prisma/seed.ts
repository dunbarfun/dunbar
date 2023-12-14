import { PrismaClient } from '@prisma/client';
import {v4 as uuidv4} from 'uuid'
const prisma = new PrismaClient();

async function main() {
  await seedWallets()
  await seedUsers();
}

async function seedWallets() {
  await prisma.wallet.createMany({
    data: [
      {
        id: '1',
        seed: uuidv4(),
        privateKey: uuidv4(),
        publicKey: uuidv4(),
      },
      {
        id: '2',
        seed: uuidv4(),
        privateKey: uuidv4(),
        publicKey: uuidv4()
      },
      {
        id: '3',
        seed: uuidv4(),
        privateKey: uuidv4(),
        publicKey: uuidv4()
      },
      {
        id: '4',
        seed: uuidv4(),
        privateKey: uuidv4(),
        publicKey: uuidv4()
      },
      {
        id: '5',
        seed: uuidv4(),
        privateKey: uuidv4(),
        publicKey: uuidv4()
      }
    ]
  })
}

async function seedUsers() {
   await prisma.user.createMany({
    data: [
      {
      id: '1',
      supabaseUserId: '1',
      walletId: '1',
      username: 'sbf',
      name: 'SBF',
      avatar: 'https://pbs.twimg.com/profile_images/1493575109424160772/AKRRTAI-_400x400.jpg',
    },
     {
      id: '2',
      supabaseUserId: '2',
      walletId: '2',
      username: 'kyledavies',
      name: 'Kyle Davies',
      avatar: 'https://pbs.twimg.com/profile_images/1663792394834255872/dpcjtQp4_400x400.jpg',
    },
     {
      id: '3',
      supabaseUserId: '3',
      walletId: '3',
      username: 'gcr',
      name: 'GCR',
      avatar: 'https://pbs.twimg.com/profile_images/1622015225573646336/jIHb2Pbs_400x400.jpg',
    },
     {
      id: '4',
      supabaseUserId: '4',
      walletId: '4',
      username: 'hsaka',
      name: 'Hsaka',
      avatar: 'https://pbs.twimg.com/profile_images/1690929913270792192/6n-PzBnB_400x400.jpg',
    },
     {
      id: '5',
      supabaseUserId: '5',
      walletId: '5',
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
