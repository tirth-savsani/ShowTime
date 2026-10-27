/**
 * Rolling Shows Background Cron Job (Phase 3)
 *
 * Runs every day at 00:00 (Midnight IST) to ensure shows are scheduled
 * for the 7th rolling day ahead, maintaining a constant 7-day booking window.
 */

import cron from 'node-cron';
import { ensureRollingShows } from '../services/showScheduler.service.js';

let rollingShowsTask = null;

export const startRollingShowsJob = () => {
  if (rollingShowsTask) {
    return rollingShowsTask;
  }

  // 0 0 * * * = Midnight every day
  // (In Indian Standard Time timezone: 'Asia/Kolkata')
  rollingShowsTask = cron.schedule(
    '0 0 * * *',
    async () => {
      console.log('[CRON] Running daily midnight rolling shows scheduler (7-day window)...');
      try {
        const result = await ensureRollingShows({ daysAhead: 7 });
        console.log(`[CRON] Rolling shows complete: ${result.insertedCount} inserted, ${result.skippedCount} skipped.`);
      } catch (err) {
        console.error('[CRON] Rolling shows scheduler error:', err.message);
      }
    },
    {
      timezone: 'Asia/Kolkata',
    }
  );

  console.log('[CRON] Rolling shows scheduler registered (runs daily at 00:00 IST).');
  return rollingShowsTask;
};

export const stopRollingShowsJob = () => {
  if (rollingShowsTask) {
    rollingShowsTask.stop();
    rollingShowsTask = null;
  }
};

export default {
  startRollingShowsJob,
  stopRollingShowsJob,
};
