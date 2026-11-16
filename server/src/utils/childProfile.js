export function cleanChildProfile(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid child profile.');
  const profile = {};
  for (const key of ['interests', 'otherWishes']) {
    if (value[key] !== undefined && typeof value[key] !== 'string') throw new Error('Profile text must be a string.');
    profile[key] = (value[key] || '').trim();
    if (profile[key].length > 4000) throw new Error('Keep each profile text field under 4,000 characters.');
  }
  profile.worksheetImage = value.worksheetImage || '';
  if (typeof profile.worksheetImage !== 'string' || profile.worksheetImage.length > 850000 ||
      (profile.worksheetImage && !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(profile.worksheetImage))) {
    throw new Error('Choose a JPEG, PNG, or WebP worksheet image under 600 KB.');
  }
  return profile;
}
