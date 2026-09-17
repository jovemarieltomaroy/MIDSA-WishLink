import { Link } from 'react-router-dom';

import {
  CalendarDays,
  CheckCircle2,
  Plus
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useCampaign } from '../context/CampaignContext';

export default function CampaignsPage() {
  const { user } =
    useAuth();

  const {
    campaigns,
    activeCampaign
  } = useCampaign();

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Campaigns</h1>

          <p>
            Keep each giving period
            separate, reusable, and
            easy to report.
          </p>
        </div>

        {user?.role ===
          'admin' && (
          <Link
            className="primary-button"
            to="/officer/campaigns/new"
          >
            <Plus size={18} />
            New campaign
          </Link>
        )}
      </div>

      {activeCampaign ? (
        <div className="active-campaign-banner">

          <div>
            <strong>
              {activeCampaign.name}{' '}
              is currently active.
            </strong>

            <span>
              Only this campaign can
              accept public QR
              reservations.
            </span>
          </div>
        </div>
      ) : (
        <div className="campaign-info-notice">
          <strong>
            No campaign is active.
          </strong>

          <span>
            Draft campaigns can still
            be prepared, but QR
            reservations will stay
            closed until an admin
            activates one.
          </span>
        </div>
      )}

      <div className="campaign-card-grid">
        {campaigns.map(
          (campaign) => (
            <article
              className="panel campaign-card"
              key={campaign._id}
            >
              <div className="campaign-card-top">
                <div className="campaign-icon">
                  <CalendarDays
                    size={20}
                  />
                </div>

                <div
                  className={`campaign-status campaign-${campaign.status}`}
                >
                  {campaign.status}
                </div>
              </div>

              <h2>
                {campaign.name}
              </h2>

              <p>
                {campaign.academicPeriod ||
                  'No academic period specified'}
              </p>

              <div className="campaign-dates">
                <span>
                  {formatDate(
                    campaign.startDate
                  )}
                </span>

                <span>→</span>

                <span>
                  {formatDate(
                    campaign.deadline
                  )}
                </span>
              </div>

              <div className="campaign-metrics">
                <div>
                  <strong>
                    {campaign.wishCount ||
                      0}
                  </strong>

                  <small>
                    Wishes
                  </small>
                </div>

                <div>
                  <strong>
                    {campaign.grantedCount ||
                      0}
                  </strong>

                  <small>
                    Granted
                  </small>
                </div>

                <div>
                  <strong>
                    {campaign.completionRate ||
                      0}
                    %
                  </strong>

                  <small>
                    Complete
                  </small>
                </div>
              </div>

              <div className="campaign-card-actions">
                <Link
                  className="secondary-button"
                  to={`/officer/campaigns/${campaign._id}`}
                >
                  Open campaign
                </Link>

                <Link
                  className="text-button"
                  to={`/officer/wishes?campaignId=${campaign._id}`}
                >
                  View wishes
                </Link>
              </div>
            </article>
          )
        )}
      </div>

      {!campaigns.length && (
        <div className="panel empty">
          No campaigns yet. Create
          one before adding wishes.
        </div>
      )}
    </div>
  );
}

function formatDate(value) {
  return new Date(
    value
  ).toLocaleDateString(
    'en-PH',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }
  );
}