import { useEffect, useState } from 'react';
import './CampaignCountdown.css';

const giftDay = Date.parse('2026-12-19T00:00:00+08:00');
const giftDayEnd = Date.parse('2026-12-20T00:00:00+08:00');

export default function CampaignCountdown() {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remaining = Math.max(0, Math.ceil((giftDay - now) / 1000));
  const units = [
    ['Days', Math.floor(remaining / 86400)],
    ['Hours', Math.floor(remaining / 3600) % 24],
    ['Minutes', Math.floor(remaining / 60) % 60],
    ['Seconds', remaining % 60],
  ];

  return (
    <section className="campaign-countdown" aria-label="Countdown to Gift-Giving Day">
      <div className="campaign-countdown-copy">
        <p>{now < giftDay ? 'A brighter holiday season is on its way' : now < giftDayEnd ? 'It’s Gift-Giving Day!' : 'Thank you for sharing the spirit of giving'}</p>
        <span>Gift-Giving Day · <time dateTime="2026-12-19">December 19, 2026</time> · Philippine time</span>
      </div>
      {now < giftDay && <div className="campaign-countdown-clock" role="timer" aria-live="off">
        {units.map(([label, value]) => <div className="campaign-countdown-unit" key={label}>
          <span className="campaign-countdown-number">{String(value).padStart(2, '0')}</span>
          <span className="campaign-countdown-label">{label}</span>
        </div>)}
      </div>}
    </section>
  );
}
