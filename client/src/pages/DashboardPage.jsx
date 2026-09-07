import { useEffect, useState } from 'react';
import {
  Gift,
  HeartHandshake,
  Sparkles,
  TimerReset,
  TreePine
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { api } from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import { useCampaign } from '../context/CampaignContext';

export default function DashboardPage() {
  const {
    activeCampaign,
    activeCampaignId,
    loadingCampaigns
  } = useCampaign();

  const [data, setData] = useState(null);

  useEffect(() => {
    if (!activeCampaignId) {
      setData(null);
      return;
    }

    api
      .get('/officer/dashboard', {
        params: {
          campaignId: activeCampaignId
        }
      })
      .then((response) => {
        setData(response.data);
      });
  }, [activeCampaignId]);

  if (loadingCampaigns) {
    return (
      <div className="page">
        <div className="panel empty">
          Loading active campaign…
        </div>
      </div>
    );
  }

  if (!activeCampaign) {
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <h1>MIDSA WishLink</h1>

            <p>
              No giving campaign is currently active.
            </p>
          </div>
        </div>

        <div className="panel empty dashboard-empty-campaign">
          <h2>No active campaign</h2>

          <p>
            Create or open a draft campaign, prepare its wishes,
            then activate it when MIDSA is ready to accept student
            reservations.
          </p>

          <Link
            className="primary-button"
            to="/officer/campaigns"
          >
            Open campaigns
          </Link>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="campaign-status campaign-active">
            active
          </div>

          <h1>{activeCampaign.name}</h1>

          <p>
            {activeCampaign.academicPeriod ||
              'Track every ornament, promise, deadline, and completed drop-off.'}
          </p>
        </div>

        <Link
          className="primary-button"
          to={`/officer/new?campaignId=${activeCampaignId}`}
        >
          <Gift size={18} />
          Add a wish
        </Link>
      </div>

      <div className="stats-grid">
        <Stat
          icon={<TreePine />}
          label="All wishes"
          value={stats.total || 0}
        />

        <Stat
          icon={<Sparkles />}
          label="Waiting for a Santa"
          value={stats.available || 0}
        />

        <Stat
          icon={<TimerReset />}
          label="Santa on the Way"
          value={stats.reserved || 0}
        />

        <Stat
          icon={<HeartHandshake />}
          label="Wish Granted"
          value={stats.granted || 0}
        />
      </div>

      <div className="panel campaign-summary-panel">
        <div className="panel-head">
          <div>
            <h2>Foundation overview</h2>

            <p>
              {stats.completionRate || 0}% overall completion for
              this campaign.
            </p>
          </div>

          <Link
            to={`/officer/campaigns/${activeCampaignId}`}
            className="text-button"
          >
            Full campaign summary
          </Link>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Partner foundation</th>
                <th>Total</th>
                <th>Waiting</th>
                <th>Reserved</th>
                <th>Granted</th>
              </tr>
            </thead>

            <tbody>
              {data?.foundations?.map((row) => (
                <tr key={row.name}>
                  <td>
                    <strong>{row.name}</strong>
                  </td>

                  <td>{row.total}</td>
                  <td>{row.available}</td>
                  <td>{row.reserved}</td>
                  <td>{row.granted}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {!data?.foundations?.length && (
            <div className="empty">
              No foundation records yet.
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Recent wishes</h2>
          </div>

          <Link
            to={`/officer/wishes?campaignId=${activeCampaignId}`}
            className="text-button"
          >
            View all
          </Link>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Child</th>
                <th>Wish</th>
                <th>Foundation</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>

            <tbody>
              {data?.recent?.map((wish) => (
                <tr key={wish._id}>
                  <td>
                    <Link to={`/officer/wishes/${wish._id}`}>
                      {wish.nickname}
                    </Link>

                    <small>#{wish.ornamentCode}</small>
                  </td>

                  <td>{wish.wishItems.join(', ')}</td>

                  <td>
                    {wish.partnerFoundation}
                  </td>

                  <td>
                    <StatusBadge status={wish.status} />
                  </td>

                  <td>
                    {new Date(
                      wish.updatedAt
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!data?.recent?.length && (
            <div className="empty">
              No wishes have been added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}