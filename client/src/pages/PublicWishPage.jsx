import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CalendarClock,
  Gift,
  HeartHandshake,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Sparkles,
  TreePine,
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
    api
      .get(`/public/wishes/${code}`)
      .then((response) => setWish(response.data.wish))
      .catch((err) => setError(getErrorMessage(err)));
  }, [code]);

  if (error) {
    return (
      <PublicFrame>
        <div
          className="public-card"
          style={{
            padding: '36px',
            borderRadius: '24px',
            background: '#ffffff',
            border: '1px solid rgba(125, 23, 24, 0.10)',
            boxShadow: '0 24px 60px rgba(15, 39, 71, 0.08)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <h1 style={{ marginBottom: '10px' }}>
            We couldn’t find this ornament.
          </h1>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      </PublicFrame>
    );
  }

  if (!wish) {
    return (
      <PublicFrame>
        <div
          className="public-card"
          style={{
            padding: '36px',
            borderRadius: '24px',
            background: '#ffffff',
            border: '1px solid rgba(15, 39, 71, 0.08)',
            boxShadow: '0 24px 60px rgba(15, 39, 71, 0.08)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Loading this Christmas wish…
        </div>
      </PublicFrame>
    );
  }

  const reserved = wish.status === 'reserved';
  const granted = wish.status === 'granted';
  const paused = wish.status === 'paused';
  const campaignConcluded = wish.campaignState === 'concluded';
  const campaignUpcoming = wish.campaignState === 'upcoming';

  return (
    <PublicFrame>
      <div
        className="public-card hero-card"
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '28px',
          padding: '38px',
          background:
            'linear-gradient(180deg, #fffdfad5 0%, #ffffff 100%)',
          border: '1px solid rgba(15, 39, 71, 0.08)',
          boxShadow: '0 22px 60px rgba(15, 39, 71, 0.08)',
          zIndex: 1,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at top right, rgba(201,168,76,0.13), transparent 28%), radial-gradient(circle at bottom left, rgba(125,23,24,0.07), transparent 26%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '6px',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '999px',
                background: '#f3f7ff',
                color: '#324766',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <Sparkles size={15} />
              <span>A little wish, waiting for a little magic</span>
            </div>

            <StatusBadge status={wish.status} />
          </div>

          {wish.campaign && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 12px',
                borderRadius: '999px',
                background: 'rgba(15, 106, 76, 0.08)',
                color: '#0f6a4c',
                fontSize: '13px',
                fontWeight: 700,
                marginBottom: '18px',
              }}
            >
              <TreePine size={14} />
              <span>
                {wish.campaign.name}
                {wish.campaign.academicPeriod
                  ? ` · ${wish.campaign.academicPeriod}`
                  : ''}
              </span>
            </div>
          )}

          <h1
            style={{
              fontSize: 'clamp(2.3rem, 5vw, 3.35rem)',
              lineHeight: 1.05,
              marginBottom: '14px',
              color: '#17243a',
            }}
          >
            Meet{' '}
            <span
              style={{
                color: '#2f62dc',
              }}
            >
              {wish.nickname}
            </span>
            .
          </h1>

          <p
            className="lede"
            style={{
              maxWidth: '900px',
              fontSize: '1.08rem',
              lineHeight: 1.7,
              color: '#44546a',
              marginBottom: '26px',
            }}
          >
            Their identity stays private, but their Christmas wish can still
            find its way to someone who wants to help.
          </p>

          <div
            className="wish-box"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              padding: '20px 22px',
              borderRadius: '18px',
              background:
                'linear-gradient(180deg, #f8fbff 0%, #f4f8fd 100%)',
              border: '1px solid rgba(47, 98, 220, 0.10)',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2f62dc',
                boxShadow: '0 10px 24px rgba(47, 98, 220, 0.10)',
                flexShrink: 0,
              }}
            >
              <Gift size={21} />
            </div>

            <div>
              <small
                style={{
                  display: 'block',
                  color: '#718098',
                  fontWeight: 600,
                  marginBottom: '6px',
                }}
              >
                {wish.nickname} is wishing for
              </small>

              <ul
                style={{
                  margin: 0,
                  paddingLeft: '18px',
                  color: '#17243a',
                  fontSize: '1.06rem',
                  fontWeight: 700,
                }}
              >
                {wish.wishItems.map((item) => (
                  <li key={item} style={{ marginBottom: '4px' }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {campaignConcluded && (
            <div style={statePanelStyle('#fff7f1', '#f5d8bc')}>
              <LockKeyhole style={{ color: '#a7641f', flexShrink: 0 }} />
              <div>
                <h3 style={stateTitleStyle}>
                  This giving campaign has concluded.
                </h3>
                <p style={stateTextStyle}>
                  Thank you for supporting MIDSA WishLink. This ornament belongs
                  to a previous giving period and can no longer be reserved.
                </p>
              </div>
            </div>
          )}

          {campaignUpcoming && (
            <div style={statePanelStyle('#f9fbff', '#dce8ff')}>
              <CalendarClock style={{ color: '#2f62dc', flexShrink: 0 }} />
              <div>
                <h3 style={stateTitleStyle}>
                  This campaign is not open yet.
                </h3>
                <p style={stateTextStyle}>
                  This wish is already prepared, but reservations will open when the MIDSA giving campaign begins.
                </p>
              </div>
            </div>
          )}

          {!campaignConcluded &&
            !campaignUpcoming &&
            wish.status === 'available' &&
            wish.reservationsAllowed && (
              <>
                <p
                  className="quote"
                  style={{
                    margin: '6px 0 22px',
                    fontSize: '1.05rem',
                    fontStyle: 'italic',
                    color: '#55667f',
                    textAlign: 'center',
                  }}
                >
                  “The best gifts are the ones that make someone feel
                  remembered.”
                </p>

                <button
                  className="primary-button jumbo"
                  onClick={() => navigate(`/wish/${code}/grant`)}
                  style={{
                    width: '100%',
                    minHeight: '56px',
                    borderRadius: '14px',
                    border: 'none',
                    background:
                      'linear-gradient(135deg, #2f62dc 0%, #325bd0 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    boxShadow: '0 16px 34px rgba(47, 98, 220, 0.22)',
                    cursor: 'pointer',
                  }}
                >
                  <HeartHandshake size={20} />
                  <span>I’d like to grant {wish.nickname}’s wish</span>
                </button>
              </>
            )}

          {!campaignConcluded && !campaignUpcoming && reserved && (
            <div style={statePanelStyle('#fffdf5', '#f0e4b6')}>
              <CalendarClock style={{ color: '#9e7b08', flexShrink: 0 }} />
              <div>
                <h3 style={stateTitleStyle}>
                  A Secret Santa is already preparing this wish.
                </h3>
                <p style={stateTextStyle}>
                  If the gift is not completed by the current commitment date,
                  this wish may become available again. You can check back in
                  about{' '}
                  <strong>
                    {wish.daysRemaining} day
                    {wish.daysRemaining === 1 ? '' : 's'}
                  </strong>
                  .
                </p>
              </div>
            </div>
          )}

          {granted && !campaignConcluded && (
            <div style={statePanelStyle('#f3fbf5', '#cce9d2')}>
              <Sparkles style={{ color: '#0f6a4c', flexShrink: 0 }} />
              <div>
                <h3 style={stateTitleStyle}>
                  This wish has found its Christmas magic.
                </h3>
                <p style={stateTextStyle}>
                  A Secret Santa has already delivered the gift. Thank you for
                  stopping by—another ornament on the tree may still be waiting
                  for you.
                </p>
              </div>
            </div>
          )}

          {paused && !campaignConcluded && !campaignUpcoming && (
            <div style={statePanelStyle('#faf7f7', '#ebd7d7')}>
              <LockKeyhole style={{ color: '#7d1718', flexShrink: 0 }} />
              <div>
                <h3 style={stateTitleStyle}>
                  This wish is temporarily unavailable.
                </h3>
                <p style={stateTextStyle}>
                  The MIDSA team is checking its details. Please choose another
                  ornament for now.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className="trust-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          marginTop: '16px',
          position: 'relative',
          zIndex: 1,
        }}
      >
      </div>
    </PublicFrame>
  );
}

function PublicFrame({ children }) {
  return (
    <div
      className="public-page"
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #18314d 0%, #23486e 36%, #2b3f63 68%, #40233a 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <SnowfallBackground />

      <div style={{ position: 'relative', zIndex: 1 }}>
         <header
                  style={{
                    minHeight:
                      '82px',
                    display:
                      'flex',
                    alignItems:
                      'center'
                  }}
                >
                  <div
                    style={{
                      width:
                        '100%',
                      maxWidth:
                        '1120px',
                      margin:
                        '0 auto',
                      padding:
                        '14px 24px',
                      display:
                        'flex',
                      alignItems:
                        'center',
                      gap:
                        '14px'
                    }}
                  >
                    <img
                      src={
                        logo
                      }
                      alt="MIDSA WishLink"
                      style={{
                        width:
                          '42px',
                        height:
                          '52px',
                        objectFit:
                          'contain'
                      }}
                    />
        
                    <div
                      style={{
                        width:
                          '1px',
                        height:
                          '26px',
                        background:
                          'rgba(255, 255, 255, 0.24)'
                      }}
                    />
        
                    <span
                      style={{
                        color:
                          'rgba(255, 255, 255, 0.88)',
                        fontSize:
                          '13px'
                      }}
                    >
                      Share a little wonder.
                    </span>
                  </div>
                </header>

        <main
          className="public-wrap"
          style={{
            width: '100%',
            maxWidth: '1120px',
            margin: '0 auto',
            padding: '18px 24px 40px',
          }}
        >
          {children}
        </main>

        <footer
          style={{
            textAlign: 'center',
            color: '#7c889b',
            fontSize: '13px',
            padding: '0 24px 26px',
          }}
        >
         #DasigMIDSA <br></br><i>Lagi't lagi para sa bayan.</i>
        </footer>
      </div>
    </div>
  );
}

function SnowfallBackground() {
  const flakes = useMemo(() => {
    return Array.from({ length: 28 }, (_, index) => ({
      id: index,
      left: `${Math.random() * 100}%`,
      size: `${12 + Math.random() * 14}px`,
      duration: `${10 + Math.random() * 10}s`,
      delay: `${Math.random() * 10}s`,
      opacity: 0.28 + Math.random() * 0.45,
      drift: `${(Math.random() - 0.5) * 120}px`,
    }));
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes wishlinkSnowfall {
            0% {
              transform: translate3d(0, -10vh, 0);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            100% {
              transform: translate3d(var(--snow-drift), 110vh, 0);
              opacity: 0.15;
            }
          }

          .wishlink-snow-layer {
            position: fixed;
            inset: 0;
            pointer-events: none;
            overflow: hidden;
            z-index: 0;
          }

          .wishlink-snowflake {
            position: absolute;
            top: -10vh;
            color: rgba(255, 255, 255, 0.95);
            text-shadow: 0 0 10px rgba(255,255,255,0.35);
            user-select: none;
            animation-name: wishlinkSnowfall;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
            will-change: transform, opacity;
          }
        `}
      </style>

      <div className="wishlink-snow-layer" aria-hidden="true">
        {flakes.map((flake) => (
          <span
            key={flake.id}
            className="wishlink-snowflake"
            style={{
              left: flake.left,
              fontSize: flake.size,
              opacity: flake.opacity,
              animationDuration: flake.duration,
              animationDelay: `-${flake.delay}`,
              ['--snow-drift']: flake.drift,
            }}
          >
            ❄
          </span>
        ))}
      </div>
    </>
  );
}

function statePanelStyle(background, borderColor) {
  return {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    padding: '18px 20px',
    borderRadius: '18px',
    background,
    border: `1px solid ${borderColor}`,
    marginTop: '8px',
  };
}

const stateTitleStyle = {
  margin: '0 0 6px',
  color: '#17243a',
  fontSize: '1rem',
};

const stateTextStyle = {
  margin: 0,
  color: '#55667f',
  lineHeight: 1.6,
};

const infoCardStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '14px',
  padding: '20px',
  borderRadius: '18px',
  background: '#ffffff',
  border: '1px solid rgba(15, 39, 71, 0.08)',
  boxShadow: '0 14px 34px rgba(15, 39, 71, 0.05)',
};

function infoIconWrapStyle(bg, color) {
  return {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: bg,
    color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };
}