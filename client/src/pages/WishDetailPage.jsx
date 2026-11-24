import { holidayCampaignName } from '../utils/holidayCopy';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CalendarClock,
  CheckCircle2,
  Download,
  ExternalLink,
  Gift,
  RefreshCcw,
  Shield,
} from 'lucide-react';
import QrGiftTag from '../components/QrGiftTag';
import { downloadQrTag } from '../utils/downloadQrTag';
import { api, getErrorMessage } from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import ChildProfileFields from '../components/ChildProfileFields';

export default function WishDetailPage() {
  const { id } = useParams();

  const [wish, setWish] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deadline, setDeadline] = useState('');
  const [childProfile, setChildProfile] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [details, setDetails] = useState({ nickname: '', ageGroup: '', partnerFoundation: '', notes: '' });

  async function load() {
    try {
      setError('');

      const response = await api.get(
        `/officer/wishes/${id}`
      );

      const loadedWish =
        response.data.wish;

      setWish(loadedWish);
      setDetails({ nickname: loadedWish.nickname || '', ageGroup: loadedWish.ageGroup || '', partnerFoundation: loadedWish.partnerFoundation || '', notes: loadedWish.notes || '' });
      setChildProfile(loadedWish.childProfile || {});

      if (
        loadedWish.reservationExpiresAt
      ) {
        setDeadline(
          toLocalInput(
            loadedWish.reservationExpiresAt
          )
        );
      }
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  const publicUrl =
    useMemo(() => {
      if (!wish) {
        return '';
      }

      return `${
        import.meta.env
          .VITE_PUBLIC_APP_URL ||
        window.location.origin
      }/wish/${wish.ornamentCode}`;
    }, [wish]);

  async function saveDetails(event) {
    event.preventDefault();
    setSavingDetails(true);
    setError('');
    setNotice('');
    try {
      const response = await api.patch(`/officer/wishes/${id}`, details);
      setWish(response.data.wish);
      setEditingDetails(false);
      setNotice('Wish details saved.');
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setSavingDetails(false); }
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSavingProfile(true);
    setError('');
    setNotice('');
    try {
      const response = await api.patch(`/officer/wishes/${id}`, { childProfile });
      if ((response.data.wish.childProfile?.worksheetImage || '') !== (childProfile.worksheetImage || '')) {
        throw new Error('The server did not save the worksheet image. Keep this page open and try saving again.');
      }
      await load();
      setNotice(childProfile.worksheetImage ? 'Wishlist and worksheet image saved. The image is available on the public wish page.' : 'Wishlist details saved.');
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setSavingProfile(false); }
  }

  async function updateStatus(
    newStatus
  ) {
    try {
      setError('');
      setNotice('');

      const response = await api.patch(
        `/officer/wishes/${id}/status`,
        {
          status:
            newStatus,
        }
      );

      await load();
      if (newStatus === 'available') {
        const messages = {
          accepted: 'Reservation released. The email provider accepted the donor notification; delivery may take a few minutes.',
          failed: 'Reservation released, but the donor email could not be sent. Check the server logs for the email provider error.',
          missing_email: 'Reservation released, but no donor email address was saved for this reservation.',
          not_configured: 'Reservation released, but email sending is not configured on the server.'
        };
        setNotice(messages[response.data.releaseEmail?.status] || 'Reservation released. This server did not report an email result; ensure the latest backend is running.');
      }
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    }
  }

  async function extendDeadline() {
    try {
      setError('');

      await api.patch(
        `/officer/wishes/${id}/deadline`,
        {
          reservationExpiresAt:
            new Date(
              deadline
            ).toISOString(),

          note:
            'Deadline adjusted after donor communication.',
        }
      );

      await load();
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    }
  }
  async function downloadQrPng() {
    try {
      setError('');
      await downloadQrTag(
        document.getElementById('wish-qr-tag'),
        `wishlink-${wish.nickname}-qr-tag.png`.replace(/[^a-zA-Z0-9._-]+/g, '-').toLowerCase()
      );
    } catch (err) {
      setError(err.message || 'QR tag could not be downloaded.');
    }
  }
  if (!wish) {
    return (
      <div className="page">
        {error ||
          'Loading wish…'}
      </div>
    );
  }

  return (
    <div className="page">

      <div className="page-head">
        <div>
          <div className="eyebrow">
            {holidayCampaignName(wish.campaign?.name) ||
              'Unassigned campaign'}
            {' · '}
            Wish #{wish.ornamentCode}
          </div>

          <h1>
            {wish.nickname}
          </h1>

          <div
            className="inline"
            style={{
              display:
                'flex',

              alignItems:
                'center',

              gap:
                '10px',
            }}
          >
            <div
              style={{
                display:
                  'inline-flex',

                alignItems:
                  'center',
              }}
            >
              <StatusBadge
                status={
                  wish.status
                }
              />
            </div>

            <a
              className="text-button"
              href={`/wish/${wish.ornamentCode}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display:
                  'inline-flex',

                alignItems:
                  'center',

                gap:
                  '6px',

                margin:
                  0,
              }}
            >
              <ExternalLink
                size={15}
              />

              Public page
            </a>
          </div>
        </div>

        <button
          className="primary-button"
          onClick={
            downloadQrPng
          }
        >
          <Download
            size={17}
          />

          Download QR tag PNG
        </button>
      </div>

      {notice && <div className="alert" role="status">{notice}</div>}
      {error && (
        <div className="alert">
          {error}
        </div>
      )}

      <style>{`
        .wish-details-editor { display: grid; gap: 14px; }
        .wish-details-editor label { display: grid; gap: 6px; font-weight: 600; }
        .wish-details-editor input, .wish-details-editor textarea { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid #c9d9cd; border-radius: 8px; font: inherit; }
        .wish-details-actions { display: flex; align-items: center; gap: 14px; }
      `}</style>
      <div className="detail-grid">

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>
                Wish details
              </h2>
            </div>
            {!editingDetails && <button type="button" className="text-button" onClick={() => { setError(''); setNotice(''); setDetails({ nickname: wish.nickname || '', ageGroup: wish.ageGroup || '', partnerFoundation: wish.partnerFoundation || '', notes: wish.notes || '' }); setEditingDetails(true); }}>Edit details</button>}
          </div>

          {editingDetails ? (
            <form className="wish-details-editor" onSubmit={saveDetails}>
              <label>Nickname<input required value={details.nickname} onChange={event => setDetails({ ...details, nickname: event.target.value })} /></label>
              <label>Age group<input value={details.ageGroup} onChange={event => setDetails({ ...details, ageGroup: event.target.value })} /></label>
              <label>Partner foundation<input required value={details.partnerFoundation} onChange={event => setDetails({ ...details, partnerFoundation: event.target.value })} /></label>
              <label>Officer notes<textarea rows="4" value={details.notes} onChange={event => setDetails({ ...details, notes: event.target.value })} /></label>
              <div className="wish-details-actions"><button type="submit" className="primary-button" disabled={savingDetails}>{savingDetails ? 'Saving?' : 'Save details'}</button><button type="button" className="text-button" disabled={savingDetails} onClick={() => setEditingDetails(false)}>Cancel</button></div>
            </form>
          ) : <dl className="details">

            <div>
              <dt>
                Campaign
              </dt>

              <dd>
                {holidayCampaignName(wish.campaign?.name) ||
                  'Unassigned'}
              </dd>
            </div>

            <div>
              <dt>
                Nickname
              </dt>

              <dd>
                {wish.nickname}
              </dd>
            </div>

            <div>
              <dt>
                Partner foundation
              </dt>

              <dd>
                {wish.partnerFoundation}
              </dd>
            </div>

            <div>
              <dt>
                Age group
              </dt>

              <dd>
                {wish.ageGroup ||
                  'Not specified'}
              </dd>
            </div>

            <div>
              <dt>
                Wish
              </dt>

              <dd>
                {wish.childProfile?.worksheetImage ? 'See the worksheet image below' : 'No worksheet image added yet'}
              </dd>
            </div>

            <div>
              <dt>
                Officer notes
              </dt>

              <dd>
                {wish.notes ||
                  '—'}
              </dd>
            </div>

          </dl>}
        </section>

        <aside className="panel ornament-preview qr-tag-preview" aria-label="Printable QR gift tag">
          <QrGiftTag value={publicUrl} nickname={wish.nickname} code={wish.ornamentCode} />
          <p className="qr-tag-hint">Download the PNG to print this tag.</p>
        </aside>

      </div>

      <section className="panel">
        <div className="panel-head"><div><h2>Wishlist & worksheet image</h2><p>Donors see the worksheet image and may choose any gift within their budget.</p></div></div>
        <form className="child-profile-editor" onSubmit={saveProfile}>
          <ChildProfileFields value={childProfile} onChange={setChildProfile} />
          <button type="submit" className="primary-button" disabled={savingProfile}>{savingProfile ? 'Saving…' : 'Save wishlist & donor profile'}</button>
          {notice && <p role="status">{notice}</p>}
          {error && <div className="alert" role="alert">{error}</div>}
        </form>
      </section>

      {wish.donor && (
        <div className="panel">

          <div className="panel-head">
            <div>
              <h2>
                holiday donor commitment
              </h2>

              <p>
                Private operational details.
                Never shown on the public QR
                page.
              </p>
            </div>
          </div>

          <div className="donor-grid">

            <div>
              <small>
                Donor
              </small>

              <strong>
                {wish.donor.fullName}
              </strong>

              <span>
                {wish.donor.email}
                <br />
                {wish.donor.phoneNumber}
              </span>
            </div>

            <div>
              <small>
                Academic info
              </small>

              <strong>
                {wish.donor.program}
              </strong>

              <span>
                {wish.donor.yearLevel}
              </span>
            </div>

            <div>
              <small>
                Gift tag preference
              </small>

              <strong>
                {wish.donor
                  .giftNamePreference ===
                'name'
                  ? 'May show donor name'
                  : 'Anonymous'}
              </strong>
            </div>

            <div>
              <small>Scheduled drop-off</small>
              <strong>{wish.donor.scheduledDropOffAt
                ? new Date(wish.donor.scheduledDropOffAt).toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' })
                : 'Not scheduled'}</strong>
            </div>

            <div>
              <small>
                Current deadline
              </small>

              <strong>
                {wish.reservationExpiresAt
                  ? new Date(
                      wish.reservationExpiresAt
                    ).toLocaleDateString()
                  : '—'}
              </strong>
            </div>

          </div>

          {wish.status ===
            'reserved' && (
            <div className="deadline-row">

              <label>
                Adjust drop-off deadline

                <input
                  type="datetime-local"
                  value={
                    deadline
                  }
                  onChange={(
                    event
                  ) =>
                    setDeadline(
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <button
                className="secondary-button"
                onClick={
                  extendDeadline
                }
              >

                Save extension
              </button>

              <button
                className="success-button"
                onClick={() =>
                  updateStatus(
                    'granted'
                  )
                }
              >

                Gift dropped off
              </button>

              <button
                className="ghost-button"
                onClick={() =>
                  updateStatus(
                    'available'
                  )
                }
              >

                Release reservation
              </button>

            </div>
          )}

        </div>
      )}

      {!wish.donor &&
        wish.status ===
          'available' && (
          <div className="panel compact-panel">

            <Gift />

            <div>
              <h3>
                This ornament is open.
              </h3>

              <p>
                The QR can be scanned by
                a holiday donor.
              </p>
            </div>

            <button
              className="ghost-button"
              onClick={() =>
                updateStatus(
                  'paused'
                )
              }
            >
              <Shield
                size={16}
              />

              Temporarily hide
            </button>

          </div>
        )}

      {wish.status ===
        'paused' && (
        <div className="panel compact-panel">

          <Shield />

          <div>
            <h3>
              Public reservation is paused.
            </h3>

            <p>
              Reopen it when the wish is
              ready again.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={() =>
              updateStatus(
                'available'
              )
            }
          >
            Reopen wish
          </button>

        </div>
      )}

      <div className="panel">

        <div className="panel-head">
          <div>
            <h2>
              Activity trail
            </h2>

            <p>
              Audit history for officer
              accountability.
            </p>
          </div>
        </div>

        <div className="timeline">
          {[...wish.history]
            .reverse()
            .map(
              (
                historyItem,
                index
              ) => (
                <div key={index}>
                  <span />

                  <div>
                    <strong>
                      {pretty(
                        historyItem.action
                      )}
                    </strong>

                    <p>
                      {historyItem.note ||
                        `${
                          historyItem.fromStatus ||
                          ''
                        } → ${
                          historyItem.toStatus ||
                          ''
                        }`}
                    </p>

                    <small>
                      {historyItem.actorName ||
                        'System'}
                      {' · '}
                      {new Date(
                        historyItem.at
                      ).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              )
            )}
        </div>

      </div>

    </div>
  );
}

function pretty(value) {
  return value
    .replaceAll(
      '_',
      ' '
    )
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function toLocalInput(value) {
  const date =
    new Date(value);

  const pad = (
    number
  ) =>
    String(number).padStart(
      2,
      '0'
    );

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(
    date.getDate()
  )}T${pad(
    date.getHours()
  )}:${pad(
    date.getMinutes()
  )}`;
}
