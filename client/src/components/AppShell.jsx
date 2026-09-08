import {
  NavLink,
  Outlet,
  useNavigate
} from 'react-router-dom';

import {
  CalendarDays,
  Gift,
  LayoutDashboard,
  LogOut,
  TreePine
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useCampaign } from '../context/CampaignContext';

import logo from '../assets/logo.png';

export default function AppShell() {
  const {
    user,
    logout
  } = useAuth();

  const navigate =
    useNavigate();

  const {
    activeCampaign,
    loadingCampaigns
  } = useCampaign();

  async function signOut() {
    await logout();

    navigate(
      '/officer/login'
    );
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <img
            className="brand-mark"
            src={logo}
            alt="MIDSA WishLink Logo"
          />

          <div>
            <strong>
              MIDSA WishLink
            </strong>

            <span>
              MIDSAkatuparan Tracker
            </span>
          </div>
        </div>

        <div className="active-campaign-card">
          <small>
            ACTIVE CAMPAIGN
          </small>

          {loadingCampaigns ? (
            <span>
              Checking campaign…
            </span>
          ) : activeCampaign ? (
            <NavLink
              to={`/officer/campaigns/${activeCampaign._id}`}
            >
              <strong>
                {activeCampaign.name}
              </strong>

              <span>
                {activeCampaign.academicPeriod ||
                  'Currently accepting reservations'}
              </span>
            </NavLink>
          ) : (
            <NavLink
              to="/officer/campaigns"
            >
              <strong>
                No active campaign
              </strong>

              <span>
                Activate a campaign to
                open QR reservations.
              </span>
            </NavLink>
          )}
        </div>

        <nav>
          <NavLink
            to="/officer"
            end
          >
            <LayoutDashboard
              size={18}
            />
            Dashboard
          </NavLink>

          <NavLink
            to="/officer/campaigns"
          >
            <CalendarDays
              size={18}
            />
            Campaigns
          </NavLink>

          <NavLink
            to="/officer/wishes"
          >
            <TreePine
              size={18}
            />
            Wishes
          </NavLink>

          <NavLink
            to="/officer/new"
          >
            <Gift size={18} />
            Add wish
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="user-chip">
            <span>
              {user?.name}
            </span>

            <small>
              {user?.role}
            </small>
          </div>

          <button
            className="ghost-button full"
            onClick={signOut}
          >
            <LogOut
              size={17}
            />
            Sign out
          </button>
        </div>
      </aside>

      <main className="shell-main">
        <Outlet />
      </main>
    </div>
  );
}