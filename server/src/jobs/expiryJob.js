import cron from 'node-cron';
import { releaseExpiredReservations } from '../services/wishService.js';

export function startExpiryJob() {
  cron.schedule('*/10 * * * *', async () => {
    try {
      const count = await releaseExpiredReservations();
      if (count) console.log(`Reopened ${count} expired wish reservation(s).`);
    } catch (error) {
      console.error('Reservation expiry job failed:', error.message);
    }
  });
}
