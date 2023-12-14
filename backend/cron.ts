import cron from 'node-cron';

import { Dependencies, Request, Response } from '@/types';

import example from '@/jobs/example';

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
}
