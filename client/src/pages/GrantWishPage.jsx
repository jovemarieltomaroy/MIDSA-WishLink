import {
  useEffect,
  useState
} from 'react';

import {
  useNavigate,
  useParams
} from 'react-router-dom';

import {
  ArrowLeft,
  CalendarClock,
  Gift,
  Info,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  TreePine
} from 'lucide-react';

import {
  api,
  getErrorMessage
} from '../utils/api';

import PublicLayout from '../components/PublicLayout';
import WishlistImage from '../components/WishlistImage';

const empty = {
  fullName: '',
  email: '',
  phoneNumber: '',
  program: '',
  yearLevel: '',
  giftNamePreference: 'anonymous',
  scheduledDropOffAt: ''
};

export default function GrantWishPage() {
  const {
    code
  } = useParams();

  const navigate =
    useNavigate();

  const [
    wish,
    setWish
  ] = useState(null);

  const [
    form,
    setForm
  ] = useState(
    empty
  );

  const [
    error,
    setError
  ] = useState('');

  const [
    saving,
    setSaving
  ] = useState(false);

  const [
    step,
    setStep
  ] = useState('form');

  const [
    verificationId,
    setVerificationId
  ] = useState('');

  const [
    verificationEmail,
    setVerificationEmail
  ] = useState('');

  const [
    verificationCode,
    setVerificationCode
  ] = useState('');

  const [
    done,
    setDone
  ] = useState(null);

  useEffect(() => {
    api
      .get(
        `/public/wishes/${code}`
      )
      .then(
        (response) => {
          const loadedWish =
            response.data.wish;

          setWish(
            loadedWish
          );

          if (
            loadedWish.status !==
              'available' ||
            !loadedWish
              .reservationsAllowed
          ) {
            navigate(
              `/wish/${code}`,
              {
                replace:
                  true
              }
            );
          }
        }
      )
      .catch(
        (err) => {
          setError(
            getErrorMessage(
              err
            )
          );
        }
      );
  }, [
    code,
    navigate
  ]);

  function update(
    event
  ) {
    setForm(
      (current) => ({
        ...current,

        [event.target.name]:
          event.target.value
      })
    );

    if (error) {
      setError('');
    }
  }

  function updatePhoneNumber(
    event
  ) {
    const digitsOnly =
      event.target.value
        .replace(
          /\D/g,
          ''
        )
        .slice(
          0,
          12
        );

    setForm(
      (current) => ({
        ...current,

        phoneNumber:
          digitsOnly
      })
    );

    if (error) {
      setError('');
    }
  }

  function isValidPhoneNumber(
    phoneNumber
  ) {
    return /^(09\d{9}|639\d{9})$/.test(
      phoneNumber
    );
  }

  async function requestVerification(
    event
  ) {
    event.preventDefault();

    setSaving(
      true
    );

    setError('');

    if (!form.scheduledDropOffAt || !form.scheduledDropOffAt.includes('T')) {
      setError('Please choose a drop-off date and time.');
      setSaving(false);
      return;
    }

    if (
      !isValidPhoneNumber(
        form.phoneNumber
      )
    ) {
      setError(
        'Please enter a valid Philippine mobile number using 09XXXXXXXXX or 639XXXXXXXXX.'
      );

      setSaving(
        false
      );

      return;
    }

    try {
      const response =
        await api.post(
          `/public/wishes/${code}/request-verification`,
          { ...form, scheduledDropOffAt: `${form.scheduledDropOffAt}:00+08:00` }
        );

      setVerificationId(
        response.data
          .verificationId
      );

      setVerificationEmail(
        response.data.email
      );

      setVerificationCode(
        ''
      );

      setStep(
        'verify'
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err
        )
      );
    } finally {
      setSaving(
        false
      );
    }
  }

  async function verifyAndReserve(
    event
  ) {
    event.preventDefault();

    setSaving(
      true
    );

    setError('');

    try {
      const cleanedCode =
        verificationCode
          .replace(
            /\D/g,
            ''
          )
          .slice(
            0,
            6
          );

      if (
        cleanedCode.length !==
        6
      ) {
        setError(
          'Please enter the 6-digit verification code.'
        );

        setSaving(
          false
        );

        return;
      }

      const response =
        await api.post(
          `/public/wishes/${code}/verify-reservation`,
          {
            verificationId,

            code:
              cleanedCode
          }
        );

      setDone(
        response.data.wish
      );

      setStep(
        'done'
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err
        )
      );
    } finally {
      setSaving(
        false
      );
    }
  }

  function changeEmail() {
    setStep(
      'form'
    );

    setVerificationId(
      ''
    );

    setVerificationEmail(
      ''
    );

    setVerificationCode(
      ''
    );

    setError('');
  }

  if (!wish) {
    return <PublicLayout><main className="wish-message-card">
      <h1>{error ? 'Wish unavailable' : 'Loading your wish…'}</h1>
      <p role={error ? 'alert' : 'status'}>{error || 'Getting the reservation details.'}</p>
      {error && <button type="button" className="primary-button" onClick={() => navigate(`/wish/${code}`)}>Back to wish</button>}
    </main></PublicLayout>;
  }

  if (done) {
    return (
      <PublicLayout stage={done ? 'confirmed' : step === 'form' ? 'details' : 'verify'}>
        <main className="grant-public-main"
          style={{
            width: '100%',
            maxWidth: '780px',
            margin: '0 auto',
            padding: '30px 24px 52px',
            position: 'relative',
            zIndex: 1
          }}
        >
          <section
            style={{
              position: 'relative',
              overflow: 'hidden',
              background:
                  'linear-gradient(180deg, #fffaf0 0%, #ffffff 100%)',
              borderRadius: '28px',
              padding: '42px',
              boxShadow:
                '0 28px 70px rgba(4, 18, 36, 0.22)',
              border:
                '1px solid rgba(255, 255, 255, 0.55)',
              textAlign: 'center'
            }}
          >
            <FestiveTopLine />


            <div
              style={{
                display:
                  'inline-flex',
                alignItems:
                  'center',
                gap:
                  '7px',
                padding:
                  '7px 13px',
                borderRadius:
                  '999px',
                background:
                  '#edf8f0',
                color:
                  '#27663d',
                fontSize:
                  '12px',
                fontWeight:
                  700,
                marginBottom:
                  '16px'
              }}
            >
              <Sparkles
                size={14}
              />

              Reservation confirmed
            </div>

            <h1
              style={{
                margin:
                  '0 0 12px',
                color:
                  '#243e32',
                fontSize:
                  'clamp(2rem, 5vw, 2.8rem)'
              }}
            >
              You’re {done.nickname}’s holiday donor. Happy holidays!
            </h1>

            <p
              style={{
                color:
                  '#5a6b82',
                lineHeight:
                  1.7,
                maxWidth:
                  '580px',
                margin:
                  '0 auto 26px'
              }}
            >
              Your email has been verified and your reservation
              is confirmed. We also sent the reservation details
              to the email address you provided.
            </p>

            <div
              style={{
                display:
                  'grid',
                gap:
                  '12px',
                textAlign:
                  'left',
                padding:
                  '22px',
                borderRadius:
                  '18px',
                background:
                  '#f7f9fc',
                border:
                  '1px solid rgba(15, 39, 71, 0.08)',
                marginBottom:
                  '24px'
              }}
            >
              <SummaryRow
                label="Wish"
                value={
                  'Any gift you choose from the wishlist; no need to fulfill everything'
                }
              />

              <SummaryRow
                label="Scheduled drop-off (Philippine time)"
                value={new Date(`${form.scheduledDropOffAt}:00+08:00`).toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' })}
              />

              <SummaryRow
                label="Latest drop-off"
                value={
                  new Date(
                    done.reservationExpiresAt
                  ).toLocaleDateString(
                    'en-PH'
                  )
                }
              />

              <SummaryRow
                label="Drop-off"
                value={
                  done.organization
                    .dropOffLocation
                }
              />

              <SummaryRow
                label="Contact"
                value={<>{done.organization.contactEmail}{done.organization.messengerUrl && <> · <a href={done.organization.messengerUrl} target="_blank" rel="noreferrer">Message us on Messenger</a></>}</>}
              />
            </div>

            <button
              className="primary-button"
              onClick={() =>
                navigate(
                  `/wish/${code}`
                )
              }
              style={{
                minHeight:
                  '50px',
                padding:
                  '0 24px',
                borderRadius:
                  '13px',
                justifyContent:
                  'center'
              }}
            >
              View wish page
            </button>
          </section>
        </main>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout stage={done ? 'confirmed' : step === 'form' ? 'details' : 'verify'}>
      <main className="grant-public-main"
        style={{
          width: '100%',
          maxWidth: '1120px',
          margin: '0 auto',
          padding:
            '12px 24px 52px',
          position:
            'relative',
          zIndex: 1
        }}
      >
        <button
          type="button"
          onClick={() =>
            navigate(
              `/wish/${code}`
            )
          }
          style={{
            display:
              'inline-flex',
            alignItems:
              'center',
            gap:
              '7px',
            padding:
              '9px 12px',
            marginBottom:
              '16px',
            border:
              '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius:
              '10px',
            background:
              'rgba(255, 255, 255, 0.09)',
            color:
              '#ffffff',
            cursor:
              'pointer',
            backdropFilter:
              'blur(10px)'
          }}
        >
          <ArrowLeft
            size={17}
          />

          Back to wish
        </button>

        <div
          style={{
            display:
              'grid',
            gridTemplateColumns:
              'repeat(2, minmax(0, 1fr))',
            gap:
              '20px',
            alignItems:
              'start'
          }}
          className="grant-wish-layout"
        >
          <section
            style={{
              position:
                'relative',
              overflow:
                'hidden',
              background:
                  'linear-gradient(180deg, #fffaf0 0%, #ffffff 100%)',
              borderRadius:
                '28px',
              padding:
                '34px',
              border:
                '1px solid rgba(255, 255, 255, 0.55)',
              boxShadow:
                '0 28px 70px rgba(4, 18, 36, 0.22)'
            }}
          >
            <FestiveTopLine />

            {step ===
              'form' && (
              <>
                <div
                  style={{
                    display:
                      'inline-flex',
                    alignItems:
                      'center',
                    gap:
                      '7px',
                    padding:
                      '7px 12px',
                    borderRadius:
                      '999px',
                    background:
                      'rgba(15, 106, 76, 0.08)',
                    color:
                      '#0f6a4c',
                    fontWeight:
                      700,
                    fontSize:
                      '12px',
                    marginBottom:
                      '15px'
                  }}
                >
                  <TreePine
                    size={14}
                  />

                  Holiday donor details
                </div>

                <h1
                  style={{
                    margin:
                      '0 0 8px',
                    color:
                      '#243e32',
                    fontSize:
                      'clamp(2rem, 4vw, 2.7rem)'
                  }}
                >
                  Grant{' '}
                  <span
                    style={{
                      color:
                        '#086747'
                    }}
                  >
                    {wish?.nickname ||
                      'this child'}
                  </span>
                  ’s wish.
                </h1>

                <p
                  style={{
                    margin:
                      '0 0 22px',
                    color:
                      '#68735f',
                    lineHeight:
                      1.65
                  }}
                >
                  We use these details only to coordinate the
                  donation and follow up if needed.
                </p>

                <NoticeBox>
                  Any valid email address is accepted. We’ll send
                  a 6-digit verification code before the wish is
                  officially reserved.
                </NoticeBox>

                {error && (
                  <div
                    className="alert"
                    style={{
                      marginBottom:
                        '18px'
                    }}
                  >
                    {error}
                  </div>
                )}

                <form
                  onSubmit={
                    requestVerification
                  }
                  style={{
                    display:
                      'grid',
                    gridTemplateColumns:
                      'repeat(2, minmax(0, 1fr))',
                    gap:
                      '18px'
                  }}
                  className="grant-form-grid"
                >
                  <DropOffPicker value={form.scheduledDropOffAt} onChange={value => setForm(current => ({ ...current, scheduledDropOffAt: value }))} />

                  <ModernField
                    label="Full name"
                    name="fullName"
                    value={
                      form.fullName
                    }
                    onChange={
                      update
                    }
                    placeholder="Your full name"
                    span
                  />

                  <ModernField
                    label="Email address"
                    type="email"
                    name="email"
                    value={
                      form.email
                    }
                    onChange={
                      update
                    }
                    placeholder="you@example.com"
                    span
                  />

                  <ModernField
                    label="Active phone number"
                    name="phoneNumber"
                    value={
                      form.phoneNumber
                    }
                    onChange={
                      updatePhoneNumber
                    }
                    inputMode="numeric"
                    maxLength={12}
                    pattern="^(09\d{9}|639\d{9})$"
                    placeholder="09XXXXXXXXX"
                  />

                  <ModernField
                    label="Program / Affiliation"
                    name="program"
                    value={
                      form.program
                    }
                    onChange={
                      update
                    }
                    placeholder="BS Information Technology"
                  />

                  <ModernSelect
                    label="Year level"
                    name="yearLevel"
                    value={
                      form.yearLevel
                    }
                    onChange={
                      update
                    }
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
                  </ModernSelect>

                  <ModernSelect
                    label="Name on gift?"
                    name="giftNamePreference"
                    value={
                      form.giftNamePreference
                    }
                    onChange={
                      update
                    }
                  >
                    <option value="anonymous">
                      Keep me anonymous
                    </option>

                    <option value="name">
                      You may put my name
                    </option>
                  </ModernSelect>

                  <div
                    style={{
                      gridColumn:
                        '1 / -1'
                    }}
                  >
                    <CalendarDeadline
                      date={
                        wish?.proposedReservationExpiresAt
                      }
                    />
                  </div>

                  <div
                    style={{
                      gridColumn:
                        '1 / -1'
                    }}
                  >
                    <NoticeBox
                      icon={
                        <Info
                          size={18}
                        />
                      }
                    >
                      Your wish is not reserved yet. The
                      reservation becomes final only after the
                      verification code is successfully confirmed.
                    </NoticeBox>
                  </div>

                  <button
                    className="primary-button"
                    disabled={
                      saving
                    }
                    style={{
                      gridColumn:
                        '1 / -1',
                      minHeight:
                        '52px',
                      borderRadius:
                        '13px',
                      justifyContent:
                        'center',
                      fontSize:
                        '14px'
                    }}
                  >
                    <Mail
                      size={18}
                    />

                    {saving
                      ? 'Sending verification code…'
                      : 'Continue and verify email'}
                  </button>
                </form>
              </>
            )}

            {step ===
              'verify' && (
              <>
                <div
                  style={{
                    display:
                      'inline-flex',
                    alignItems:
                      'center',
                    gap:
                      '7px',
                    padding:
                      '7px 12px',
                    borderRadius:
                      '999px',
                    background:
                      '#e9efdf',
                    color:
                      '#086747',
                    fontWeight:
                      700,
                    fontSize:
                      '12px',
                    marginBottom:
                      '15px'
                  }}
                >
                  <Mail
                    size={14}
                  />

                  Email verification
                </div>

                <h1
                  style={{
                    margin:
                      '0 0 8px',
                    color:
                      '#243e32'
                  }}
                >
                  Check your inbox.
                </h1>

                <p
                  style={{
                    color:
                      '#65758b',
                    margin:
                      '0 0 8px'
                  }}
                >
                  We sent a 6-digit verification code to:
                </p>

                <strong
                  style={{
                    display:
                      'block',
                    marginBottom:
                      '20px',
                    color:
                      '#243e32',
                    wordBreak:
                      'break-word'
                  }}
                >
                  {verificationEmail}
                </strong>

                <NoticeBox
                >
                  Enter the code below to confirm that this email
                  belongs to you. The code expires in 10 minutes.
                </NoticeBox>

                {error && (
                  <div
                    className="alert"
                    style={{
                      marginBottom:
                        '18px'
                    }}
                  >
                    {error}
                  </div>
                )}

                <form
                  onSubmit={
                    verifyAndReserve
                  }
                >
                  <label
                    style={{
                      display:
                        'block',
                      fontWeight:
                        650,
                      color:
                        '#243e32',
                      marginBottom:
                        '8px'
                    }}
                  >
                    Verification code
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={
                      verificationCode
                    }
                    onChange={(
                      event
                    ) => {
                      const value =
                        event.target
                          .value
                          .replace(
                            /\D/g,
                            ''
                          )
                          .slice(
                            0,
                            6
                          );

                      setVerificationCode(
                        value
                      );

                      if (error) {
                        setError('');
                      }
                    }}
                    required
                    placeholder="000000"
                    style={{
                      width:
                        '100%',
                      minHeight:
                        '62px',
                      boxSizing:
                        'border-box',
                      border:
                        '1px solid #d6d4be',
                      borderRadius:
                        '14px',
                      background:
                        '#fdfaf1',
                      textAlign:
                        'center',
                      fontSize:
                        '28px',
                      letterSpacing:
                        '10px',
                      fontWeight:
                        800,
                      color:
                        '#243e32',
                      outline:
                        'none',
                      marginBottom:
                        '18px'
                    }}
                  />

                  <button
                    className="primary-button"
                    disabled={
                      saving
                    }
                    style={{
                      width:
                        '100%',
                      minHeight:
                        '52px',
                      justifyContent:
                        'center',
                      borderRadius:
                        '13px'
                    }}
                  >

                    {saving
                      ? 'Verifying…'
                      : `Verify and reserve ${
                          wish?.nickname ||
                          'this wish'
                        }`}
                  </button>

                  <button
                    type="button"
                    onClick={
                      changeEmail
                    }
                    disabled={
                      saving
                    }
                    style={{
                      width:
                        '100%',
                      marginTop:
                        '12px',
                      minHeight:
                        '42px',
                      border:
                        'none',
                      background:
                        'transparent',
                      color:
                        '#086747',
                      fontWeight:
                        650,
                      cursor:
                        'pointer'
                    }}
                  >
                    Change email address
                  </button>
                </form>
              </>
            )}
          </section>

          <aside
            style={{
              display:
                'grid',
              gap:
                '16px'
            }}
          >
            <div
              style={{
                background:
                     'linear-gradient(180deg, #fffaf0 0%, #ffffff 100%)',
                borderRadius:
                  '22px',
                padding:
                  '22px',
                border:
                  '1px solid rgba(255, 255, 255, 0.45)',
                boxShadow:
                  '0 20px 50px rgba(4, 18, 36, 0.16)'
              }}
            >
              <div
                style={{
                  display:
                    'flex',
                  alignItems:
                    'center',
                  gap:
                    '10px',
                  marginBottom:
                    '16px'
                }}
              >
                <div
                  style={{
                    width:
                      '38px',
                    height:
                      '38px',
                    display:
                      'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',
                    borderRadius:
                      '11px',
                    background:
                      '#e9efdf',
                    color:
                      '#086747'
                  }}
                >
                  <Gift
                    size={20}
                  />
                </div>

                <div>
                  <small
                    style={{
                      color:
                        '#727c66'
                    }}
                  >
                    Holiday wish
                  </small>

                  <strong
                    style={{
                      display:
                        'block',
                      color:
                        '#243e32'
                    }}
                  >
                    {wish?.nickname}
                  </strong>
                </div>
              </div>

              <WishlistImage image={wish?.childProfile?.worksheetImage} nickname={wish?.nickname || 'This child'} />
              <p>Choose any wish or want that fits your budget. There is no expectation to fulfill everything; any gift you choose is warmly appreciated.</p>
            </div>

            <div
              style={{
                background:
                    'linear-gradient(180deg, #fffaf0 0%, #ffffff 100%)',
                borderRadius:
                  '22px',
                padding:
                  '22px',
                border:
                  '1px solid rgba(255, 255, 255, 0.45)',
                boxShadow:
                  '0 20px 50px rgba(4, 18, 36, 0.16)'
              }}
            >
              <div
                style={{
                  display:
                    'flex',
                  alignItems:
                    'flex-start',
                  gap:
                    '12px'
                }}
              >
                <MapPin
                  size={21}
                  style={{
                    color:
                      '#0f6a4c',
                    flexShrink:
                      0
                  }}
                />

                <div>
                  <strong
                    style={{
                      display:
                        'block',
                      color:
                        '#243e32',
                      marginBottom:
                        '6px'
                    }}
                  >
                    Gift drop-off
                  </strong>

                  <p
                    style={{
                      margin:
                        '0 0 9px',
                      color:
                        '#626b5f'
                    }}
                  >
                    {wish?.organization
                      .dropOffLocation}
                  </p>

                  <small
                    style={{
                      color:
                        '#7a889b',
                      lineHeight:
                        1.6
                    }}
                  >
                    {wish?.organization
                      .contactEmail}

                    {wish?.organization?.messengerUrl && <><br /><a href={wish.organization.messengerUrl} target="_blank" rel="noreferrer">Message us on Messenger</a></>}
                  </small>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <style>
        {`
          @media (max-width: 820px) {
            .grant-wish-layout {
              grid-template-columns: 1fr !important;
            }

            .grant-form-grid {
              grid-template-columns: 1fr !important;
            }

            .grant-field-span {
              grid-column: auto !important;
            }
          }
        `}
      </style>
    </PublicLayout>
  );
}

function DropOffPicker({ value, onChange }) {
  const [date = '', time = ''] = value.split('T');
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const times = Array.from({ length: 19 }, (_, index) => {
    const hour = 8 + Math.floor(index / 2);
    const minute = index % 2 ? '30' : '00';
    return { value: `${String(hour).padStart(2, '0')}:${minute}`, label: `${hour % 12 || 12}:${minute} ${hour < 12 ? 'AM' : 'PM'}` };
  });

  return <fieldset className="dropoff-picker">
    <legend>Plan your drop-off</legend>
    <p>Choose a day and a 30-minute time between 8:00 AM and 5:00 PM, Philippine time.</p>
    <div className="dropoff-picker-fields">
      <label><span>Drop-off date</span><input type="date" required min={today} value={date} onChange={event => onChange(`${event.target.value}${time ? `T${time}` : ''}`)} /></label>
      <label><span>Drop-off time</span><select required value={time} onChange={event => onChange(`${date}T${event.target.value}`)}><option value="">Choose a time</option>{times.map(slot => <option key={slot.value} value={slot.value}>{slot.label}</option>)}</select></label>
    </div>
    <style>{`
      .dropoff-picker { grid-column: 1 / -1; min-width: 0; margin: 0; padding: 20px; border: 1px solid #d5e5d9; border-radius: 16px; background: #f3f8f3; }
      .dropoff-picker legend { padding: 0 6px; color: #07553d; font-size: 16px; font-weight: 700; }
      .dropoff-picker p { margin: 0 0 15px; color: #586e60; font-size: 13px; }
      .dropoff-picker-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
      .dropoff-picker-fields label { display: grid; gap: 7px; color: #243e32; font-size: 13px; font-weight: 650; }
      .dropoff-picker-fields input, .dropoff-picker-fields select { width: 100%; min-width: 0; min-height: 48px; box-sizing: border-box; padding: 0 12px; border: 1px solid #c9d9cd; border-radius: 10px; background: white; color: #243e32; font: inherit; }
      .dropoff-picker-fields input:focus-visible, .dropoff-picker-fields select:focus-visible { outline: 2px solid #086747; outline-offset: 2px; }
      @media (max-width: 480px) { .dropoff-picker-fields { grid-template-columns: 1fr; } }
    `}</style>
  </fieldset>;
}

function ModernField({
  label,
  span = false,
  ...props
}) {
  const [
    focused,
    setFocused
  ] = useState(false);

  return (
    <label
      className={
        span
          ? 'grant-field-span'
          : ''
      }
      style={{
        display:
          'block',
        gridColumn:
          span
            ? '1 / -1'
            : undefined,
        color:
          '#243e32',
        fontWeight:
          650,
        fontSize:
          '13px'
      }}
    >
      <span
        style={{
          display:
            'block',
          marginBottom:
            '8px'
        }}
      >
        {label}
      </span>

      <input
        {...props}
        required
        onFocus={() =>
          setFocused(
            true
          )
        }
        onBlur={() =>
          setFocused(
            false
          )
        }
        style={{
          width:
            '100%',
          minHeight:
            '48px',
          padding:
            '0 14px',
          boxSizing:
            'border-box',
          border:
            focused
              ? '1.5px solid #086747'
              : '1px solid #d6d4be',
          borderRadius:
            '12px',
          background:
            '#fdfaf1',
          color:
            '#243e32',
          outline:
            'none',
          boxShadow:
            focused
              ? '0 0 0 3px rgba(8, 103, 71, 0.09)'
              : 'none',
          transition:
            'all 0.18s ease'
        }}
      />
    </label>
  );
}

function ModernSelect({
  label,
  children,
  ...props
}) {
  return (
    <label
      style={{
        display:
          'block',
        color:
          '#243e32',
        fontWeight:
          650,
        fontSize:
          '13px'
      }}
    >
      <span
        style={{
          display:
            'block',
          marginBottom:
            '8px'
        }}
      >
        {label}
      </span>

      <select
        {...props}
        required
        style={{
          width:
            '100%',
          minHeight:
            '48px',
          padding:
            '0 13px',
          boxSizing:
            'border-box',
          border:
            '1px solid #d6d4be',
          borderRadius:
            '12px',
          background:
            '#fdfaf1',
          color:
            '#243e32',
          outline:
            'none'
        }}
      >
        {children}
      </select>
    </label>
  );
}

function NoticeBox({
  icon,
  children
}) {
  return (
    <div
      style={{
        display:
          'flex',
        alignItems:
          'flex-start',
        gap:
          '10px',
        padding:
          '14px 16px',
        marginBottom:
          '20px',
        borderRadius:
          '14px',
        background:
          '#f4f1e5',
        border:
          '1px solid rgba(8, 103, 71, 0.10)',
        color:
          '#626b5f'
      }}
    >
      <div
        style={{
          color:
            '#086747',
          flexShrink:
            0,
          marginTop:
            '2px'
        }}
      >
        {icon}
      </div>

      <p
        style={{
          margin:
            0,
          lineHeight:
            1.55,
          fontSize:
            '13px'
        }}
      >
        {children}
      </p>
    </div>
  );
}

function CalendarDeadline({
  date
}) {
  if (!date) {
    return null;
  }

  return (
    <div
      style={{
        display:
          'flex',
        gap:
          '12px',
        alignItems:
          'flex-start',
        padding:
          '16px 18px',
        borderRadius:
          '14px',
        background:
          '#fffaf0',
        border:
          '1px solid #f0dfb5'
      }}
    >
      <CalendarClock
        size={20}
        style={{
          color:
            '#9a7417',
          flexShrink:
            0
        }}
      />

      <div>
        <small
          style={{
            display:
              'block',
            color:
              '#826b37',
            marginBottom:
              '4px'
          }}
        >
          Your latest drop-off date
        </small>

        <strong
          style={{
            display:
              'block',
            color:
              '#493d23',
            marginBottom:
              '5px'
          }}
        >
          {new Date(
            date
          ).toLocaleDateString(
            'en-PH'
          )}
        </strong>

        <span
          style={{
            fontSize:
              '12px',
            color:
              '#756746'
          }}
        >
          If you later need an extension, contact MIDSA before
          this date.
        </span>
      </div>
    </div>
  );
}

function FestiveTopLine() {
  return (
    <div
      aria-hidden="true"
      style={{
        position:
          'absolute',
        top:
          0,
        left:
          0,
        right:
          0,
        height:
          '6px',
      }}
    />
  );
}

function SummaryRow({
  label,
  value
}) {
  return (
    <div
      className="reservation-summary-row"
      style={{
        display:
          'grid',
        gap:
          '14px',
        alignItems:
          'start'
      }}
    >
      <strong
        style={{
          color:
            '#243e32'
        }}
      >
        {label}
      </strong>

      <span
        style={{
          color:
            '#607089'
        }}
      >
        {value}
      </span>
    </div>
  );
}
