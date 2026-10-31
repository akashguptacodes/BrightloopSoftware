import cron from 'node-cron';
import prisma from '../config/database.js';
import { runRecurringBillingJob, updateOverdueInvoices } from '../services/billingService.js';
import { sendSubscriptionStatusEmail } from '../services/emailService.js';

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

  // 3. Daily Renewal Reminder: Runs every morning at 02:00 AM
  // Notifies customers 3 days before renewal
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log(`[Scheduler] [${new Date().toISOString()}] Checking upcoming subscription renewals...`);
      const now = new Date();
      const inThreeDays = new Date();
      inThreeDays.setDate(inThreeDays.getDate() + 3);
      inThreeDays.setHours(23, 59, 59, 999);

      const upcoming = await prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          nextBillingDate: {
            gte: now,
            lte: inThreeDays,
          },
        },
        include: {
          customer: true,
        },
      });

      for (const sub of upcoming) {
        if (sub.customer && sub.customer.email) {
          await sendSubscriptionStatusEmail(
            sub.customer.email,
            sub.customer.contactPerson || sub.customer.companyName || 'Valued Customer',
            sub.subscriptionNumber,
            'RENEWAL_UPCOMING',
            { nextBillingDate: sub.nextBillingDate }
          );
        }
      }
      console.log(`[Scheduler] Renewal reminder check complete. Notifications processed: ${upcoming.length}`);
    } catch (err) {
      console.error('[Scheduler] Error during renewal reminder check:', err);
    }
  });

  console.log('[Scheduler] Cron schedules registered (Recurring billing: 00:05 AM, Overdue check: 01:00 AM, Renewal reminder: 02:00 AM daily).');
}

