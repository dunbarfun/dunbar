import '../paths';

import dotenv from 'dotenv';
dotenv.config();

import depsFactory from '@/deps';
import { generateWallet } from '@/lib/passphrase';
import { MIST_PER_SUI } from '@mysten/sui.js/utils';
import { getFaucetHost, requestSuiFromFaucetV0 } from '@mysten/sui.js/faucet';


const main = async () => {
  const deps = await depsFactory();
  const address = '0xe24283610e01e481a11de62444279a38adeefc7b37706b98e0909bd6fb2050d5';

  await requestSuiFromFaucetV0({
    // use getFaucetHost to make sure you're using correct faucet address
    // you can also just use the address (see Sui TypeScript SDK Quick Start for values)
    host: getFaucetHost('testnet'),
    recipient: address,
  });
};

main();
