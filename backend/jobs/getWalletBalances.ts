import { User, Dependencies } from '@/types';
import sui from '@/lib/sui';
import { MIST_PER_SUI } from '@mysten/sui.js/utils';
import { getFaucetHost, requestSuiFromFaucetV0 } from '@mysten/sui.js/faucet';
import getBalance from '@/lib/getBalance'
import dunbarClient from '@/lib/dunbarClient'

import { deriveKeypair } from '@/lib/passphrase';
import { TransactionBlock } from "@mysten/sui.js/transactions";


// @ts-ignore
export default async function (deps: Dependencies) {
  const { db } = deps;
  const wallets = await db.wallet.findMany({
    include: {
      user: true,
    },
  })
  console.log('Looping through wallets...')
  for (const wallet of wallets) {
    console.log(`Getting balance for ${wallet.publicKey}`)
    const suiAmount = await getBalance(wallet.publicKey)
    console.log(`Got balance for ${wallet.publicKey}`)
    console.log(suiAmount);

    await db.wallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        balance: suiAmount,
      },
    });
    console.log('Wallet updated!')

    const user = wallet.user[0];
    if (user == null) {
      continue
    }
    // We have enough to initialize the user
    if (!user.initialized && suiAmount > 0.01) {
      console.log('User not initialized and has SUI, initializing...')
      const tx = new TransactionBlock();
      await dunbarClient.initUser(tx);
      const keypair = deriveKeypair(wallet.mnemonic);
      const result = await sui.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        signer: keypair,
        options: {
          showEvents: true,
          showEffects: true,
          showObjectChanges: true,
          showBalanceChanges: true,
        },
      });
      console.log('result', result);
      // @ts-ignore
      const parsedJson = result.events[0].parsedJson;
      // @ts-ignore
      const userObjectId = parsedJson.user_object;
      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          initialized: true,
          userObjectId,
        },
      });
    }
  }
  console.info(`Finished getting wallet balances`)
}
