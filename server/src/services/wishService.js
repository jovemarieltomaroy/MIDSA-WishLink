import Wish from '../models/Wish.js';

export async function releaseExpiredReservations() {
  const now = new Date();
  const expired = await Wish.find({ status: 'reserved', reservationExpiresAt: { $lte: now } });
  for (const wish of expired) {
    wish.history.push({
      action: 'reservation_expired',
      fromStatus: 'reserved',
      toStatus: 'available',
      note: 'Reservation automatically reopened after the drop-off deadline passed.',
      actorName: 'WishLink',
      actorType: 'system'
    });
    wish.status = 'available';
    wish.donor = undefined;
    wish.reservationExpiresAt = null;
    await wish.save();
  }
  return expired.length;
}
