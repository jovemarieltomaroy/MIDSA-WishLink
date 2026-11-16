// Keep older campaign titles inclusive without changing their stored records.
export function holidayCampaignName(name) {
  return name?.replace(/christmas/gi, 'Holiday');
}
