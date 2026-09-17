import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Gift,
  Info,
  Mail,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { api, getErrorMessage } from '../utils/api';
import logo from '../assets/logo.png';

const empty = {
  fullName: '',
  email: '',
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

  const [step, setStep] = useState('form');

  const [verificationId, setVerificationId] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const [done, setDone] = useState(null);

  useEffect(() => {
    api
      .get(`/public/wishes/${code}`)
      .then((r) => {
        const loadedWish = r.data.wish;

        setWish(loadedWish);

        if (
          loadedWish.status !== 'available' ||
          !loadedWish.reservationsAllowed
        ) {
          navigate(`/wish/${code}`, {
            replace: true,
          });
        }
      })
      .catch((e) => {
        setError(getErrorMessage(e));
      });
  }, [code, navigate]);

  const update = (e) => {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const updatePhoneNumber = (e) => {
    const digitsOnly = e.target.value
      .replace(/\D/g, '')
      .slice(0, 12);

    setForm((current) => ({
      ...current,
      phoneNumber: digitsOnly,
    }));
  };

  function isValidPhoneNumber(phoneNumber) {
    return /^(09\d{9}|639\d{9})$/.test(phoneNumber);
  }

  async function requestVerification(e) {
    e.preventDefault();

    setSaving(true);
    setError('');

    if (!isValidPhoneNumber(form.phoneNumber)) {
      setError(
        'Please enter a valid Philippine mobile number using 09XXXXXXXXX or 639XXXXXXXXX.'
      );

      setSaving(false);
      return;
    }

    try {
      const response = await api.post(
        `/public/wishes/${code}/request-verification`,
        form
      );

      setVerificationId(response.data.verificationId);

      setVerificationEmail(response.data.email);

      setVerificationCode('');

      setStep('verify');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function verifyAndReserve(e) {
    e.preventDefault();

    setSaving(true);
    setError('');

    try {
      const cleanedCode = verificationCode
        .replace(/\D/g, '')
        .slice(0, 6);

      if (cleanedCode.length !== 6) {
        setError(
          'Please enter the 6-digit verification code.'
        );

        setSaving(false);
        return;
      }

      const response = await api.post(
        `/public/wishes/${code}/verify-reservation`,
        {
          verificationId,
          code: cleanedCode,
        }
      );

      setDone(response.data.wish);
      setStep('done');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  function changeEmail() {
    setStep('form');
    setVerificationId('');
    setVerificationEmail('');
    setVerificationCode('');
    setError('');
  }

  if (done) {
    return (
      <div className="public-page">
        <main className="public-wrap narrow">
          <div className="public-card success-card">
            <div className="confirmation-status">
              <div className="eyebrow confirmation-label">
                <CheckCircle2 size={16} />
                Reservation confirmed
              </div>
            </div>

            <h1>
              You’re {done.nickname}’s Secret Santa.
            </h1>

            <p>
              Your email has been verified and your reservation is
              confirmed. We also sent the reservation details to the
              email address you provided.
            </p>

            <div className="summary-box">
              <strong>Wish</strong>
              <span>
                {done.wishItems.join(', ')}
              </span>

              <strong>Latest drop-off</strong>
              <span>
                {new Date(
                  done.reservationExpiresAt
                ).toLocaleDateString()}
              </span>

              <strong>Drop-off</strong>
              <span>
                {done.organization.dropOffLocation}
              </span>

              <strong>Contact</strong>
              <span>
                {done.organization.contactEmail}
                {' · '}
                {done.organization.contactPhone}
              </span>
            </div>

            <button
              className="primary-button"
              onClick={() =>
                navigate(`/wish/${code}`)
              }
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
        <button
          className="text-button"
          onClick={() =>
            navigate(`/wish/${code}`)
          }
        >
          <ArrowLeft size={17} />
          Back to wish
        </button>

        <div className="mini-brand">
          <img
            className="mini-brand-logo"
            src={logo}
            alt="MIDSA WishLink"
          />
          MIDSA WishLink
        </div>
      </header>

      <main className="public-wrap two-col">
        <section className="public-card form-card">

          {step === 'form' && (
            <>
              <div className="eyebrow">
                Secret Santa details
              </div>

              <h1>
                Grant {wish?.nickname || 'this child'}’s wish.
              </h1>

              <p className="muted">
                We use these details only to coordinate the donation
                and follow up if needed.
              </p>

              <div className="privacy-note">
                <ShieldCheck size={18} />

                <p>
                  Any valid email address is accepted. We’ll send a
                  6-digit verification code to make sure you can access
                  the email before the wish is reserved.
                </p>
              </div>

              {error && (
                <div className="alert">
                  {error}
                </div>
              )}

              <form
                onSubmit={requestVerification}
                className="form-grid"
              >
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
                  Email address

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={update}
                    required
                    placeholder="you@example.com"
                  />
                </label>

                <label>
                  Active phone number

                  <input
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={updatePhoneNumber}
                    required
                    inputMode="numeric"
                    maxLength={12}
                    pattern="^(09\d{9}|639\d{9})$"
                    placeholder="09XXXXXXXXX or 639XXXXXXXXX"
                  />
                </label>

                <label>
                  Program / Affiliation

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
                    <option value="">
                      Select
                    </option>

                    <option>
                      1st Year
                    </option>

                    <option>
                      2nd Year
                    </option>

                    <option>
                      3rd Year
                    </option>

                    <option>
                      4th Year
                    </option>

                    <option>
                      5th Year+
                    </option>

                    <option>
                      Graduate Student
                    </option>

                    <option>
                      Alumni
                    </option>

                    <option>
                      Faculty / Staff
                    </option>

                    <option>
                      Other
                    </option>
                  </select>
                </label>

                <label>
                  Name on gift?

                  <select
                    name="giftNamePreference"
                    value={
                      form.giftNamePreference
                    }
                    onChange={update}
                  >
                    <option value="anonymous">
                      Keep me anonymous
                    </option>

                    <option value="name">
                      You may put my name
                    </option>
                  </select>
                </label>

                <div className="deadline-callout span-2">
                  <CalendarDeadline
                    date={
                      wish?.proposedReservationExpiresAt
                    }
                  />
                </div>

                <div className="privacy-note span-2">
                  <Info size={18} />

                  <p>
                    Your wish is not reserved yet. We’ll first send a
                    verification code to your email. The reservation
                    becomes final only after the code is successfully
                    verified.
                  </p>
                </div>

                <button
                  className="primary-button span-2"
                  disabled={saving}
                >
                  <Mail size={18} />

                  {saving
                    ? 'Sending verification code…'
                    : 'Continue and verify email'}
                </button>
              </form>
            </>
          )}

          {step === 'verify' && (
            <>
              <div className="eyebrow">
                Email verification
              </div>

              <h1>
                Check your inbox.
              </h1>

              <p className="muted">
                We sent a 6-digit verification code to:
              </p>

              <div
                style={{
                  marginBottom: '20px',
                  fontWeight: 700,
                  wordBreak: 'break-word',
                }}
              >
                {verificationEmail}
              </div>

              <div className="privacy-note">
                <ShieldCheck size={18} />

                <p>
                  Enter the code below to confirm that this email
                  belongs to you. The code expires in 10 minutes.
                </p>
              </div>

              {error && (
                <div className="alert">
                  {error}
                </div>
              )}

              <form
                onSubmit={verifyAndReserve}
                className="form-grid"
              >
                <label className="span-2">
                  Verification code

                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => {
                      const value =
                        e.target.value
                          .replace(/\D/g, '')
                          .slice(0, 6);

                      setVerificationCode(value);
                    }}
                    required
                    placeholder="000000"
                    style={{
                      textAlign: 'center',
                      fontSize: '26px',
                      letterSpacing: '8px',
                      fontWeight: 700,
                    }}
                  />
                </label>

                <button
                  className="primary-button span-2"
                  disabled={saving}
                >
                  <CheckCircle2 size={18} />

                  {saving
                    ? 'Verifying…'
                    : `Verify and reserve ${wish?.nickname || 'this wish'}`}
                </button>

                <button
                  type="button"
                  className="text-button span-2"
                  onClick={changeEmail}
                  disabled={saving}
                  style={{
                    justifyContent: 'center',
                  }}
                >
                  Change email address
                </button>
              </form>
            </>
          )}
        </section>

        <aside className="side-summary">
          <div className="wish-box">
            <Gift />

            <div>
              <small>
                Wish
              </small>

              <ul>
                {wish?.wishItems.map((x) => (
                  <li key={x}>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="contact-card">
            <MapPin />

            <div>
              <strong>
                Gift drop-off
              </strong>

              <p>
                {wish?.organization.dropOffLocation}
              </p>

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
        <small>
          Your latest drop-off date
        </small>

        <strong>
          {new Date(date).toLocaleDateString()}
        </strong>

        <span>
          If you later need an extension, contact MIDSA before this date.
        </span>
      </div>
    </div>
  );
}