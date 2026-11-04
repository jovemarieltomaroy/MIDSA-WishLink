import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, CalendarClock, Gift, LockKeyhole, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api, getErrorMessage } from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import PublicLayout from '../components/PublicLayout';
import { getTagDesign, getTagStyle } from '../utils/tagDesigns';

export default function PublicWishPage() {
  const { code } = useParams();
  const [wish, setWish] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setWish(null);
    setError('');
    api.get(`/public/wishes/${code}`)
      .then(response => { if (active) setWish(response.data.wish); })
      .catch(err => { if (active) setError(getErrorMessage(err)); });
    return () => { active = false; };
  }, [code]);

  if (error) return <PublicLayout compact><main className="wish-message-card"><span className="wish-message-icon"><Gift size={28} /></span><h1>Wish unavailable</h1><p role="alert">{error}</p><p>Check the code on your ornament or ask the MIDSA team for help.</p><Link className="brand-button" to="/">Back to the campaign <ArrowRight size={16} /></Link></main></PublicLayout>;
  if (!wish) return <PublicLayout compact><main className="wish-message-card" role="status"><Gift size={30} /><h1>Loading your wish…</h1><p>Getting the details from your ornament.</p></main></PublicLayout>;

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

  return <PublicLayout compact><main className="public-wish-main">
    <div className="public-wish-heading"><span className="brand-kicker">CHRISTMAS WISH</span>{wish.campaign && <p>{wish.campaign.name}{wish.campaign.academicPeriod ? ` · ${wish.campaign.academicPeriod}` : ''}</p>}</div>
    <div className="public-wish-grid">
      <section className="wish-gift-tag" data-tag-design={getTagDesign(code).id} style={getTagStyle(code)} aria-labelledby="wish-recipient"><div className="wish-tag-contents"><span className="wish-tag-label">TO</span><h1 id="wish-recipient">{wish.nickname}</h1><span className="wish-tag-label">CHRISTMAS WISH LIST</span><ul>{wish.wishItems.map((item, index) => <li key={`${item}-${index}`}><Gift size={16} aria-hidden="true" /><span>{item}</span></li>)}</ul><div className="wish-tag-signoff"><span className="wish-tag-label">FROM</span><span>Your Secret Santa</span></div></div></section>
      <section className="wish-action-card" aria-labelledby="wish-action-title"><StatusBadge status={wish.status} /><h2 id="wish-action-title">{canReserve ? 'Prepare this Christmas gift' : 'About this wish'}</h2>
        {canReserve && <><p>Reserve the wish, prepare the gift, and follow the drop-off instructions.</p><details className="wish-step-details"><summary>How reservations work</summary><ol className="wish-next-steps"><li><span>1</span><div><strong>Leave your details</strong><p>Tell the team how to contact you.</p></div></li><li><span>2</span><div><strong>Verify your email</strong><p>Enter the code sent to your inbox to confirm your reservation.</p></div></li><li><span>3</span><div><strong>Prepare and drop off the gift</strong><p>Follow the location and deadline shown after confirmation.</p></div></li></ol></details><Link to={`/wish/${encodeURIComponent(code)}/grant`} className="brand-button wish-reserve-button">Reserve this wish <ArrowRight size={18} /></Link></>}
        {notice && <div className={`wish-state-notice wish-state-${wish.status}`} role="status"><notice.Icon size={24} /><div><h3>{notice.title}</h3><p>{notice.text}</p></div></div>}
      </section>
    </div>
  </main></PublicLayout>;
}
