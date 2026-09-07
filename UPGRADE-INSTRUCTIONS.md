# MIDSA WishLink Campaign Upgrade

This version adds reusable campaigns/giving periods and foundation grouping while keeping the existing QR, donor reservation, deadline, status, and officer workflows.

## Important before running

Keep your existing `server/.env` and `client/.env` files from your current project. They are intentionally not included in this ZIP because they contain private credentials.

The old `CAMPAIGN_DEADLINE` environment variable is no longer used for normal campaign operation. Campaign start/end dates are now stored in MongoDB. You may leave the old value in `.env` temporarily because the one-time migration script uses it as the initial deadline for pre-existing wishes.

## One-time setup for an existing database

1. Replace your project source files with the files in this package, but keep your existing `.env` files.
2. Install dependencies if needed:

   npm install --prefix server
   npm install --prefix client

3. Run the one-time migration before starting the app:

   npm run migrate:campaigns --prefix server

   This creates a `Christmas <current year>` campaign and assigns any old wishes that do not yet have a campaign.

4. Start the app as usual:

   npm run dev

## New officer workflow

- Campaigns are managed under **Officer > Campaigns**.
- A campaign has a name, academic period, start date, final drop-off deadline, and status.
- Campaign statuses: Draft, Active, Completed, Archived.
- Only one campaign is automatically kept Active when an admin activates another one.
- The sidebar has a **Working Campaign** selector.
- Dashboard and Wish Log are filtered by the selected campaign.
- Wish Log can also filter by foundation and wish status.
- New wishes must belong to a Draft or Active campaign.
- Public QR reservations are allowed only when the campaign is Active and the current date is between its start date and deadline.
- Completed/Archived campaign QR pages remain viewable but cannot accept new reservations.

## Campaign deadline behavior

The donor reservation deadline is still based on `DEFAULT_RESERVATION_DAYS`, but it is automatically capped at the selected campaign's final deadline.

Example:
- Default reservation days = 5
- Donor reserves Dec 13
- Campaign deadline = Dec 15
- Donor deadline becomes Dec 15, not Dec 18

## Files added

- `server/src/models/Campaign.js`
- `server/src/controllers/campaignController.js`
- `server/src/migrateCampaigns.js`
- `client/src/context/CampaignContext.jsx`
- `client/src/pages/CampaignsPage.jsx`
- `client/src/pages/NewCampaignPage.jsx`
- `client/src/pages/CampaignDetailPage.jsx`

## Files modified

- `server/src/models/Wish.js`
- `server/src/controllers/officerController.js`
- `server/src/controllers/publicController.js`
- `server/src/routes/officerRoutes.js`
- `server/src/services/wishService.js`
- `server/src/services/notificationService.js`
- `server/src/utils/dates.js`
- `server/src/seed.js`
- `server/package.json`
- `client/src/App.jsx`
- `client/src/components/AppShell.jsx`
- `client/src/pages/DashboardPage.jsx`
- `client/src/pages/WishesPage.jsx`
- `client/src/pages/NewWishPage.jsx`
- `client/src/pages/WishDetailPage.jsx`
- `client/src/pages/PublicWishPage.jsx`
- `client/src/pages/GrantWishPage.jsx`
- `client/src/styles/main.css`

## Validation performed

All server-side JavaScript files added/modified were syntax checked with Node, and all client-side JSX/JS source files were parsed successfully with Babel's JSX parser. A full Vite build could not be completed in the Linux sandbox because the uploaded `node_modules` came from another platform and its native Rolldown binding is platform-specific. On your own machine, running `npm install --prefix client` will install the correct native dependency before `npm run build --prefix client`.
