import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Gift,
  Info,
  MapPin,
} from 'lucide-react';
import { api, getErrorMessage } from '../utils/api';
import logo from '../assets/logo.png';

const empty = {
  fullName: '',
  universityEmail: '',
  phoneNumber: '',
  program: '',
  yearLevel: '',
  giftNamePreference: 'anonymous',
};

export default function GrantWishPage() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [wish, setWish] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    api
      .get(`/public/wishes/${code}`)
      .then((r) => {
        setWish(r.data.wish);
        if (r.data.wish.status !== 'available' || !r.data.wish.reservationsAllowed) {
          navigate(`/wish/${code}`, { replace: true });
        }
      })
      .catch((e) => setError(getErrorMessage(e)));
  }, [code, navigate]);

  const update = (e) =>
    setForm((v) => ({ ...v, [e.target.name]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const r = await api.post(`/public/wishes/${code}/reserve`, form);
      setDone(r.data.wish);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="public-page">
        <main className="public-wrap narrow">
          <div className="public-card success-card">
           <div className="confirmation-status">
            <div className="eyebrow confirmation-label">
              Reservation confirmed
            </div>
          </div>
            <h1>You’re {done.nickname}’s Secret Santa.</h1>
            <p>
              We sent a confirmation to the email and phone number you provided.
              Your gift is reserved until the listed drop-off deadline.
            </p>

            <div className="summary-box">
              <strong>Wish</strong>
              <span>{done.wishItems.join(', ')}</span>

              <strong>Latest drop-off</strong>
              <span>{new Date(done.reservationExpiresAt).toLocaleDateString()}</span>

              <strong>Drop-off</strong>
              <span>{done.organization.dropOffLocation}</span>

              <strong>Contact</strong>
              <span>
                {done.organization.contactEmail} · {done.organization.contactPhone}
              </span>
            </div>

            <button
              className="primary-button"
              onClick={() => navigate(`/wish/${code}`)}
            >
              View wish page
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="public-page">
      <header className="public-header">
        <button className="text-button" onClick={() => navigate(`/wish/${code}`)}>
          <ArrowLeft size={17} /> Back to wish
        </button>
        <div className="mini-brand">
          <img className="mini-brand-logo" src={logo} alt="MIDSA WishLink" />
          MIDSA WishLink
        </div>
      </header>

      <main className="public-wrap two-col">
        <section className="public-card form-card">
          <div className="eyebrow">Secret Santa details</div>
          <h1>Grant {wish?.nickname || 'this child'}’s wish.</h1>
          <p className="muted">
            We use these details only to coordinate the donation and follow up if
            needed.
          </p>

          {error && <div className="alert">{error}</div>}

          <form onSubmit={submit} className="form-grid">
            <label className="span-2">
              Full name
              <input
                name="fullName"
                value={form.fullName}
                onChange={update}
                required
              />
            </label>

            <label className="span-2">
              University email
              <input
                type="email"
                name="universityEmail"
                value={form.universityEmail}
                onChange={update}
                required
                placeholder="firstname.lastname@msuiit.edu.ph"
              />
            </label>

            <label>
              Active phone number
              <input
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={update}
                required
                placeholder="+63 900 000 0000"
              />
            </label>

            <label>
              Program
              <input
                name="program"
                value={form.program}
                onChange={update}
                required
                placeholder="BS Information Technology"
              />
            </label>

            <label>
              Year level
              <select
                name="yearLevel"
                value={form.yearLevel}
                onChange={update}
                required
              >
                <option value="">Select</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
                <option>5th Year+</option>
                <option>Graduate Student</option>
              </select>
            </label>

            <label>
              Name on gift?
              <select
                name="giftNamePreference"
                value={form.giftNamePreference}
                onChange={update}
              >
                <option value="anonymous">Keep me anonymous</option>
                <option value="name">You may put my name</option>
              </select>
            </label>

            <div className="deadline-callout span-2">
              <CalendarDeadline date={wish?.proposedReservationExpiresAt} />
            </div>

            <div className="privacy-note span-2">
              <Info size={18} />
              <p>
                By confirming, you’re reserving this wish for a limited period.
                If the gift is not dropped off by the deadline and MIDSA has not
                approved an extension, WishLink will automatically reopen it for
                another donor.
              </p>
            </div>

            <button className="primary-button span-2" disabled={saving}>
              {saving
                ? 'Confirming…'
                : `Confirm my promise to ${wish?.nickname || 'this child'}`}
            </button>
          </form>
        </section>

        <aside className="side-summary">
          <div className="wish-box">
            <Gift />
            <div>
              <small>Wish</small>
              <ul>
                {wish?.wishItems.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="contact-card">
            <MapPin />
            <div>
              <strong>Gift drop-off</strong>
              <p>{wish?.organization.dropOffLocation}</p>
              <small>
                {wish?.organization.contactEmail}
                <br />
                {wish?.organization.contactPhone}
              </small>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function CalendarDeadline({ date }) {
  if (!date) return null;

  return (
    <div className="deadline-callout-inner">
      <CalendarClock size={20} />
      <div>
        <small>Your latest drop-off date</small>
        <strong>{new Date(date).toLocaleDateString()}</strong>
        <span>
          If you later need an extension, contact MIDSA before this date.
        </span>
      </div>
    </div>
  );
}