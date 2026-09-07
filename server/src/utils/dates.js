export function getDefaultExpiry(campaignDeadline = null) {
  const days = Number(process.env.DEFAULT_RESERVATION_DAYS || 5);
  const d = new Date();
  d.setDate(d.getDate() + days);
  return clampToDeadline(d, campaignDeadline);
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
