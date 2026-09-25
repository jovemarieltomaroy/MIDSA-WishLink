import {
  useEffect,
  useState
} from 'react';

import {
  Check,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

import {
  api,
  getErrorMessage
} from '../utils/api';

import {
  useAuth
} from '../context/AuthContext';

const emptyOrganization = {
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  dropOffLocation: ''
};

export default function AccountSettingsPage() {
  const {
    user
  } = useAuth();

  const [
    organization,
    setOrganization
  ] = useState(
    emptyOrganization
  );

  const [
    savedOrganization,
    setSavedOrganization
  ] = useState(
    emptyOrganization
  );

  const [
    organizationLoading,
    setOrganizationLoading
  ] = useState(true);

  const [
    organizationSaving,
    setOrganizationSaving
  ] = useState(false);

  const [
    organizationError,
    setOrganizationError
  ] = useState('');

  const [
    organizationMessage,
    setOrganizationMessage
  ] = useState('');

  const [
    passwordForm,
    setPasswordForm
  ] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [
    showCurrent,
    setShowCurrent
  ] = useState(false);

  const [
    showNew,
    setShowNew
  ] = useState(false);

  const [
    showConfirm,
    setShowConfirm
  ] = useState(false);

  const [
    passwordSaving,
    setPasswordSaving
  ] = useState(false);

  const [
    passwordError,
    setPasswordError
  ] = useState('');

  const [
    passwordSuccess,
    setPasswordSuccess
  ] = useState('');

  /*
   * Load organization settings when
   * the Settings page first opens.
   */
  useEffect(() => {
    loadOrganization();
  }, []);

  /*
   * Automatically remove organization
   * success/information messages after
   * four seconds.
   */
  useEffect(() => {
    if (!organizationMessage) {
      return;
    }

    const timer =
      setTimeout(() => {
        setOrganizationMessage('');
      }, 4000);

    return () => {
      clearTimeout(timer);
    };
  }, [
    organizationMessage
  ]);

  /*
   * Also remove password success
   * messages after four seconds.
   */
  useEffect(() => {
    if (!passwordSuccess) {
      return;
    }

    const timer =
      setTimeout(() => {
        setPasswordSuccess('');
      }, 4000);

    return () => {
      clearTimeout(timer);
    };
  }, [
    passwordSuccess
  ]);

  async function loadOrganization() {
    try {
      setOrganizationLoading(
        true
      );

      setOrganizationError('');

      const response =
        await api.get(
          '/settings'
        );

      const next =
        response.data.settings;

      setOrganization(
        next
      );

      setSavedOrganization(
        next
      );
    } catch (error) {
      setOrganizationError(
        getErrorMessage(
          error
        )
      );
    } finally {
      setOrganizationLoading(
        false
      );
    }
  }

  function updateOrganization(
    event
  ) {
    const {
      name,
      value
    } =
      event.target;

    setOrganization(
      (current) => ({
        ...current,

        [name]:
          value
      })
    );

    setOrganizationError('');
    setOrganizationMessage('');
  }

  /*
   * Contact number:
   *
   * Allowed examples:
   * 09171234567
   * 639171234567
   * +639171234567
   *
   * Letters, spaces, dashes,
   * parentheses and other characters
   * are automatically removed.
   */
  function updateContactNumber(
    event
  ) {
    let value =
      event.target.value;

    /*
     * Remove everything except
     * numbers and plus signs.
     */
    value =
      value.replace(
        /[^\d+]/g,
        ''
      );

    /*
     * If a plus sign exists,
     * force it to be the first
     * and only plus sign.
     */
    if (
      value.includes('+')
    ) {
      const numbersOnly =
        value
          .replace(
            /\+/g,
            ''
          )
          .slice(
            0,
            12
          );

      value =
        `+${numbersOnly}`;
    } else {
      value =
        value.slice(
          0,
          12
        );
    }

    setOrganization(
      (current) => ({
        ...current,

        contactPhone:
          value
      })
    );

    setOrganizationError('');
    setOrganizationMessage('');
  }

  function organizationChanged() {
    return (
      organization.contactName !==
        savedOrganization.contactName ||
      organization.contactEmail !==
        savedOrganization.contactEmail ||
      organization.contactPhone !==
        savedOrganization.contactPhone ||
      organization.dropOffLocation !==
        savedOrganization.dropOffLocation
    );
  }

  function isValidEmail(
    email
  ) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      String(
        email || ''
      ).trim()
    );
  }

  function isValidPhoneNumber(
    phoneNumber
  ) {
    return /^(09\d{9}|639\d{9}|\+639\d{9})$/.test(
      String(
        phoneNumber || ''
      ).trim()
    );
  }

  async function saveOrganization(
    event
  ) {
    event.preventDefault();

    setOrganizationError('');
    setOrganizationMessage('');

    /*
     * Required fields
     */
    if (
      !organization.contactName.trim() ||
      !organization.contactEmail.trim() ||
      !organization.contactPhone.trim() ||
      !organization.dropOffLocation.trim()
    ) {
      setOrganizationError(
        'Please complete all organization and donation details.'
      );

      return;
    }

    /*
     * Email validation
     */
    if (
      !isValidEmail(
        organization.contactEmail
      )
    ) {
      setOrganizationError(
        'Please enter a valid contact email address.'
      );

      return;
    }

    /*
     * Philippine contact-number
     * validation.
     */
    if (
      !isValidPhoneNumber(
        organization.contactPhone
      )
    ) {
      setOrganizationError(
        'Please enter a valid Philippine contact number using 09XXXXXXXXX, 639XXXXXXXXX, or +639XXXXXXXXX.'
      );

      return;
    }

    /*
     * Do not call the API when
     * nothing actually changed.
     */
    if (
      !organizationChanged()
    ) {
      setOrganizationMessage(
        'No changes were made.'
      );

      return;
    }

    setOrganizationSaving(
      true
    );

    try {
      const response =
        await api.patch(
          '/settings',
          {
            contactName:
              organization.contactName.trim(),

            contactEmail:
              organization.contactEmail
                .trim()
                .toLowerCase(),

            contactPhone:
              organization.contactPhone.trim(),

            dropOffLocation:
              organization.dropOffLocation.trim()
          }
        );

      const next =
        response.data.settings;

      setOrganization(
        next
      );

      setSavedOrganization(
        next
      );

      setOrganizationMessage(
        response.data.message ||
        'Organization details updated successfully.'
      );
    } catch (error) {
      setOrganizationError(
        getErrorMessage(
          error
        )
      );
    } finally {
      setOrganizationSaving(
        false
      );
    }
  }

  function updatePassword(
    event
  ) {
    const {
      name,
      value
    } =
      event.target;

    setPasswordForm(
      (current) => ({
        ...current,

        [name]:
          value
      })
    );

    setPasswordError('');
    setPasswordSuccess('');
  }

  async function submitPassword(
    event
  ) {
    event.preventDefault();

    setPasswordError('');
    setPasswordSuccess('');

    if (
      passwordForm.newPassword.length <
      8
    ) {
      setPasswordError(
        'Your new password must be at least 8 characters long.'
      );

      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordError(
        'The new passwords do not match.'
      );

      return;
    }

    if (
      passwordForm.currentPassword ===
      passwordForm.newPassword
    ) {
      setPasswordError(
        'Your new password must be different from your current password.'
      );

      return;
    }

    setPasswordSaving(
      true
    );

    try {
      const response =
        await api.patch(
          '/account/password',
          {
            currentPassword:
              passwordForm.currentPassword,

            newPassword:
              passwordForm.newPassword
          }
        );

      setPasswordSuccess(
        response.data.message ||
        'Password changed successfully.'
      );

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setShowCurrent(
        false
      );

      setShowNew(
        false
      );

      setShowConfirm(
        false
      );
    } catch (error) {
      setPasswordError(
        getErrorMessage(
          error
        )
      );
    } finally {
      setPasswordSaving(
        false
      );
    }
  }

  return (
    <div className="page">
      <div
        style={{
          maxWidth:
            '980px',
          margin:
            '0 auto',
          width:
            '100%'
        }}
      >
        <div
          style={{
            marginBottom:
              '28px'
          }}
        >
          <h1>
            Settings
          </h1>
        </div>

        <section
          className="panel"
          style={{
            marginBottom:
              '22px',
            padding:
              '22px 24px'
          }}
        >
          <div
            style={{
              display:
                'flex',
              alignItems:
                'center',
              justifyContent:
                'space-between',
              gap:
                '20px',
              flexWrap:
                'wrap'
            }}
          >
            <div>
              <small
                className="muted"
              >
                Signed in as
              </small>

              <strong
                style={{
                  display:
                    'block',
                  fontSize:
                    '17px',
                  marginTop:
                    '3px'
                }}
              >
                {user?.name ||
                  'WishLink Administrator'}
              </strong>

              <span
                className="muted"
                style={{
                  fontSize:
                    '14px'
                }}
              >
                {user?.email}
              </span>
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
                  '7px 11px',
                borderRadius:
                  '999px',
                background:
                  '#edf8f0',
                color:
                  '#2f6b3d',
                fontSize:
                  '12px',
                fontWeight:
                  700
              }}
            >
              Administrator
            </div>
          </div>
        </section>

        <section
          className="panel"
          style={{
            marginBottom:
              '22px',
            padding:
              0,
            overflow:
              'hidden'
          }}
        >
          <div
            style={{
              padding:
                '10px 26px',
              borderBottom:
                '1px solid rgba(15,39,71,.08)',
              display:
                'flex',
              gap:
                '14px',
              alignItems:
                'flex-start'
            }}
          >
            <div>
              <h2
                style={{
                  textAlign:
                    'center',
                  marginBottom:
                    '-2px'
                }}
              >
                Organization & Donation Details
              </h2>
            </div>
          </div>

          <div
            style={{
              padding:
                '28px'
            }}
          >
            {organizationError && (
              <div
                className="alert"
                style={{
                  marginBottom:
                    '18px'
                }}
              >
                {organizationError}
              </div>
            )}

            {organizationMessage && (
              <div
                className={
                  organizationMessage ===
                  'No changes were made.'
                    ? 'alert'
                    : 'success-notice'
                }
                role="status"
                style={{
                  marginBottom:
                    '18px'
                }}
              >
                {organizationMessage !==
                  'No changes were made.'}

                <span>
                  {organizationMessage}
                </span>
              </div>
            )}

            {organizationLoading ? (
              <p
                className="muted"
              >
                Loading organization details…
              </p>
            ) : (
              <form
                onSubmit={
                  saveOrganization
                }
                className="organization-settings-grid"
                style={{
                  display:
                    'grid',
                  gridTemplateColumns:
                    'repeat(2, minmax(0, 1fr))',
                  gap:
                    '18px'
                }}
              >
                <ModernTextField
                  label="Contact name / team"
                  name="contactName"
                  value={
                    organization.contactName
                  }
                  onChange={
                    updateOrganization
                  }
                  placeholder="MIDSA Christmas Program Team"
                  span
                />

                <ModernTextField
                  label="Contact email"
                  type="email"
                  name="contactEmail"
                  value={
                    organization.contactEmail
                  }
                  onChange={
                    updateOrganization
                  }
                  placeholder="midsa@example.com"
                  autoComplete="email"
                />

                <ModernTextField
                  label="Contact number"
                  type="tel"
                  name="contactPhone"
                  value={
                    organization.contactPhone
                  }
                  onChange={
                    updateContactNumber
                  }
                  placeholder="+639XXXXXXXXX or 09XXXXXXXXX"
                  inputMode="tel"
                  maxLength={13}
                />

                <ModernTextField
                  label="Gift drop-off location"
                  name="dropOffLocation"
                  value={
                    organization.dropOffLocation
                  }
                  onChange={
                    updateOrganization
                  }
                  placeholder="IPDM Office"
                  span
                />

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    organizationSaving
                  }
                  style={{
                    gridColumn:
                      '1 / -1',
                    minHeight:
                      '48px',
                    justifyContent:
                      'center',
                    borderRadius:
                      '12px'
                  }}
                >
                  {organizationSaving
                    ? 'Saving…'
                    : 'Save organization details'}
                </button>
              </form>
            )}
          </div>
        </section>

        <section
          className="panel"
          style={{
            padding:
              0,
            overflow:
              'hidden'
          }}
        >
          <div
            style={{
              padding:
                '24px 26px',
              borderBottom:
                '1px solid rgba(15,39,71,.08)'
            }}
          >
            <h2
              style={{
                margin:
                  '0 0 5px'
              }}
            >
              Account Security
            </h2>

            <p
              className="muted"
              style={{
                margin:
                  0
              }}
            >
              Update the password used for the WishLink
              administrator account.
            </p>
          </div>

          <div
            style={{
              padding:
                '28px'
            }}
          >
            {passwordError && (
              <div
                className="alert"
                style={{
                  marginBottom:
                    '18px'
                }}
              >
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div
                className="success-notice"
                role="status"
                style={{
                  marginBottom:
                    '18px'
                }}
              >
                <CheckCircle2
                  size={18}
                />

                <span>
                  {passwordSuccess}
                </span>
              </div>
            )}

            <form
              onSubmit={
                submitPassword
              }
              style={{
                display:
                  'flex',
                flexDirection:
                  'column',
                gap:
                  '16px'
              }}
            >
              <ModernPasswordField
                label="Current password"
                name="currentPassword"
                value={
                  passwordForm.currentPassword
                }
                onChange={
                  updatePassword
                }
                visible={
                  showCurrent
                }
                toggle={() =>
                  setShowCurrent(
                    (current) =>
                      !current
                  )
                }
                placeholder="Enter current password"
                autoComplete="current-password"
              />

              <ModernPasswordField
                label="New password"
                name="newPassword"
                value={
                  passwordForm.newPassword
                }
                onChange={
                  updatePassword
                }
                visible={
                  showNew
                }
                toggle={() =>
                  setShowNew(
                    (current) =>
                      !current
                  )
                }
                placeholder="Create a new password"
                autoComplete="new-password"
                minLength={8}
                hint="Minimum of 8 characters"
              />

              <ModernPasswordField
                label="Confirm new password"
                name="confirmPassword"
                value={
                  passwordForm.confirmPassword
                }
                onChange={
                  updatePassword
                }
                visible={
                  showConfirm
                }
                toggle={() =>
                  setShowConfirm(
                    (current) =>
                      !current
                  )
                }
                placeholder="Repeat your new password"
                autoComplete="new-password"
                minLength={8}
              />

              <button
                type="submit"
                className="primary-button"
                disabled={
                  passwordSaving
                }
                style={{
                  width:
                    '100%',
                  minHeight:
                    '48px',
                  justifyContent:
                    'center',
                  borderRadius:
                    '12px'
                }}
              >
                {passwordSaving
                  ? 'Changing password…'
                  : 'Update password'}
              </button>
            </form>

            <div
              style={{
                marginTop:
                  '20px',
                padding:
                  '18px',
                borderRadius:
                  '14px',
                background:
                  '#f7f9fc',
                border:
                  '1px solid rgba(15,39,71,.08)'
              }}
            >
              <strong>
                Keep your account secure
              </strong>

              <div
                style={{
                  marginTop:
                    '12px',
                  display:
                    'grid',
                  gap:
                    '9px'
                }}
              >
                <Guideline>
                  Use at least 8 characters.
                </Guideline>

                <Guideline>
                  Use a password different from the current one.
                </Guideline>

                <Guideline>
                  Share access only with authorized MIDSA officers.
                </Guideline>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>
        {`
          @media (max-width: 700px) {
            .organization-settings-grid {
              grid-template-columns: 1fr !important;
            }

            .settings-org-field-span {
              grid-column: auto !important;
            }
          }
        `}
      </style>
    </div>
  );
}

function ModernTextField({
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
          ? 'settings-org-field-span'
          : ''
      }
      style={{
        display:
          'block',
        gridColumn:
          span
            ? '1 / -1'
            : undefined
      }}
    >
      <span
        style={{
          display:
            'block',
          marginBottom:
            '8px',
          fontSize:
            '13px',
          fontWeight:
            650,
          color:
            '#17243a'
        }}
      >
        {label}
      </span>

      <div
        style={{
          position:
            'relative',
          border:
            focused
              ? '1.5px solid #2f62dc'
              : '1px solid #dbe3ef',
          borderRadius:
            '12px',
          background:
            '#f8fafc',
          boxShadow:
            focused
              ? '0 0 0 3px rgba(47,98,220,.10)'
              : 'none',
          transition:
            'all 0.18s ease'
        }}
      >
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
            height:
              '48px',
            padding:
              '0 14px',
            border:
              'none',
            outline:
              'none',
            background:
              'transparent',
            boxSizing:
              'border-box',
            borderRadius:
              '12px',
            fontSize:
              '14px',
            color:
              '#17243a'
          }}
        />
      </div>
    </label>
  );
}

function ModernPasswordField({
  label,
  name,
  value,
  onChange,
  visible,
  toggle,
  placeholder,
  autoComplete,
  minLength,
  hint
}) {
  const [
    focused,
    setFocused
  ] = useState(false);

  return (
    <div>
      <label
        htmlFor={
          name
        }
        style={{
          display:
            'block',
          fontSize:
            '13px',
          fontWeight:
            650,
          marginBottom:
            '8px',
          color:
            '#17243a'
        }}
      >
        {label}
      </label>

      <div
        style={{
          position:
            'relative',
          border:
            focused
              ? '1.5px solid #2f62dc'
              : '1px solid #dbe3ef',
          borderRadius:
            '12px',
          background:
            '#f8fafc',
          boxShadow:
            focused
              ? '0 0 0 3px rgba(47,98,220,.10)'
              : 'none',
          transition:
            'all 0.18s ease'
        }}
      >
        <input
          id={
            name
          }
          type={
            visible
              ? 'text'
              : 'password'
          }
          name={
            name
          }
          value={
            value
          }
          onChange={
            onChange
          }
          required
          minLength={
            minLength
          }
          autoComplete={
            autoComplete
          }
          placeholder={
            placeholder
          }
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
            height:
              '48px',
            padding:
              '0 48px 0 16px',
            border:
              'none',
            outline:
              'none',
            background:
              'transparent',
            borderRadius:
              '12px',
            boxSizing:
              'border-box',
            fontSize:
              '14px',
            color:
              '#17243a'
          }}
        />

        <button
          type="button"
          onClick={
            toggle
          }
          aria-label={
            visible
              ? 'Hide password'
              : 'Show password'
          }
          style={{
            position:
              'absolute',
            right:
              '11px',
            top:
              '50%',
            transform:
              'translateY(-50%)',
            width:
              '32px',
            height:
              '32px',
            border:
              'none',
            borderRadius:
              '8px',
            background:
              'transparent',
            color:
              '#61728c',
            cursor:
              'pointer',
            display:
              'flex',
            alignItems:
              'center',
            justifyContent:
              'center'
          }}
        >
          {visible
            ? (
              <EyeOff
                size={18}
              />
            )
            : (
              <Eye
                size={18}
              />
            )}
        </button>
      </div>

      {hint && (
        <small
          className="muted"
          style={{
            display:
              'block',
            marginTop:
              '7px'
          }}
        >
          {hint}
        </small>
      )}
    </div>
  );
}

function Guideline({
  children
}) {
  return (
    <div
      style={{
        display:
          'flex',
        gap:
          '8px',
        alignItems:
          'flex-start',
        color:
          '#65758b',
        fontSize:
          '13px'
      }}
    >
      <Check
        size={15}
        style={{
          flexShrink:
            0,
          marginTop:
            '2px'
        }}
      />

      <span>
        {children}
      </span>
    </div>
  );
}