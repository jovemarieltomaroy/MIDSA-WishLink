import Wish from '../models/Wish.js';
import { sendDonorLifecycleEmail } from './notificationService.js';

export async function releaseExpiredReservations({ deferNotifications = false } = {}) {
  const now = new Date();
  const expired = await Wish.find({ status: 'reserved', reservationExpiresAt: { $lte: now } });
  let count = 0;
  for (const wish of expired) {
    const released = await Wish.findOneAndUpdate({
      _id: wish._id, status: 'reserved', reservationExpiresAt: wish.reservationExpiresAt,
      'donor.reservedAt': wish.donor?.reservedAt
    }, {
      $set: { status: 'available', reservationExpiresAt: null, reminderSentForDeadline: null },
      $unset: { donor: 1 },
      $push: { history: {
        action: 'reservation_expired', fromStatus: 'reserved', toStatus: 'available',
        note: 'Reservation automatically reopened after the drop-off deadline passed.',
        actorName: 'WishLink', actorType: 'system'
      } }
    }, { new: false });
    if (!released) continue;
    count += 1;
    // Keep the pre-update donor snapshot for the release email.
    const notification = sendDonorLifecycleEmail(released, 'released').catch(error => {
      console.error('Reservation release email failed:', error);
    });
    if (!deferNotifications) await notification;
  }
  return count;
}

export async function sendUpcomingDeadlineReminders() {
  const now = new Date();
  const upcoming = await Wish.find({
    status: 'reserved',
    reservationExpiresAt: { $gt: now, $lte: new Date(now.getTime() + 86400000) },
    'donor.email': { $exists: true, $ne: '' },
    $expr: { $ne: [{ $ifNull: ['$reminderSentForDeadline', null] }, '$reservationExpiresAt'] }
  });
  for (const wish of upcoming) {
    const claimed = await Wish.findOneAndUpdate({
      _id: wish._id, status: 'reserved', reservationExpiresAt: wish.reservationExpiresAt,
      'donor.reservedAt': wish.donor?.reservedAt,
      reminderSentForDeadline: { $ne: wish.reservationExpiresAt }
    }, { $set: { reminderSentForDeadline: wish.reservationExpiresAt } }, { new: true });
    if (!claimed) continue;
    try {
      await sendDonorLifecycleEmail(claimed, 'reminder');
    } catch (error) {
      await Wish.updateOne({
        _id: claimed._id, reservationExpiresAt: claimed.reservationExpiresAt,
        'donor.reservedAt': claimed.donor?.reservedAt,
        reminderSentForDeadline: claimed.reservationExpiresAt
      }, { $set: { reminderSentForDeadline: null } });
      console.error('Deadline reminder email failed:', error);
    }
  }
}
