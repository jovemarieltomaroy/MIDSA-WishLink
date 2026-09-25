import {
  useEffect,
  useMemo,
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

import logo from '../assets/logo.png';

const empty = {
  fullName: '',
  email: '',
  phoneNumber: '',
  program: '',
  yearLevel: '',
  giftNamePreference: 'anonymous'
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
          form
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

  if (done) {
    return (
      <PublicFrame>
        <main
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
                  'linear-gradient(180deg, #fffdfad5 0%, #ffffff 100%)',
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
                width: '64px',
                height: '64px',
                margin:
                  '0 auto 20px',
                borderRadius:
                  '20px',
                display: 'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center',
                background:
                  '#edf8f0',
                color:
                  '#0f6a4c'
              }}
            >
            </div>

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
                  '#17243a',
                fontSize:
                  'clamp(2rem, 5vw, 2.8rem)'
              }}
            >
              You’re {done.nickname}’s Secret Santa.
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
                  done.wishItems.join(
                    ', '
                  )
                }
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
                value={`${done.organization.contactEmail} · ${done.organization.contactPhone}`}
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
      </PublicFrame>
    );
  }

  return (
    <PublicFrame>
      <main
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
              'minmax(0, 1fr) minmax(270px, 330px)',
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
                  'linear-gradient(180deg, #fffdfad5 0%, #ffffff 100%)',
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

                  Secret Santa details
                </div>

                <h1
                  style={{
                    margin:
                      '0 0 8px',
                    color:
                      '#17243a',
                    fontSize:
                      'clamp(2rem, 4vw, 2.7rem)'
                  }}
                >
                  Grant{' '}
                  <span
                    style={{
                      color:
                        '#2f62dc'
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
                      '#64758c',
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
                      '#eef4ff',
                    color:
                      '#2f62dc',
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
                      '#17243a'
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
                      '#17243a',
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
                        '#17243a',
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
                        '1px solid #d7e0ed',
                      borderRadius:
                        '14px',
                      background:
                        '#f8fafc',
                      textAlign:
                        'center',
                      fontSize:
                        '28px',
                      letterSpacing:
                        '10px',
                      fontWeight:
                        800,
                      color:
                        '#17243a',
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
                        '#2f62dc',
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
                     'linear-gradient(180deg, #fffdfad5 0%, #ffffff 100%)',
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
                      '#eef4ff',
                    color:
                      '#2f62dc'
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
                        '#75859b'
                    }}
                  >
                    Christmas wish
                  </small>

                  <strong
                    style={{
                      display:
                        'block',
                      color:
                        '#17243a'
                    }}
                  >
                    {wish?.nickname}
                  </strong>
                </div>
              </div>

              <ul
                style={{
                  margin:
                    '0',
                  paddingLeft:
                    '20px',
                  color:
                    '#17243a',
                  fontWeight:
                    650,
                  lineHeight:
                    1.7
                }}
              >
                {wish?.wishItems.map(
                  (item) => (
                    <li
                      key={
                        item
                      }
                    >
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div
              style={{
                background:
                    'linear-gradient(180deg, #fffdfad5 0%, #ffffff 100%)',
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
                        '#17243a',
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
                        '#55667f'
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

                    <br />

                    {wish?.organization
                      .contactPhone}
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
    </PublicFrame>
  );
}

function PublicFrame({
  children
}) {
  return (
    <div
      style={{
        minHeight:
          '100vh',
        background:
          'linear-gradient(180deg, #18314d 0%, #23486e 36%, #2b3f63 68%, #40233a 100%)',
        position:
          'relative',
        overflow:
          'hidden'
      }}
    >
      <SnowfallBackground />

      <div
        style={{
          position:
            'relative',
          zIndex:
            1
        }}
      >
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

        {children}

        <footer
          style={{
            textAlign:
              'center',
            color:
              'rgba(255,255,255,0.72)',
            fontSize:
              '13px',
            padding:
              '0 24px 28px'
          }}
        >
          #DasigMIDSA{' '} <br></br>
          <i>
            Lagi't lagi para sa bayan.
          </i>
        </footer>
      </div>
    </div>
  );
}

function SnowfallBackground() {
  const flakes =
    useMemo(
      () =>
        Array.from(
          {
            length:
              40
          },
          (
            _,
            index
          ) => ({
            id:
              index,

            left:
              `${Math.random() * 100}%`,

            size:
              `${12 + Math.random() * 16}px`,

            duration:
              `${10 + Math.random() * 10}s`,

            delay:
              `${Math.random() * 10}s`,

            opacity:
              0.45 +
              Math.random() *
                0.4,

            drift:
              `${(Math.random() - 0.5) * 120}px`
          })
        ),
      []
    );

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
              transform:
                translate3d(
                  var(--snow-drift),
                  110vh,
                  0
                );
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
            color: rgba(255, 255, 255, 0.98);
            text-shadow:
              0 0 8px rgba(255,255,255,0.70),
              0 0 18px rgba(255,255,255,0.34);
            user-select: none;
            animation-name: wishlinkSnowfall;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
            will-change: transform, opacity;
          }
        `}
      </style>

      <div
        className="wishlink-snow-layer"
        aria-hidden="true"
      >
        {flakes.map(
          (flake) => (
            <span
              key={
                flake.id
              }
              className="wishlink-snowflake"
              style={{
                left:
                  flake.left,

                fontSize:
                  flake.size,

                opacity:
                  flake.opacity,

                animationDuration:
                  flake.duration,

                animationDelay:
                  `-${flake.delay}`,

                '--snow-drift':
                  flake.drift
              }}
            >
              ❄
            </span>
          )
        )}
      </div>
    </>
  );
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
          '#17243a',
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
              ? '1.5px solid #2f62dc'
              : '1px solid #d8e1ed',
          borderRadius:
            '12px',
          background:
            '#f8fafc',
          color:
            '#17243a',
          outline:
            'none',
          boxShadow:
            focused
              ? '0 0 0 3px rgba(47, 98, 220, 0.09)'
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
          '#17243a',
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
            '1px solid #d8e1ed',
          borderRadius:
            '12px',
          background:
            '#f8fafc',
          color:
            '#17243a',
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
          '#f6f9fd',
        border:
          '1px solid rgba(47, 98, 220, 0.10)',
        color:
          '#55667f'
      }}
    >
      <div
        style={{
          color:
            '#2f62dc',
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
      style={{
        display:
          'grid',
        gridTemplateColumns:
          '150px 1fr',
        gap:
          '14px',
        alignItems:
          'start'
      }}
    >
      <strong
        style={{
          color:
            '#17243a'
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