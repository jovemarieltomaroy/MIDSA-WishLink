import { holidayCampaignName } from '../utils/holidayCopy';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  api,
  getErrorMessage,
} from '../utils/api';

import {
  useCampaign,
} from '../context/CampaignContext';
import ChildProfileFields from '../components/ChildProfileFields';

export default function NewWishPage() {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();

  const {
    campaigns,
    activeCampaignId,
  } = useCampaign();

  const campaignIdFromUrl =
    searchParams.get(
      'campaignId'
    ) || '';

  /*
   * Officers may prepare wishes in:
   *
   * - Draft campaigns
   * - Active campaign
   *
   * Wishes cannot be added to completed
   * or archived campaigns.
   */
  const usableCampaigns =
    campaigns.filter(
      (campaign) =>
        [
          'draft',
          'active',
        ].includes(
          campaign.status
        )
    );

  const defaultCampaignId =
    useMemo(() => {
      if (
        campaignIdFromUrl &&
        usableCampaigns.some(
          (campaign) =>
            campaign._id ===
            campaignIdFromUrl
        )
      ) {
        return campaignIdFromUrl;
      }

      if (
        activeCampaignId &&
        usableCampaigns.some(
          (campaign) =>
            campaign._id ===
            activeCampaignId
        )
      ) {
        return activeCampaignId;
      }

      return (
        usableCampaigns[0]
          ?._id || ''
      );
    }, [
      campaignIdFromUrl,
      activeCampaignId,
      campaigns,
    ]);

  const [
    form,
    setForm,
  ] = useState({
    campaignId: '',
    nickname: '',
    partnerFoundation: '',
    ageGroup: '',
    notes: '',
    childProfile: {},
  });

  const [
    error,
    setError,
  ] = useState('');

  const [
    saving,
    setSaving,
  ] = useState(false);

  useEffect(() => {
    if (
      !form.campaignId &&
      defaultCampaignId
    ) {
      setForm(
        (current) => ({
          ...current,

          campaignId:
            defaultCampaignId,
        })
      );
    }
  }, [
    defaultCampaignId,
    form.campaignId,
  ]);

  const selectedCampaign =
    campaigns.find(
      (campaign) =>
        campaign._id ===
        form.campaignId
    ) || null;

  function set(
    key,
    value
  ) {
    setForm(
      (current) => ({
        ...current,

        [key]:
          value,
      })
    );
  }

  async function submit(
    event
  ) {
    event.preventDefault();

    setError('');
    setSaving(true);

    try {
      const response =
        await api.post(
          '/officer/wishes',
          {
            ...form,

            nickname:
              form.nickname.trim(),

            partnerFoundation:
              form.partnerFoundation.trim(),

            ageGroup:
              form.ageGroup.trim(),

            notes:
              form.notes.trim(),

          }
        );

      navigate(
        `/officer/wishes/${response.data.wish._id}`
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
            Add a new wish
          </h1>

          <p>
            Add the child’s anonymized nickname and wishlist under the correct campaign.
          </p>
        </div>
      </div>

      <div className="panel form-panel new-wish-panel">
        {error && (
          <div className="alert">
            {error}
          </div>
        )}

        {!usableCampaigns.length ? (
          <div className="empty">
            <h3>
              No campaign available for new wishes.
            </h3>

            <p>
              Create a draft campaign first, or activate an existing campaign.
            </p>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="new-wish-form"
          >
            {/* Campaign */}
            <label className="new-wish-field new-wish-full">
              <span>
                Campaign
              </span>

              <select
                value={
                  form.campaignId
                }
                onChange={(
                  event
                ) =>
                  set(
                    'campaignId',
                    event.target.value
                  )
                }
                required
              >
                <option value="">
                  Select a campaign
                </option>

                {usableCampaigns.map(
                  (
                    campaign
                  ) => (
                    <option
                      value={
                        campaign._id
                      }
                      key={
                        campaign._id
                      }
                    >
                      {holidayCampaignName(campaign.name)}

                      {campaign.academicPeriod
                        ? ` · ${campaign.academicPeriod}`
                        : ''}

                      {' · '}

                      {campaign.status ===
                      'active'
                        ? 'Active'
                        : 'Draft'}
                    </option>
                  )
                )}
              </select>
            </label>

            {/* Campaign status */}
            {selectedCampaign?.status ===
              'draft' && (
              <div className="new-wish-full campaign-draft-note">
                <strong>
                  Draft campaign
                </strong>

                <span>
                  You can create the wish and prepare its ornament now, but students will not be able to reserve it until this campaign is activated.
                </span>
              </div>
            )}

            {selectedCampaign?.status ===
              'active' && (
              <div className="new-wish-full active-campaign-notice">
                <div>
                  <strong>
                    Active campaign
                  </strong>

                  <span>
                    Once this wish is created, its QR page can accept a reservation immediately.
                  </span>
                </div>
              </div>
            )}

            {/* Nickname */}
            <label className="new-wish-field">
              <span>
                Nickname
              </span>

              <input
                type="text"
                value={
                  form.nickname
                }
                onChange={(
                  event
                ) =>
                  set(
                    'nickname',
                    event.target.value
                  )
                }
                required
                placeholder="e.g. Star"
              />
            </label>

            {/* Age */}
            <label className="new-wish-field">
              <span>
                Age group
                <span className="new-wish-optional">
                  {' '}
                  (optional)
                </span>
              </span>

              <input
                type="text"
                value={
                  form.ageGroup
                }
                onChange={(
                  event
                ) =>
                  set(
                    'ageGroup',
                    event.target.value
                  )
                }
                placeholder="e.g. 8–10"
              />
            </label>

            {/* Foundation */}
            <label className="new-wish-field new-wish-full">
              <span>
                Partner Foundation / Organization
              </span>

              <input
                type="text"
                value={
                  form.partnerFoundation
                }
                onChange={(
                  event
                ) =>
                  set(
                    'partnerFoundation',
                    event.target.value
                  )
                }
                required
                placeholder="e.g. Partner Foundation A"
              />
            </label>

            <ChildProfileFields value={form.childProfile} onChange={value => set('childProfile', value)} />

            {/* Notes */}
            <label className="new-wish-field new-wish-full">
              <span>
                Additional Notes

                <span className="new-wish-optional">
                  {' '}
                  (optional)
                </span>
              </span>

              <textarea
                rows="4"
                value={
                  form.notes
                }
                onChange={(
                  event
                ) =>
                  set(
                    'notes',
                    event.target.value
                  )
                }
                placeholder="Sizing guidance, coordination notes, etc."
              />
            </label>

            {/* Submit */}
            <div className="new-wish-full new-wish-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={
                  saving ||
                  !form.campaignId
                }
              >
                {saving
                  ? 'Creating…'
                  : 'Create wish & QR ornament'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
