export function getDefaultExpiry(campaignDeadline = null) {
  const days = Number(process.env.DEFAULT_RESERVATION_DAYS || 5);
  // Read the reservation's calendar date in the Philippines, independent of
  // the server timezone. Manila is UTC+8; 5 PM there is 09:00 UTC.
  const phDate = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const expiry = new Date(Date.UTC(
    phDate.getUTCFullYear(),
    phDate.getUTCMonth(),
    phDate.getUTCDate() + days,
    9
  ));
  return clampToDeadline(expiry, campaignDeadline);
}

export function clampToDeadline(date, deadline = null) {
  const end = deadline ? new Date(deadline) : null;
  if (end && !Number.isNaN(end.getTime()) && date > end) return end;
  return date;
}

export function formatPHDate(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(new Date(date));
}
