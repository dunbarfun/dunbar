import '../paths';

import dotenv from 'dotenv';
dotenv.config();

import depsFactory from '@/deps';
import { generateWallet } from '@/lib/passphrase';
import getWalletBalances from '@/jobs/getWalletBalances';

const main = async () => {
  const deps = await depsFactory();
  console.log(`done example`);
  const wallet = generateWallet();
  console.log(wallet);
  await getWalletBalances(deps);
};

main();
