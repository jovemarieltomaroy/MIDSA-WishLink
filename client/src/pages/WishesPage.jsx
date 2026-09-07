import {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Link,
  useSearchParams
} from 'react-router-dom';

import {
  Gift,
  Plus,
  Search
} from 'lucide-react';

import { api } from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import { useCampaign } from '../context/CampaignContext';

export default function WishesPage() {
  const {
    campaigns,
    activeCampaignId
  } = useCampaign();

  const [
    searchParams,
    setSearchParams
  ] = useSearchParams();

  const campaignIdFromUrl =
    searchParams.get('campaignId') || '';

  /*
   * Priority:
   *
   * 1. Campaign explicitly selected in the URL
   * 2. Current active campaign
   * 3. First campaign in the list
   *
   * This means historical campaigns are still viewable,
   * while the active campaign remains the default.
   */
  const effectiveCampaignId =
    campaignIdFromUrl ||
    activeCampaignId ||
    campaigns[0]?._id ||
    '';

  const selectedCampaign =
    useMemo(
      () =>
        campaigns.find(
          (campaign) =>
            campaign._id ===
            effectiveCampaignId
        ) || null,
      [
        campaigns,
        effectiveCampaignId
      ]
    );

  const [
    wishes,
    setWishes
  ] = useState([]);

  const [
    status,
    setStatus
  ] = useState('all');

  const [
    foundation,
    setFoundation
  ] = useState('all');

  const [
    q,
    setQ
  ] = useState('');

  const [
    foundationOptions,
    setFoundationOptions
  ] = useState([]);

  async function load() {
    if (!effectiveCampaignId) {
      setWishes([]);
      return;
    }

    const response =
      await api.get(
        '/officer/wishes',
        {
          params: {
            campaignId:
              effectiveCampaignId,
            status,
            foundation,
            q
          }
        }
      );

    setWishes(
      response.data.wishes || []
    );
  }

  useEffect(() => {
    const timer =
      setTimeout(
        load,
        180
      );

    return () =>
      clearTimeout(timer);
  }, [
    status,
    foundation,
    q,
    effectiveCampaignId
  ]);

  /*
   * Build the foundation filter from
   * all wishes in the selected campaign.
   */
  useEffect(() => {
    setFoundation('all');

    if (!effectiveCampaignId) {
      setFoundationOptions([]);
      return;
    }

    api
      .get('/officer/wishes', {
        params: {
          campaignId:
            effectiveCampaignId,
          status: 'all'
        }
      })
      .then((response) => {
        const values =
          response.data.wishes
            .map(
              (wish) =>
                wish.partnerFoundation
            )
            .filter(Boolean);

        const unique =
          [...new Set(values)].sort(
            (a, b) =>
              a.localeCompare(b)
          );

        setFoundationOptions(
          unique
        );
      });
  }, [effectiveCampaignId]);

  function changeCampaign(
    nextId
  ) {
    const next =
      new URLSearchParams(
        searchParams
      );

    if (nextId) {
      next.set(
        'campaignId',
        nextId
      );
    } else {
      next.delete(
        'campaignId'
      );
    }

    setSearchParams(next);
  }

  const canAddWish =
    selectedCampaign &&
    ['draft', 'active'].includes(
      selectedCampaign.status
    );

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Wish log</h1>

          <p>
            {selectedCampaign
              ? selectedCampaign.name
              : 'Choose a campaign to view its wishes.'}
          </p>
        </div>

        {canAddWish && (
          <Link
            className="primary-button"
            to={`/officer/new?campaignId=${selectedCampaign._id}`}
          >
            <Plus size={18} />
            Add wish
          </Link>
        )}
      </div>

      <div className="toolbar wish-toolbar">
        <div className="searchbox">
          <Search size={17} />

          <input
            placeholder="Search nickname, foundation, code, donor…"
            value={q}
            onChange={(event) =>
              setQ(
                event.target.value
              )
            }
          />
        </div>

        <select
          value={
            effectiveCampaignId
          }
          onChange={(event) =>
            changeCampaign(
              event.target.value
            )
          }
        >
          {!campaigns.length && (
            <option value="">
              No campaigns
            </option>
          )}

          {campaigns.map(
            (campaign) => (
              <option
                value={
                  campaign._id
                }
                key={
                  campaign._id
                }
              >
                {campaign.name}
                {' · '}
                {prettyStatus(
                  campaign.status
                )}
              </option>
            )
          )}
        </select>

        <select
          value={foundation}
          onChange={(event) =>
            setFoundation(
              event.target.value
            )
          }
        >
          <option value="all">
            All foundations
          </option>

          {foundationOptions.map(
            (name) => (
              <option
                value={name}
                key={name}
              >
                {name}
              </option>
            )
          )}
        </select>

        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value
            )
          }
        >
          <option value="all">
            All statuses
          </option>

          <option value="available">
            Waiting for a Santa
          </option>

          <option value="reserved">
            Santa on the Way
          </option>

          <option value="granted">
            Wish Granted
          </option>

          <option value="paused">
            Temporarily Hidden
          </option>
        </select>
      </div>

      {selectedCampaign && (
        <div className="campaign-view-label">
          <span>
            Viewing{' '}
            <strong>
              {selectedCampaign.name}
            </strong>
          </span>

          <span
            className={`campaign-status campaign-${selectedCampaign.status}`}
          >
            {selectedCampaign.status}
          </span>
        </div>
      )}

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nickname</th>
                <th>Wish</th>
                <th>Foundation</th>
                <th>Status</th>
                <th>
                  Donor / Deadline
                </th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {wishes.map(
                (wish) => (
                  <tr key={wish._id}>
                    <td>
                      <Link
                        to={`/officer/wishes/${wish._id}`}
                      >
                        <strong>
                          {wish.nickname}
                        </strong>
                      </Link>

                      <small>
                        #{wish.ornamentCode}
                      </small>
                    </td>

                    <td>
                      {wish.wishItems.join(
                        ', '
                      )}
                    </td>

                    <td>
                      {wish.partnerFoundation}
                    </td>

                    <td>
                      <StatusBadge
                        status={
                          wish.status
                        }
                      />
                    </td>

                    <td>
                      {wish.donor ? (
                        <>
                          <span>
                            {
                              wish
                                .donor
                                .fullName
                            }
                          </span>

                          <small>
                            {wish.reservationExpiresAt
                              ? new Date(
                                  wish.reservationExpiresAt
                                ).toLocaleString()
                              : 'No deadline'}
                          </small>
                        </>
                      ) : (
                        <span className="muted">
                          —
                        </span>
                      )}
                    </td>

                    <td>
                      <Link
                        className="icon-button"
                        title="Open record"
                        to={`/officer/wishes/${wish._id}`}
                      >
                        <Gift
                          size={17}
                        />
                      </Link>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {!wishes.length && (
            <div className="empty">
              No wishes match this
              campaign view.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function prettyStatus(
  status
) {
  if (!status) {
    return '';
  }

  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  );
}