import { useEffect, useState } from 'react';
import mids from '../assets/branding/intro/mids.png';
import kat from '../assets/branding/intro/kat.png';
import tree from '../assets/branding/intro/tree.png';
import mark from '../assets/branding/intro/mark.png';
import { playMidsIntro } from '../lib/midsaIntro';

const assets = { mids, kat, tree, mark };
const introSessionKey = 'midsa:campaign-intro-seen-v2';
// Only animate an opening on the landing page, once within this tab's session.
const openedOnLanding = typeof window !== 'undefined' && window.location.pathname === '/';
let introPlayed = false;

function hasSeenIntro() {
  try {
    return window.sessionStorage.getItem(introSessionKey) === 'true';
  } catch {
    return introPlayed;
  }
}

export default function CampaignIntro({ targetRef }) {
  const [enabled] = useState(() => openedOnLanding && !introPlayed
    && !hasSeenIntro()
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    if (!enabled) return;
    introPlayed = true;
    try {
      window.sessionStorage.setItem(introSessionKey, 'true');
    } catch {
      // Keep route navigation covered when browser storage is unavailable.
    }
    let cancelled = false;
    let stop;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => {
      if (motion.matches) { cancelled = true; stop?.(); }
    };
    motion.addEventListener('change', onMotionChange);
    // Decode before the timeline starts so no stage is skipped while PNGs load.
    const timeout = window.setTimeout(() => { cancelled = true; }, 10000);
    Promise.all(Object.values(assets).map((src) => {
      const image = new Image();
      image.src = src;
      return image.decode();
    })).then(() => {
      if (cancelled || !targetRef.current) return;
      window.clearTimeout(timeout);
      stop = playMidsIntro({
        target: targetRef.current,
        page: targetRef.current.closest('.brand-landing'),
        assets,
      });
    }).catch(() => {
      // Leave the real landing page usable if an intro asset fails to load.
      window.clearTimeout(timeout);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      motion.removeEventListener('change', onMotionChange);
      stop?.();
    };
  }, [enabled, targetRef]);

  return null;
}
