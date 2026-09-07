import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CalendarClock,
  Gift,
  HeartHandshake,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { api, getErrorMessage } from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import logo from '../assets/logo.png';

export default function PublicWishPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [wish, setWish] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/public/wishes/${code}`)
      .then((response) => setWish(response.data.wish))
      .catch((err) => setError(getErrorMessage(err)));
  }, [code]);

  if (error) {
    return (
      <PublicFrame>
        <div className="public-card">
          <h1>We couldn’t find this ornament.</h1>
          <p>{error}</p>
        </div>
      </PublicFrame>
    );
  }

  if (!wish) {
    return <PublicFrame><div className="public-card">Loading this Christmas wish…</div></PublicFrame>;
  }

  const reserved = wish.status === 'reserved';
  const granted = wish.status === 'granted';
  const paused = wish.status === 'paused';
  const campaignConcluded = wish.campaignState === 'concluded';
  const campaignUpcoming = wish.campaignState === 'upcoming';

  return (
    <PublicFrame>
      <div className="public-card hero-card">
        <div className="public-status-row">
          <div className="eyebrow public-eyebrow">
            <Sparkles size={15} />
            <span>A little wish, waiting for a little magic</span>
          </div>
          <StatusBadge status={wish.status} />
        </div>

        {wish.campaign && (
          <div className="campaign-public-label">
            {wish.campaign.name}
            {wish.campaign.academicPeriod ? ` · ${wish.campaign.academicPeriod}` : ''}
          </div>
        )}

        <h1>Meet <span>{wish.nickname}</span>.</h1>
        <p className="lede">
          Their identity stays private, but their Christmas wish can still find its way to someone who wants to help.
        </p>

        <div className="wish-box">
          <Gift size={26} />
          <div>
            <small>{wish.nickname} is wishing for</small>
            <ul>{wish.wishItems.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>

        {campaignConcluded && (
          <div className="state-panel">
            <LockKeyhole />
            <div>
              <h3>This giving campaign has concluded.</h3>
              <p>Thank you for supporting MIDSA WishLink. This ornament belongs to a previous giving period and can no longer be reserved.</p>
            </div>
          </div>
        )}

        {campaignUpcoming && (
          <div className="state-panel">
            <CalendarClock />
            <div>
              <h3>This campaign is not open yet.</h3>
              <p>This wish is already prepared, but reservations will open when the MIDSA giving campaign begins.</p>
            </div>
          </div>
        )}

        {!campaignConcluded && !campaignUpcoming && wish.status === 'available' && wish.reservationsAllowed && (
          <>
            <p className="quote">“The best gifts are the ones that make someone feel remembered.”</p>
            <button className="primary-button jumbo" onClick={() => navigate(`/wish/${code}/grant`)}>
              <HeartHandshake size={20} />
              <span>I’d like to grant {wish.nickname}’s wish</span>
            </button>
          </>
        )}

        {!campaignConcluded && !campaignUpcoming && reserved && (
          <div className="state-panel reserved-panel">
            <CalendarClock />
            <div>
              <h3>A Secret Santa is already preparing this wish.</h3>
              <p>
                If the gift is not completed by the current commitment date, this wish may become available again. You can check back in about{' '}
                <strong>{wish.daysRemaining} day{wish.daysRemaining === 1 ? '' : 's'}</strong>.
              </p>
            </div>
          </div>
        )}

        {granted && !campaignConcluded && (
          <div className="state-panel granted-panel">
            <Sparkles />
            <div>
              <h3>This wish has found its Christmas magic.</h3>
              <p>A Secret Santa has already delivered the gift. Thank you for stopping by—another ornament on the tree may still be waiting for you.</p>
            </div>
          </div>
        )}

        {paused && !campaignConcluded && !campaignUpcoming && (
          <div className="state-panel">
            <LockKeyhole />
            <div>
              <h3>This wish is temporarily unavailable.</h3>
              <p>The MIDSA team is checking its details. Please choose another ornament for now.</p>
            </div>
          </div>
        )}
      </div>

      <div className="trust-grid">
        <div>
          <ShieldCheck />
          <span><strong>Privacy first</strong><small>Only the child’s nickname and wish are public.</small></span>
        </div>
        <div>
          <MapPin />
          <span><strong> Drop off point: IPDM Office</strong><small>Gifts are received and verified by MIDSA officers.</small></span>
        </div>
      </div>
    </PublicFrame>
  );
}

function PublicFrame({ children }) {
  return (
    <div className="public-page">
      <header className="public-header" style={{ display: 'flex', alignItems: 'center', minHeight: '72px', paddingTop: '10px', paddingBottom: '10px' }}>
        <div style={{ width: '100%', maxWidth: '1120px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img src={logo} alt="MIDSA WishLink" style={{ display: 'block', width: '40px', height: '50px', objectFit: 'contain', flexShrink: 0 }} />
            <div style={{ width: '1px', height: '26px', background: 'rgba(15, 39, 71, 0.14)', flexShrink: 0 }} />
            <span style={{ color: '#748197', fontSize: '13px', lineHeight: 1.4, whiteSpace: 'nowrap' }}>Share a little wonder.</span>
          </div>
        </div>
      </header>
      <main className="public-wrap">{children}</main>
      <footer>Made for MIDSA’s Christmas giving program · Child identities remain anonymous in the public experience.</footer>
    </div>
  );
}
