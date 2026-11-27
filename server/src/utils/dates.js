export function getDefaultExpiry(campaignDeadline = null) {
  const configuredDays = Number(process.env.DEFAULT_RESERVATION_DAYS || 5);
  const days = Number.isInteger(configuredDays) && configuredDays > 0 ? configuredDays : 5;
  const phDate = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const expiry = new Date(Date.UTC(phDate.getUTCFullYear(), phDate.getUTCMonth(), phDate.getUTCDate(), 9));
  for (let counted = 0; counted < days;) {
    expiry.setUTCDate(expiry.getUTCDate() + 1);
    if (expiry.getUTCDay() !== 0 && expiry.getUTCDay() !== 6) counted++;
  }
  const capped = clampToDeadline(expiry, campaignDeadline);
  const phCapped = new Date(capped.getTime() + 8 * 60 * 60 * 1000);
  if (phCapped.getUTCDay() === 0 || phCapped.getUTCDay() === 6) {
    const daysBack = phCapped.getUTCDay() === 0 ? 2 : 1;
    return new Date(Date.UTC(phCapped.getUTCFullYear(), phCapped.getUTCMonth(), phCapped.getUTCDate() - daysBack, 9));
  }
  return capped;
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
