import {
  useState
} from 'react';

import {
  useNavigate
} from 'react-router-dom';

import {
  api,
  getErrorMessage
} from '../utils/api';

import {
  useCampaign
} from '../context/CampaignContext';

const initial = {
  name: '',
  academicPeriod: '',
  description: '',
  startDate: '',
  deadline: ''
};

export default function NewCampaignPage() {
  const navigate =
    useNavigate();

  const {
    refreshCampaigns
  } = useCampaign();

  const [
    form,
    setForm
  ] = useState(initial);

  const [
    error,
    setError
  ] = useState('');

  const [
    saving,
    setSaving
  ] = useState(false);

  function update(event) {
    setForm(
      (current) => ({
        ...current,
        [event.target.name]:
          event.target.value
      })
    );
  }

  async function submit(event) {
    event.preventDefault();

    setSaving(true);
    setError('');

    try {
      const response =
        await api.post(
          '/officer/campaigns',
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

      await refreshCampaigns();

      navigate(
        `/officer/campaigns/${response.data.campaign._id}`
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>
            Create a campaign
          </h1>

          <p>
            Set up the giving
            period first. New
            campaigns begin as
            drafts until an admin
            activates them.
          </p>
        </div>
      </div>

      <div className="panel form-panel">
        {error && (
          <div className="alert">
            {error}
          </div>
        )}

        <form
          className="form-grid"
          onSubmit={submit}
        >
          <label className="span-2">
            Campaign name

            <input
              name="name"
              value={form.name}
              onChange={update}
              required
              placeholder="e.g. Christmas 2026"
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
              placeholder="e.g. 1st Semester AY 2026–2027"
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

          <div className="span-2 campaign-draft-note">
            <strong>
              Starts as Draft
            </strong>

            <span>
              You can encode wishes
              and prepare ornaments
              first. Activate the
              campaign when you are
              ready for students to
              reserve wishes.
            </span>
          </div>

          <label className="span-2">
            Description
            (optional)

            <textarea
              rows="4"
              name="description"
              value={
                form.description
              }
              onChange={update}
              placeholder="Short internal description of this giving period."
            />
          </label>

          <div className="span-2 actions">
            <button
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? 'Creating…'
                : 'Create draft campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}