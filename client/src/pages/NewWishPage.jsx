import {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  useNavigate,
  useSearchParams
} from 'react-router-dom';

import {
  Plus,
  Trash2
} from 'lucide-react';

import {
  api,
  getErrorMessage
} from '../utils/api';

import {
  useCampaign
} from '../context/CampaignContext';

export default function NewWishPage() {
  const navigate =
    useNavigate();

  const [
    searchParams
  ] = useSearchParams();

  const {
    campaigns,
    activeCampaignId
  } = useCampaign();

  const campaignIdFromUrl =
    searchParams.get(
      'campaignId'
    ) || '';

  /*
   * Officers may prepare wishes in:
   *
   * Draft campaigns
   * Active campaign
   *
   * Wishes cannot be added to completed
   * or archived campaigns.
   */
  const usableCampaigns =
    campaigns.filter(
      (campaign) =>
        [
          'draft',
          'active'
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
      campaigns
    ]);

  const [
    form,
    setForm
  ] = useState({
    campaignId: '',
    nickname: '',
    partnerFoundation: '',
    ageGroup: '',
    notes: '',
    wishItems: ['']
  });

  const [
    error,
    setError
  ] = useState('');

  const [
    saving,
    setSaving
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
            defaultCampaignId
        })
      );
    }
  }, [
    defaultCampaignId,
    form.campaignId
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
        [key]: value
      })
    );
  }

  function updateWishItem(
    index,
    value
  ) {
    set(
      'wishItems',
      form.wishItems.map(
        (item, currentIndex) =>
          currentIndex ===
          index
            ? value
            : item
      )
    );
  }

  function removeWishItem(
    index
  ) {
    set(
      'wishItems',
      form.wishItems.filter(
        (
          _,
          currentIndex
        ) =>
          currentIndex !==
          index
      )
    );
  }

  function addWishItem() {
    set(
      'wishItems',
      [
        ...form.wishItems,
        ''
      ]
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
            wishItems:
              form.wishItems
                .map(
                  (item) =>
                    item.trim()
                )
                .filter(Boolean)
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
            Add the child’s
            anonymized nickname and
            wishlist under the correct
            campaign.
          </p>
        </div>
      </div>

      <div className="panel form-panel">
        {error && (
          <div className="alert">
            {error}
          </div>
        )}

        {!usableCampaigns.length ? (
          <div className="empty">
            <h3>
              No campaign available
              for new wishes.
            </h3>

            <p>
              Create a draft
              campaign first, or
              activate an existing
              campaign.
            </p>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="form-grid"
          >
            <label className="span-2">
              Campaign

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
                      {campaign.name}

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

            {selectedCampaign?.status ===
              'draft' && (
              <div className="span-2 campaign-draft-note">
                <strong>
                  Draft campaign
                </strong>

                <span>
                  You can create the
                  wish and prepare its
                  ornament now, but
                  students will not be
                  able to reserve it
                  until this campaign
                  is activated.
                </span>
              </div>
            )}

            {selectedCampaign?.status ===
              'active' && (
              <div className="span-2 active-campaign-notice">
                <div>
                  <strong>
                    Active campaign
                  </strong>

                  <span>
                    Once this wish is
                    created, its QR
                    page can accept a
                    reservation
                    immediately.
                  </span>
                </div>
              </div>
            )}

            <label>
              Nickname

              <input
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

            <label>
              Age group
              (optional)

              <input
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

            <label className="span-2">
              Partner Foundation /
              Organization

              <input
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

            <fieldset className="span-2">
              <legend>
                Wish list
              </legend>

              {form.wishItems.map(
                (
                  item,
                  index
                ) => (
                  <div
                    className="repeat-row"
                    key={index}
                  >
                    <input
                      value={item}
                      onChange={(
                        event
                      ) =>
                        updateWishItem(
                          index,
                          event.target.value
                        )
                      }
                      required
                      placeholder="e.g. Backpack"
                    />

                    <button
                      type="button"
                      className="icon-button"
                      disabled={
                        form.wishItems
                          .length ===
                        1
                      }
                      onClick={() =>
                        removeWishItem(
                          index
                        )
                      }
                      title="Remove item"
                    >
                      <Trash2
                        size={16}
                      />
                    </button>
                  </div>
                )
              )}

              <button
                type="button"
                className="text-button"
                onClick={
                  addWishItem
                }
              >
                <Plus
                  size={16}
                />
                Add another item
              </button>
            </fieldset>

            <label className="span-2">
              Additional Notes
              (optional)

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

            <div className="span-2 actions">
              <button
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