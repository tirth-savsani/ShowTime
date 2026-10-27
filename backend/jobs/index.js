/**
 * Jobs Index (Spec B2, Phase 1.3)
 * Central place to start all background jobs.
 * Called from server.js after DB connects.
 */

import { startExpirePendingJob } from './expirePending.job.js';
import { startReconcilePaymentsJob } from './reconcilePayments.job.js';

export const startAllJobs = () => {
  startExpirePendingJob();
  startReconcilePaymentsJob();
};

export default { startAllJobs };
