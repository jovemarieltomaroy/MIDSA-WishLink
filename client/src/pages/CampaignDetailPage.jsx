import {
  useEffect,
  useState
} from 'react';

import {
  Link,
  useParams
} from 'react-router-dom';

import {
  Archive,
  CheckCircle2,
  Gift,
  PlayCircle,
  Save,
  StopCircle
} from 'lucide-react';

import {
  api,
  getErrorMessage
} from '../utils/api';

import { useAuth } from '../context/AuthContext';

import { useCampaign } from '../context/CampaignContext';

import ConfirmModal from '../components/ConfirmModal';

export default function CampaignDetailPage() {
  const { id } =
    useParams();

  const { user } =
    useAuth();

  const {
    refreshCampaigns,
    activeCampaign
  } = useCampaign();

  const [
    data,
    setData
  ] = useState(null);

  const [
    form,
    setForm
  ] = useState(null);

  const [
    error,
    setError
  ] = useState('');

  const [
    success,
    setSuccess
  ] = useState('');

  const [
    saving,
    setSaving
  ] = useState(false);

  const [
    actionBusy,
    setActionBusy
  ] = useState(false);

  const [
    confirmAction,
    setConfirmAction
  ] = useState(null);

  async function load() {
    try {
      setError('');

      const response =
        await api.get(
          `/officer/campaigns/${id}`
        );

      setData(
        response.data
      );

      setForm({
        name:
          response.data.campaign.name,

        academicPeriod:
          response.data.campaign
            .academicPeriod || '',

        description:
          response.data.campaign
            .description || '',

        startDate:
          toLocalInput(
            response.data.campaign
              .startDate
          ),

        deadline:
          toLocalInput(
            response.data.campaign
              .deadline
          )
      });
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  function update(event) {
    setForm(
      (current) => ({
        ...current,
        [event.target.name]:
          event.target.value
      })
    );
  }

  async function save(event) {
    event.preventDefault();

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.patch(
        `/officer/campaigns/${id}`,
        {
          ...form,

          startDate:
            new Date(
              form.startDate
            ).toISOString(),

          deadline:
            new Date(
              form.deadline
            ).toISOString()
        }
      );

      await Promise.all([
        load(),
        refreshCampaigns()
      ]);

      setSuccess(
        'Campaign details saved successfully.'
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setSaving(false);
    }
  }

  function requestActivate() {
    const campaign =
      data?.campaign;

    if (!campaign) return;

    const start =
      new Date(
        campaign.startDate
      );

    const now =
      new Date();

    const startsLater =
      start > now;

    setConfirmAction({
      type: 'activate',

      title:
        `Activate “${campaign.name}”?`,

      message:
        startsLater
          ? `This will make this the only active MIDSA WishLink campaign. QR reservations will still wait until ${formatDateTime(
              campaign.startDate
            )}, the campaign start date.`
          : 'This will make this the only active MIDSA WishLink campaign and allow students to reserve available wishes through their QR pages.',

      confirmLabel:
        'Activate campaign',

      tone: 'success'
    });
  }

  function requestComplete() {
    const campaign =
      data?.campaign;

    if (!campaign) return;

    setConfirmAction({
      type: 'complete',

      title:
        `Complete “${campaign.name}”?`,

      message:
        'Students will no longer be able to make new reservations under this campaign. Existing records and campaign history will remain available to officers.',

      confirmLabel:
        'Complete campaign',

      tone: 'danger'
    });
  }

  function requestArchive() {
    const campaign =
      data?.campaign;

    if (!campaign) return;

    setConfirmAction({
      type: 'archive',

      title:
        `Archive “${campaign.name}”?`,

      message:
        'The campaign will be kept for historical records but moved out of the normal active campaign view. Its data will not be deleted.',

      confirmLabel:
        'Archive campaign',

      tone: 'primary'
    });
  }

  async function runConfirmedAction() {
    if (!confirmAction) {
      return;
    }

    setActionBusy(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = {
        activate: 'activate',
        complete: 'complete',
        archive: 'archive'
      }[confirmAction.type];

      const response =
        await api.patch(
          `/officer/campaigns/${id}/${endpoint}`
        );

      setConfirmAction(null);

      await Promise.all([
        load(),
        refreshCampaigns()
      ]);

      setSuccess(
        response.data.message ||
          'Campaign updated successfully.'
      );
    } catch (err) {
      setConfirmAction(null);

      setError(
        getErrorMessage(err)
      );
    } finally {
      setActionBusy(false);
    }
  }

  if (
    !data ||
    !form
  ) {
    return (
      <div className="page">
        {error ||
          'Loading campaign…'}
      </div>
    );
  }

  const {
    campaign,
    stats,
    foundations
  } = data;

  const isCurrentActive =
    activeCampaign?._id ===
    campaign._id;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div
            className={`campaign-status campaign-${campaign.status}`}
          >
            {campaign.status}
          </div>

          <h1>
            {campaign.name}
          </h1>

          <p>
            {campaign.academicPeriod ||
              'No academic period specified'}
          </p>
        </div>

        <div className="inline campaign-primary-actions">
          {user?.role ===
            'admin' &&
            campaign.status ===
              'draft' && (
              <button
                className="success-button"
                type="button"
                onClick={
                  requestActivate
                }
              >
                <PlayCircle
                  size={17}
                />

                Activate campaign
              </button>
            )}

          {user?.role ===
            'admin' &&
            campaign.status ===
              'active' && (
              <button
                className="danger-button"
                type="button"
                onClick={
                  requestComplete
                }
              >
                <StopCircle
                  size={17}
                />

                Complete campaign
              </button>
            )}

          {user?.role ===
            'admin' &&
            campaign.status ===
              'completed' && (
              <button
                className="secondary-button"
                type="button"
                onClick={
                  requestArchive
                }
              >
                <Archive
                  size={17}
                />

                Archive campaign
              </button>
            )}

          {![
            'completed',
            'archived'
          ].includes(
            campaign.status
          ) && (
            <Link
              className="primary-button"
              to={`/officer/new?campaignId=${campaign._id}`}
            >
              <Gift
                size={17}
              />

              Add wish
            </Link>
          )}

          <Link
            className="secondary-button"
            to={`/officer/wishes?campaignId=${campaign._id}`}
          >
            View wishes
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="success-notice">
          <CheckCircle2
            size={18}
          />

          <span>
            {success}
          </span>
        </div>
      )}

      {isCurrentActive && (
        <div className="active-campaign-notice">
          <CheckCircle2
            size={18}
          />

          <div>
            <strong>
              This is the active
              campaign.
            </strong>

            <span>
              Public QR reservations
              are tied to this campaign
              and its start/deadline
              schedule.
            </span>
          </div>
        </div>
      )}

      {campaign.status ===
        'draft' && (
        <div className="campaign-info-notice">
          <strong>
            Draft campaign
          </strong>

          <span>
            You can continue adding
            and checking wishes, but
            students cannot reserve
            them until an admin
            activates this campaign.
          </span>
        </div>
      )}

      <div className="stats-grid">
        <Stat
          label="All wishes"
          value={stats.total}
        />

        <Stat
          label="Waiting"
          value={stats.available}
        />

        <Stat
          label="Santa on the Way"
          value={stats.reserved}
        />

        <Stat
          label="Granted"
          value={stats.granted}
        />
      </div>

      <div className="panel campaign-summary-panel">
        <div className="panel-head">
          <div>
            <h2>
              Campaign summary
            </h2>

            <p>
              {stats.completionRate}%
              of recorded wishes have
              been granted.
            </p>
          </div>
        </div>

        <div className="summary-strip">
          <div>
            <small>
              Start
            </small>

            <strong>
              {formatDateTime(
                campaign.startDate
              )}
            </strong>
          </div>

          <div>
            <small>
              Final deadline
            </small>

            <strong>
              {formatDateTime(
                campaign.deadline
              )}
            </strong>
          </div>

          <div>
            <small>
              Partner foundations
            </small>

            <strong>
              {foundations.length}
            </strong>
          </div>

          <div>
            <small>
              Completion rate
            </small>

            <strong>
              {stats.completionRate}%
            </strong>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>
              Foundation breakdown
            </h2>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  Partner foundation
                </th>

                <th>Total</th>
                <th>Waiting</th>
                <th>Reserved</th>
                <th>Granted</th>
                <th>Hidden</th>
              </tr>
            </thead>

            <tbody>
              {foundations.map(
                (row) => (
                  <tr
                    key={row.name}
                  >
                    <td>
                      <strong>
                        {row.name}
                      </strong>
                    </td>

                    <td>
                      {row.total}
                    </td>

                    <td>
                      {row.available}
                    </td>

                    <td>
                      {row.reserved}
                    </td>

                    <td>
                      {row.granted}
                    </td>

                    <td>
                      {row.paused}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {!foundations.length && (
            <div className="empty">
              No wishes have been
              added to this campaign
              yet.
            </div>
          )}
        </div>
      </div>

      {user?.role ===
        'admin' &&
        campaign.status !==
          'archived' && (
          <div className="panel form-panel">
            <div className="panel-head">
              <div>
                <h2>
                  Campaign settings
                </h2>

                <p>
                  Edit the campaign
                  details here.
                  Lifecycle changes
                  use the action
                  buttons at the top.
                </p>
              </div>
            </div>

            <form
              className="form-grid"
              onSubmit={save}
            >
              <label className="span-2">
                Campaign name

                <input
                  name="name"
                  value={form.name}
                  onChange={update}
                  required
                />
              </label>

              <label className="span-2">
                Academic period

                <input
                  name="academicPeriod"
                  value={
                    form.academicPeriod
                  }
                  onChange={update}
                />
              </label>

              <label>
                Start date and time

                <input
                  type="datetime-local"
                  name="startDate"
                  value={
                    form.startDate
                  }
                  onChange={update}
                  required
                />
              </label>

              <label>
                Final drop-off
                deadline

                <input
                  type="datetime-local"
                  name="deadline"
                  value={
                    form.deadline
                  }
                  onChange={update}
                  required
                />
              </label>

              <label className="span-2">
                Description

                <textarea
                  rows="4"
                  name="description"
                  value={
                    form.description
                  }
                  onChange={update}
                />
              </label>

              <div className="span-2 actions">
                <button
                  className="primary-button"
                  disabled={saving}
                >
                  <Save
                    size={17}
                  />

                  {saving
                    ? 'Saving…'
                    : 'Save campaign details'}
                </button>
              </div>
            </form>
          </div>
        )}

      <ConfirmModal
        open={Boolean(
          confirmAction
        )}
        title={
          confirmAction?.title
        }
        message={
          confirmAction?.message
        }
        confirmLabel={
          confirmAction?.confirmLabel
        }
        tone={
          confirmAction?.tone
        }
        busy={actionBusy}
        onCancel={() =>
          !actionBusy &&
          setConfirmAction(null)
        }
        onConfirm={
          runConfirmedAction
        }
      />
    </div>
  );
}

function Stat({
  label,
  value
}) {
  return (
    <div className="stat-card">
      <div>
        <span>
          {label}
        </span>

        <strong>
          {value || 0}
        </strong>
      </div>
    </div>
  );
}

function toLocalInput(value) {
  const date =
    new Date(value);

  const pad = (number) =>
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

function formatDateTime(value) {
  return new Date(
    value
  ).toLocaleString(
    'en-PH',
    {
      dateStyle: 'medium',
      timeStyle: 'short'
    }
  );
}