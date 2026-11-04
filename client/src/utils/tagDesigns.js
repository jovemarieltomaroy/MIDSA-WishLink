import striped from '../assets/branding/campaign-tag.png';
import dotted from '../assets/branding/tag-dotted.png';
import tartan from '../assets/branding/tag-tartan.png';
import vertical from '../assets/branding/tag-vertical-stripes.png';
import red from '../assets/branding/tag-red.png';
import bow from '../assets/branding/tag-green-bow.png';
import candy from '../assets/branding/tag-candy-cane.png';

// Keep this order stable: the public ornament code selects the same design everywhere.
export const TAG_DESIGNS = [
  { id: 'striped', image: striped, width: 706, height: 1184, top: .28 },
  { id: 'dotted', image: dotted, width: 680, height: 902, top: .24 },
  { id: 'tartan', image: tartan, width: 622, height: 840, top: .22 },
  { id: 'vertical', image: vertical, width: 706, height: 934, top: .24 },
  { id: 'red', image: red, width: 600, height: 932, top: .42, ink: '#fff7e5', accent: '#fff7e5', muted: '#f8e8cd' },
  { id: 'bow', image: bow, width: 654, height: 1090, top: .56 },
  { id: 'candy', image: candy, width: 640, height: 1090, top: .49 },
];

export function getTagDesign(code = '') {
  const key = String(code).trim().toUpperCase();
  let hash = 2166136261;
  for (const character of key) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
  return TAG_DESIGNS[hash % TAG_DESIGNS.length];
}

export function getTagStyle(code) {
  const design = getTagDesign(code);
  return {
    '--tag-image': `url("${design.image}")`,
    '--tag-ratio': design.width / design.height,
    '--tag-top': `${design.top * 100}%`,
    '--tag-ink': design.ink || '#096448',
    '--tag-accent': design.accent || '#a33125',
    '--tag-muted': design.muted || '#7c785f',
  };
}
