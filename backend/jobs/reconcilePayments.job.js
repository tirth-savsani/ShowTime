import cron from 'node-cron';
import bookingService from '../services/booking.service.js';

let task = null;

export const startReconcilePaymentsJob = () => {
  // Run every minute (Spec Phase 1.3)
  task = cron.schedule('* * * * *', async () => {
    try {
      await bookingService.reconcilePendingPayments();
    } catch (err) {
      console.error('[Reconcile Payments Job Error]:', err.message);
    }
  });

  console.log('Payment reconciliation job started (running every minute)');
  return task;
};

export const stopReconcilePaymentsJob = () => {
  if (task) {
    task.stop();
    task = null;
  }
};

export default {
  startReconcilePaymentsJob,
  stopReconcilePaymentsJob,
};
