import '../paths';

import dotenv from 'dotenv';
dotenv.config();

import depsFactory from '@/deps';

const main = async () => {
  const deps = await depsFactory();
  console.log(`done example`);
};

main();
