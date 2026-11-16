import { holidayCampaignName } from '../utils/holidayCopy';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, CalendarClock, Gift, LockKeyhole, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api, getErrorMessage } from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import WishlistImage from '../components/WishlistImage';
import PublicLayout from '../components/PublicLayout';

export default function PublicWishPage() {
  const { code } = useParams();
  const [wish, setWish] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setWish(null);
    setError('');
    async function refresh() {
      try {
        const response = await api.get(`/public/wishes/${code}`, { params: { _refresh: Date.now() } });
        if (active) { setWish(response.data.wish); setError(''); }
      } catch (err) { if (active) setError(getErrorMessage(err)); }
    }
    const refreshWhenVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    refresh();
    window.addEventListener('focus', refreshWhenVisible);
    window.addEventListener('pageshow', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      active = false;
      window.removeEventListener('focus', refreshWhenVisible);
      window.removeEventListener('pageshow', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [code]);

  if (error) return <PublicLayout><main className="wish-message-card"><span className="wish-message-icon"><Gift size={28} /></span><h1>Wish unavailable</h1><p role="alert">{error}</p><p>Check the code on your ornament or ask the MIDSA team for help.</p><Link className="brand-button" to="/">Back to the campaign <ArrowRight size={16} /></Link></main></PublicLayout>;
  if (!wish) return <PublicLayout><main className="wish-message-card" role="status"><Gift size={30} /><h1>Loading your wish…</h1><p>Getting the details from your ornament.</p></main></PublicLayout>;

  const concluded = wish.campaignState === 'concluded';
  const upcoming = wish.campaignState === 'upcoming';
  const canReserve = !concluded && !upcoming && wish.status === 'available' && wish.reservationsAllowed;
  let notice;
  if (concluded) notice = { Icon: LockKeyhole, title: 'This campaign has concluded.', text: 'This wish belongs to a previous giving period and can no longer be reserved.' };
  else if (upcoming) notice = { Icon: CalendarClock, title: 'Reservations are not open yet.', text: 'You can reserve this wish when the campaign begins.' };
  else if (wish.status === 'reserved') notice = { Icon: CalendarClock, title: 'Someone is preparing this gift.', text: `This wish is already reserved.${Number.isFinite(wish.daysRemaining) ? ` Check back in about ${wish.daysRemaining} day${wish.daysRemaining === 1 ? '' : 's'} if it has not been completed.` : ''}` };
  else if (wish.status === 'granted') notice = { Icon: CheckCircle2, title: 'This wish has been granted.', text: 'The gift has been delivered. You can choose another ornament to support.' };
  else if (wish.status === 'paused') notice = { Icon: LockKeyhole, title: 'This wish is temporarily unavailable.', text: 'The MIDSA team is checking its details. Please choose another ornament for now.' };
  else if (!canReserve) notice = { Icon: LockKeyhole, title: 'Reservations are currently unavailable.', text: 'Please check back later or ask the MIDSA team for the campaign schedule.' };

  return <PublicLayout><main className="public-wish-main">
    <div className="public-wish-heading"><span className="brand-kicker">HOLIDAY WISH</span>{wish.campaign && <p>{holidayCampaignName(wish.campaign.name)}{wish.campaign.academicPeriod ? ` · ${wish.campaign.academicPeriod}` : ''}</p>}</div>
    <div className="public-wish-grid">
      <section className="public-wishlist-image" aria-labelledby="wish-recipient"><h1 id="wish-recipient">{wish.nickname}'s wishlist</h1><WishlistImage key={code} image={wish.childProfile?.worksheetImage} nickname={wish.nickname} /></section>
      <section className="wish-action-card" aria-labelledby="wish-action-title"><StatusBadge status={wish.status} /><h2 id="wish-action-title">{canReserve ? 'A little kindness goes a long way' : 'About this wish'}</h2>
        {canReserve && <><p>You're welcome to grant any wish or want shown in this wishlist. Choose what fits your budget and what you're comfortable giving; there is no expectation to fulfill everything. Any gift you choose is warmly appreciated.</p><p>Be this child's holiday donor. Your reservation pairs you with this child while you prepare your chosen gift.</p><details className="wish-step-details"><summary>How reservations work</summary><ol className="wish-next-steps"><li><span>1</span><div><strong>Leave your details</strong><p>Tell the team how to contact you.</p></div></li><li><span>2</span><div><strong>Verify your email</strong><p>Enter the code sent to your inbox to confirm your reservation.</p></div></li><li><span>3</span><div><strong>Prepare and drop off the gift</strong><p>Follow the location and deadline shown after confirmation.</p></div></li></ol></details><Link to={`/wish/${encodeURIComponent(code)}/grant`} className="brand-button wish-reserve-button">Be this child's holiday donor <ArrowRight size={18} /></Link></>}
        {notice && <div className={`wish-state-notice wish-state-${wish.status}`} role="status"><notice.Icon size={24} /><div><h3>{notice.title}</h3><p>{notice.text}</p></div></div>}
      </section>
    </div>
  </main></PublicLayout>;
}
