import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import { api } from '../utils/api';

const CampaignContext =
  createContext(null);

export function CampaignProvider({
  children
}) {
  const [
    campaigns,
    setCampaigns
  ] = useState([]);

  const [
    loadingCampaigns,
    setLoadingCampaigns
  ] = useState(true);

  async function refreshCampaigns() {
    setLoadingCampaigns(true);

    try {
      const response =
        await api.get(
          '/officer/campaigns',
          {
            params: {
              includeArchived: true
            }
          }
        );

      setCampaigns(
        response.data.campaigns || []
      );
    } finally {
      setLoadingCampaigns(false);
    }
  }

  useEffect(() => {
    refreshCampaigns();
  }, []);

  const activeCampaign =
    useMemo(
      () =>
        campaigns.find(
          (campaign) =>
            campaign.status ===
            'active'
        ) || null,
      [campaigns]
    );

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        activeCampaign,
        activeCampaignId:
          activeCampaign?._id || '',
        refreshCampaigns,
        loadingCampaigns
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign() {
  const context =
    useContext(CampaignContext);

  if (!context) {
    throw new Error(
      'useCampaign must be used inside CampaignProvider.'
    );
  }

  return context;
}