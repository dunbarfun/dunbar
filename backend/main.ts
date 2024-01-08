import './paths';

import dotenv from 'dotenv';
dotenv.config();

import appFactory from '@/app';
import apolloFactory from '@/apollo';
import depsFactory from '@/deps';
import cron from '@/cron';

const main = async () => {
  const deps = await depsFactory();
  await appFactory(deps);
  await apolloFactory(deps);

  console.info('🍀 dunbar is running!');

  if (process.env.ENVIRONMENT === 'production') {
    cron(deps);
  } else {
    cron(deps);
  }
};

main();
