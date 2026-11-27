import { holidayCampaignName } from '../utils/holidayCopy';
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
    searchParams.get(
      'campaignId'
    ) || '';

  /*
   * Priority:
   * 1. Campaign selected from URL
   * 2. Active campaign
   * 3. First available campaign
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

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    setFoundation('all');
    setFoundationOptions([]);
  }, [effectiveCampaignId]);

  useEffect(() => {
    if (!effectiveCampaignId) {
      setWishes([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    const timer = setTimeout(async () => {
      try {
        const response = await api.get('/officer/wishes', {
          params: { campaignId: effectiveCampaignId, status, foundation, q }
        });
        if (!cancelled) {
          setWishes(response.data.wishes || []);
          setFoundationOptions(response.data.foundations || []);
        }
      } catch {
        if (!cancelled) setLoadError('Could not load wishes. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, q ? 180 : 0);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [status, foundation, q, effectiveCampaignId]);

  function changeCampaign(
    nextId
  ) {
    const next =
      new URLSearchParams(
        searchParams
      );

    if (
      nextId
    ) {
      next.set(
        'campaignId',
        nextId
      );
    } else {
      next.delete(
        'campaignId'
      );
    }

    setSearchParams(
      next
    );
  }

  const canAddWish =
    selectedCampaign &&
    [
      'draft',
      'active'
    ].includes(
      selectedCampaign.status
    );

  return (
    <div className="page">

      <div className="page-head">

        <div>
          <h1>
            Wish log
          </h1>

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
            <Plus
              size={18}
            />

            Add wish
          </Link>
        )}

      </div>

      <div className="toolbar wish-toolbar">

        <div className="searchbox">

          <Search
            size={17}
          />

          <input
            placeholder="Search nickname, foundation, code…"
            value={q}
            onChange={(
              event
            ) =>
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
          onChange={(
            event
          ) =>
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
                {holidayCampaignName(campaign.name)}
                {' · '}
                {prettyStatus(
                  campaign.status
                )}
              </option>
            )
          )}

        </select>

        <select
          value={
            foundation
          }
          onChange={(
            event
          ) =>
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
                value={
                  name
                }
                key={
                  name
                }
              >
                {name}
              </option>
            )
          )}

        </select>

        <select
          value={
            status
          }
          onChange={(
            event
          ) =>
            setStatus(
              event.target.value
            )
          }
        >

          <option value="all">
            All statuses
          </option>

          <option value="available">
            Waiting for a donor
          </option>

          <option value="reserved">
            Gift on the way
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
        <div
          className="campaign-view-label"
          style={{
            display:
              'flex',

            alignItems:
              'center',

            justifyContent:
              'space-between',

            gap:
              '16px',

            flexWrap:
              'wrap'
          }}
        >

          <div
            style={{
              display:
                'flex',

              alignItems:
                'center',

              gap:
                '6px',

              minWidth:
                0
            }}
          >
            <span>
              Viewing
            </span>

            <strong>
              {selectedCampaign.name}
            </strong>
          </div>

          <span
            className={`campaign-status campaign-${selectedCampaign.status}`}
            style={{
              flexShrink:
                0
            }}
          >
            {prettyStatus(
              selectedCampaign.status
            )}
          </span>

        </div>
      )}

      <div className="panel">

        <div className="table-wrap">

          <table>

            <thead>
              <tr>
                <th>
                  Nickname
                </th>

                <th>
                  Wish
                </th>

                <th>
                  Foundation
                </th>

                <th>
                  Status
                </th>

                <th>
                  Donor / Deadline
                </th>

                <th></th>
              </tr>
            </thead>

            <tbody>

              {wishes.map(
                (wish) => (
                  <tr
                    key={
                      wish._id
                    }
                  >

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
                      {(wish.wishItems?.join(', ') || 'See wishlist worksheet')}
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
                                ).toLocaleString(
                                  'en-PH'
                                )
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

          {loading && <div className="empty" role="status">Loading wishes?</div>}
          {loadError && <div className="alert" role="alert">{loadError}</div>}
          {!loading && !loadError && !wishes.length && (
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
    status
      .charAt(0)
      .toUpperCase() +
    status.slice(1)
  );
}