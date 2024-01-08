import cron from 'node-cron';

import { Dependencies, Request, Response } from '@/types';

import example from '@/jobs/example';
import getWalletBalances from '@/jobs/getWalletBalances';

// @ts-ignore
export default function (deps: Dependencies) {
  const { db } = deps;
  // Run example every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      await example(deps);
    } catch (err) {
      console.error(err);
    }
  });

  // Get wallet balances every minute
  cron.schedule('* * * * *', async () => {
    try {
      await getWalletBalances(deps);
    } catch (err) {
      console.error(err);
    }
  });
}
