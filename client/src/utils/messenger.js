export function isValidMessengerUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port &&
      ['m.me', 'messenger.com', 'www.messenger.com', 'facebook.com', 'www.facebook.com'].includes(url.hostname) && url.pathname.length > 1;
  } catch { return false; }
}
