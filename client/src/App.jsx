import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from 'react-router-dom';

import {
  AuthProvider
} from './context/AuthContext';

import {
  CampaignProvider
} from './context/CampaignContext';

import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';

import PublicWishPage from './pages/PublicWishPage';
import LandingPage from './pages/LandingPage';
import WishGalleryPage from './pages/WishGalleryPage';
import GrantWishPage from './pages/GrantWishPage';
import LoginPage from './pages/LoginPage';

import DashboardPage from './pages/DashboardPage';
import WishesPage from './pages/WishesPage';
import NewWishPage from './pages/NewWishPage';
import WishDetailPage from './pages/WishDetailPage';

import CampaignsPage from './pages/CampaignsPage';
import NewCampaignPage from './pages/NewCampaignPage';
import CampaignDetailPage from './pages/CampaignDetailPage';

import AccountSettingsPage from './pages/AccountSettingsPage';

import './styles/main.css';
import './styles/branding.css';
import './styles/public-campaign.css';
import './styles/tag-assets.css';
import './styles/tag-variants.css';
import './styles/gallery.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/gallery" element={<WishGalleryPage />} />

          <Route
            path="/"
            element={
              <LandingPage />
            }
          />

          <Route
            path="/wish/:code"
            element={
              <PublicWishPage />
            }
          />

          <Route
            path="/wish/:code/grant"
            element={
              <GrantWishPage />
            }
          />

          <Route
            path="/officer/login"
            element={
              <LoginPage />
            }
          />

          <Route
            path="/officer"
            element={
              <ProtectedRoute>
                <CampaignProvider>
                  <AppShell />
                </CampaignProvider>
              </ProtectedRoute>
            }
          >

            <Route
              index
              element={
                <DashboardPage />
              }
            />

            <Route
              path="campaigns"
              element={
                <CampaignsPage />
              }
            />

            <Route
              path="campaigns/new"
              element={
                <NewCampaignPage />
              }
            />

            <Route
              path="campaigns/:id"
              element={
                <CampaignDetailPage />
              }
            />

            <Route
              path="wishes"
              element={
                <WishesPage />
              }
            />

            <Route
              path="wishes/:id"
              element={
                <WishDetailPage />
              }
            />

            <Route
              path="new"
              element={
                <NewWishPage />
              }
            />

            <Route
              path="settings"
              element={
                <AccountSettingsPage />
              }
            />

          </Route>

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
