import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  Gift,
  Printer,
  RefreshCcw,
  Shield,
  Sparkles,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { api, getErrorMessage } from '../utils/api';
import StatusBadge from '../components/StatusBadge';

export default function WishDetailPage() {
  const { id } = useParams();

  const [wish, setWish] = useState(null);
  const [error, setError] = useState('');
  const [deadline, setDeadline] = useState('');

  async function load() {
    try {
      setError('');

      const response = await api.get(`/officer/wishes/${id}`);
      const loadedWish = response.data.wish;

      setWish(loadedWish);

      if (loadedWish.reservationExpiresAt) {
        setDeadline(toLocalInput(loadedWish.reservationExpiresAt));
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  const publicUrl = useMemo(() => {
    if (!wish) return '';

    return `${
      import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin
    }/wish/${wish.ornamentCode}`;
  }, [wish]);

  async function updateStatus(newStatus) {
    try {
      setError('');

      await api.patch(`/officer/wishes/${id}/status`, {
        status: newStatus,
      });

      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function extendDeadline() {
    try {
      setError('');

      await api.patch(`/officer/wishes/${id}/deadline`, {
        reservationExpiresAt: new Date(deadline).toISOString(),
        note: 'Deadline adjusted after donor communication.',
      });

      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (!wish) {
    return (
      <div className="page">
        {error || 'Loading wish…'}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">
            {wish.campaign?.name || 'Unassigned campaign'} · Wish #{wish.ornamentCode}
          </div>

          <h1>{wish.nickname}</h1>

          <div
            className="inline"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <StatusBadge status={wish.status} />
            </div>

            <a
              className="text-button"
              href={`/wish/${wish.ornamentCode}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                margin: 0,
              }}
            >
              <ExternalLink size={15} />
              Public page
            </a>
          </div>
        </div>

        <button
          className="primary-button"
          onClick={() => window.print()}
        >
          <Printer size={17} />
          Print ornament
        </button>
      </div>

      {error && (
        <div className="alert">
          {error}
        </div>
      )}

      <div className="detail-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Wish details</h2>
            </div>
          </div>

          <dl className="details">
            <div>
              <dt>Campaign</dt>
              <dd>{wish.campaign?.name || 'Unassigned'}</dd>
            </div>

            <div>
              <dt>Nickname</dt>
              <dd>{wish.nickname}</dd>
            </div>

            <div>
              <dt>Partner foundation</dt>
              <dd>{wish.partnerFoundation}</dd>
            </div>

            <div>
              <dt>Age group</dt>
              <dd>{wish.ageGroup || 'Not specified'}</dd>
            </div>

            <div>
              <dt>Wish</dt>
              <dd>{wish.wishItems.join(', ')}</dd>
            </div>

            <div>
              <dt>Officer notes</dt>
              <dd>{wish.notes || '—'}</dd>
            </div>
          </dl>
        </section>

        <aside className="panel ornament-preview printable-ornament">
         {/* <div className="ornament-front">
            <div className="small-brand">
              MIDSA WishLink
            </div>

            <Sparkles size={24} />

            <h2>{wish.nickname}</h2>

            <p>wishes for</p>

            <ul>
              {wish.wishItems.map((item) => (
                <li key={item}>
                  {item}
                </li>
              ))}
            </ul>

            <small>
              Pick this ornament. Scan the QR at the back to
              grant this wish.
            </small>
          </div> */}
          

          <div className="ornament-back">
            <QRCodeSVG
              value={publicUrl}
              size={180}
              level="M"
            />

            <strong>
              Scan to grant {wish.nickname}’s wish
            </strong>

            <small>
              #{wish.ornamentCode}
            </small>
          </div>
        </aside>
      </div>

      {wish.donor && (
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Secret Santa commitment</h2>
              <p>
                Private operational details. Never shown on the
                public QR page.
              </p>
            </div>
          </div>

          <div className="donor-grid">
            <div>
              <small>Donor</small>

              <strong>
                {wish.donor.fullName}
              </strong>

              <span>
                {wish.donor.universityEmail}
                <br />
                {wish.donor.phoneNumber}
              </span>
            </div>

            <div>
              <small>Academic info</small>

              <strong>
                {wish.donor.program}
              </strong>

              <span>
                {wish.donor.yearLevel}
              </span>
            </div>

            <div>
              <small>Gift tag preference</small>

              <strong>
                {wish.donor.giftNamePreference === 'name'
                  ? 'May show donor name'
                  : 'Anonymous'}
              </strong>
            </div>

            <div>
              <small>Current deadline</small>

              <strong>
                {wish.reservationExpiresAt
                  ? new Date(
                      wish.reservationExpiresAt
                    ).toLocaleDateString()
                  : '—'}
              </strong>
            </div>
          </div>

          {wish.status === 'reserved' && (
            <div className="deadline-row">
              <label>
                Adjust drop-off deadline

                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(event) =>
                    setDeadline(event.target.value)
                  }
                />
              </label>

              <button
                className="secondary-button"
                onClick={extendDeadline}
              >
                <CalendarClock size={17} />
                Save extension
              </button>

              <button
                className="success-button"
                onClick={() =>
                  updateStatus('granted')
                }
              >
                <CheckCircle2 size={17} />
                Gift dropped off
              </button>

              <button
                className="ghost-button"
                onClick={() =>
                  updateStatus('available')
                }
              >
                <RefreshCcw size={17} />
                Release reservation
              </button>
            </div>
          )}
        </div>
      )}

      {!wish.donor &&
        wish.status === 'available' && (
          <div className="panel compact-panel">
            <Gift />

            <div>
              <h3>This ornament is open.</h3>
              <p>
                The QR can be scanned by a secret santa.
              </p>
            </div>

            <button
              className="ghost-button"
              onClick={() =>
                updateStatus('paused')
              }
            >
              <Shield size={16} />
              Temporarily hide
            </button>
          </div>
        )}

      {wish.status === 'paused' && (
        <div className="panel compact-panel">
          <Shield />

          <div>
            <h3>
              Public reservation is paused.
            </h3>

            <p>
              Reopen it when the wish is ready again.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={() =>
              updateStatus('available')
            }
          >
            Reopen wish
          </button>
        </div>
      )}

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Activity trail</h2>

            <p>
              Audit history for officer accountability.
            </p>
          </div>
        </div>

        <div className="timeline">
          {[...wish.history]
            .reverse()
            .map((historyItem, index) => (
              <div key={index}>
                <span />

                <div>
                  <strong>
                    {pretty(historyItem.action)}
                  </strong>

                  <p>
                    {historyItem.note ||
                      `${
                        historyItem.fromStatus || ''
                      } → ${
                        historyItem.toStatus || ''
                      }`}
                  </p>

                  <small>
                    {historyItem.actorName || 'System'}
                    {' · '}
                    {new Date(
                      historyItem.at
                    ).toLocaleDateString()}
                  </small>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function pretty(value) {
  return value
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      (character) => character.toUpperCase()
    );
}

function toLocalInput(value) {
  const date = new Date(value);

  const pad = (number) =>
    String(number).padStart(2, '0');

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}