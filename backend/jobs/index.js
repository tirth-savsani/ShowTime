/**
 * Jobs Index (Spec B2)
 * Central place to start all background jobs.
 * Called from server.js after DB connects.
 */

import { startExpirePendingJob } from './expirePending.job.js';

export const startAllJobs = () => {
  startExpirePendingJob();
};

export default { startAllJobs };
