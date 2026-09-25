import {
  useState
} from 'react';

import {
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  UserRound
} from 'lucide-react';

import {
  api,
  getErrorMessage
} from '../utils/api';

import {
  useAuth
} from '../context/AuthContext';

export default function AccountSettingsPage() {
  const {
    user
  } = useAuth();

  const [
    form,
    setForm
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
    saving,
    setSaving
  ] = useState(false);

  const [
    error,
    setError
  ] = useState('');

  const [
    success,
    setSuccess
  ] = useState('');

  function update(event) {
    const {
      name,
      value
    } = event.target;

    setForm(
      (current) => ({
        ...current,
        [name]: value
      })
    );

    if (error) {
      setError('');
    }

    if (success) {
      setSuccess('');
    }
  }

  async function submit(event) {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (
      form.newPassword.length <
      8
    ) {
      setError(
        'Your new password must be at least 8 characters long.'
      );

      return;
    }

    if (
      form.newPassword !==
      form.confirmPassword
    ) {
      setError(
        'The new passwords do not match.'
      );

      return;
    }

    if (
      form.currentPassword ===
      form.newPassword
    ) {
      setError(
        'Your new password must be different from your current password.'
      );

      return;
    }

    setSaving(true);

    try {
      const response =
        await api.patch(
          '/account/password',
          {
            currentPassword:
              form.currentPassword,

            newPassword:
              form.newPassword
          }
        );

      setSuccess(
        response.data.message ||
        'Password changed successfully.'
      );

      setForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    } catch (err) {
      setError(
        getErrorMessage(
          err
        )
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">

      <div
        style={{
          maxWidth: '980px',
          margin: '0 auto',
          width: '100%'
        }}
      >

        <div
          style={{
            marginBottom: '28px'
          }}
        >
          <h1
            style={{
              marginBottom: '8px'
            }}
          >
            Account Settings
          </h1>

          <p
            className="muted"
            style={{
              margin: 0,
              maxWidth: '620px',
              fontSize: '20px'
            }}
          >
            Manage the administrator credentials used
            to access MIDSA WishLink.
          </p>
        </div>

        <section
          className="panel"
          style={{
            marginBottom: '22px',
            padding: '22px 24px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              flexWrap: 'wrap'
            }}
          >

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >

              <div>
                <small
                  className="muted"
                  style={{
                    display: 'block',
                    marginBottom: '3px'
                  }}
                >
                  Signed in as
                </small>

                <strong
                  style={{
                    display: 'block',
                    fontSize: '17px',
                    marginBottom: '3px'
                  }}
                >
                  {user?.name ||
                    'WishLink Administrator'}
                </strong>

                <span
                  className="muted"
                  style={{
                    fontSize: '14px'
                  }}
                >
                  {user?.email}
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 11px',
                borderRadius: '999px',
                background: '#edf8f0',
                color: '#2f6b3d',
                fontSize: '12px',
                fontWeight: 700
              }}
            >
              Administrator
            </div>

          </div>
        </section>

        <section
          className="panel"
          style={{
            padding: 0,
            overflow: 'hidden'
          }}
        >

          <div
            style={{
              padding: '24px 26px',
              borderBottom:
                '1px solid rgba(15, 39, 71, 0.08)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px'
            }}
          >
            
            <div>
              <h2
                style={{
                  margin:
                    '0 0 5px'
                }}
              >
                Change Password
              </h2>

              <p
                className="muted"
                style={{
                  margin: 0,
                  maxWidth: '660px'
                }}
              >
                Update the password used for the WishLink
                administrator account.
              </p>
            </div>
          </div>

          <div
            style={{
              padding: '28px'
            }}
          >

            {error && (
              <div
                className="alert"
                style={{
                  marginBottom: '20px'
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="success-notice"
                role="status"
                style={{
                  marginBottom: '20px'
                }}
              >
                <CheckCircle2
                  size={18}
                />

                <span>
                  {success}
                </span>
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'minmax(0, 1fr) 280px',
                gap: '32px',
                alignItems: 'start'
              }}
            >

              <form
                onSubmit={
                  submit
                }
              >

                <ModernPasswordField
                  label="Current password"
                  name="currentPassword"
                  value={
                    form.currentPassword
                  }
                  onChange={
                    update
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
                    form.newPassword
                  }
                  onChange={
                    update
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
                    form.confirmPassword
                  }
                  onChange={
                    update
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
                    saving
                  }
                  style={{
                    width: '100%',
                    minHeight: '48px',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    fontSize: '14px',
                    marginTop: '6px'
                  }}
                >
                

                  {saving
                    ? 'Changing password…'
                    : 'Update password'}
                </button>

              </form>

              <aside
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  background: '#f7f9fc',
                  border:
                    '1px solid rgba(15, 39, 71, 0.08)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    marginBottom: '16px'
                  }}
                >

                  <strong>
                    Keep your account secure
                  </strong>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gap: '13px'
                  }}
                >
                  <Guideline>
                    Use at least 8 characters.
                  </Guideline>

                  <Guideline>
                    Choose a password different from
                    the current one.
                  </Guideline>

                  <Guideline>
                    Only share access with authorized
                    MIDSA officers.
                  </Guideline>

                  <Guideline>
                    Changing the password will not affect
                    campaigns or wishes.
                  </Guideline>
                </div>
              </aside>

            </div>

          </div>

        </section>

      </div>

    </div>
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
    <div
      style={{
        marginBottom: '22px'
      }}
    >
      <label
        htmlFor={name}
        style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 650,
          marginBottom: '8px',
          color: '#17243a'
        }}
      >
        {label}
      </label>

      <div
        style={{
          position: 'relative',
          border:
            focused
              ? '1.5px solid #2f62dc'
              : '1px solid #dbe3ef',
          borderRadius: '12px',
          background: '#f8fafc',
          boxShadow:
            focused
              ? '0 0 0 3px rgba(47, 98, 220, 0.10)'
              : 'none',
          transition:
            'all 0.18s ease'
        }}
      >

        <input
          id={name}
          type={
            visible
              ? 'text'
              : 'password'
          }
          name={name}
          value={value}
          onChange={onChange}
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
            setFocused(true)
          }
          onBlur={() =>
            setFocused(false)
          }
          style={{
            width: '100%',
            height: '48px',
            padding:
              '0 48px 0 46px',
            border: 'none',
            outline: 'none',
            background:
              'transparent',
            borderRadius: '12px',
            fontSize: '14px',
            color: '#17243a',
            boxSizing: 'border-box'
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
            position: 'absolute',
            right: '11px',
            top: '50%',
            transform:
              'translateY(-50%)',
            width: '32px',
            height: '32px',
            border: 'none',
            borderRadius: '8px',
            background:
              'transparent',
            color: '#61728c',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {visible ? (
            <EyeOff
              size={18}
            />
          ) : (
            <Eye
              size={18}
            />
          )}
        </button>
      </div>

      {hint && (
        <small
          style={{
            display: 'block',
            marginTop: '7px',
            color: '#7b899d',
            fontSize: '12px'
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
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        fontSize: '13px',
        lineHeight: 1.5,
        color: '#65758b'
      }}
    >
      <Check
        size={15}
        style={{
          flexShrink: 0,
          marginTop: '2px'
        }}
      />

      <span>
        {children}
      </span>
    </div>
  );
}
