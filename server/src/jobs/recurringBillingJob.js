import cron from 'node-cron';
import { runRecurringBillingJob, updateOverdueInvoices } from '../services/billingService.js';

let isJobRunning = false;

/**
 * Initializes the recurring billing and overdue invoice scheduler
 */
export function initBillingScheduler() {
  console.log('[Scheduler] Initializing automated recurring billing cron jobs...');

  // 1. Daily Recurring Invoice Generator: Runs every night at 00:05 AM
  // Schedule: '5 0 * * *' (At 00:05 every day)
  cron.schedule('5 0 * * *', async () => {
    if (isJobRunning) {
      console.warn('[Scheduler] Previous billing job still running. Skipping overlapping trigger.');
      return;
    }

    try {
      isJobRunning = true;
      console.log(`[Scheduler] [${new Date().toISOString()}] Running daily recurring billing job...`);
      const results = await runRecurringBillingJob();
      console.log(`[Scheduler] Daily billing job complete. Invoices generated: ${results.generated}, Skipped: ${results.skipped}, Failed: ${results.failed}`);
    } catch (err) {
      console.error('[Scheduler] Error during scheduled recurring billing run:', err);
    } finally {
      isJobRunning = false;
    }
  });

  // 2. Daily Overdue Invoice Checker: Runs every morning at 01:00 AM
  // Schedule: '0 1 * * *'
  cron.schedule('0 1 * * *', async () => {
    try {
      console.log(`[Scheduler] [${new Date().toISOString()}] Scanning for overdue invoices...`);
      const overdueResults = await updateOverdueInvoices();
      console.log(`[Scheduler] Overdue check complete. Checked: ${overdueResults.totalChecked}, Marked Overdue: ${overdueResults.totalMarkedOverdue}`);
    } catch (err) {
      console.error('[Scheduler] Error during overdue invoice check:', err);
    }
  });

  console.log('[Scheduler] Cron schedules registered (Recurring billing: 00:05 AM daily, Overdue check: 01:00 AM daily).');
}

