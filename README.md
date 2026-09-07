# MIDSA WishLink

**MIDSA WishLink** is a MERN-based Christmas wish-giving tracker designed for a university organization. It keeps the physical Christmas tree and QR ornaments, while moving reservation, donor coordination, expiry, and officer tracking online.

## Core flow

1. MIDSA receives anonymized wish lists from partner foundations.
2. An officer logs each child using a **nickname only**, partner foundation, and wish list.
3. WishLink generates a unique ornament code and QR-linked public page.
4. MIDSA prints the ornament card. The front shows the nickname + wish; the back contains the QR.
5. A student scans the QR and sees the anonymized wish page.
6. If available, they click **“I’d like to grant [nickname]’s wish.”**
7. They provide name, university email, active phone number, program, year level, and whether their name may appear on the gift.
8. WishLink atomically reserves the wish and changes it from **Waiting for a Santa** to **Santa on the Way**.
9. The donor receives email/SMS confirmation when messaging credentials are configured.
10. If the commitment deadline passes without officer action, WishLink automatically reopens the wish.
11. Officers may extend the deadline if the donor communicates a valid delay.
12. When the physical gift is handed to an officer, only an officer marks it **Wish Granted**.

## Status language

| Database status | Public/officer label | Meaning |
|---|---|---|
| `available` | **Waiting for a Santa** | Anyone may reserve the wish. |
| `reserved` | **Santa on the Way** | A donor has committed and the wish is temporarily locked. |
| `granted` | **Wish Granted** | MIDSA has physically received the gift. |
| `paused` | **Temporarily Hidden** | Officers temporarily removed the wish from reservation without deleting it. |

## Included features

- Public QR wish page with nickname and wish only
- Secret Santa reservation form
- Concurrent/atomic reservation protection
- Configurable automatic reservation expiry
- Officer-controlled deadline extension
- Officer-only “gift received / granted” action
- Email confirmation through SMTP (optional)
- SMS confirmation through Twilio (optional)
- Mock/log behavior when email/SMS credentials are not configured
- MongoDB Atlas storage
- Officer authentication using secure HTTP-only cookie JWTs
- Dashboard counts and recent activity
- Searchable/filterable wish tracker
- Printable two-sided ornament preview with QR
- Per-wish activity/audit history
- Public page pause/unpause control
- Basic API rate limiting and HTTP security headers
- Sample seed data

## Privacy design

The public experience intentionally excludes the child’s real name, foundation, donor details, internal officer notes, and other identifying information. Only the nickname, wish list, optional age group, status, and MIDSA coordination information are exposed publicly.

**Recommendation:** do not place sensitive case details, family circumstances, addresses, diagnoses, school names, or personally identifying notes in `notes` or public-facing fields. Keep the partner foundation responsible for securely mapping nicknames back to actual beneficiaries.

## Requirements

- Node.js 20+
- npm
- MongoDB Atlas database
- Optional: SMTP account for email
- Optional: Twilio account/number for SMS

## 1. Create MongoDB Atlas database

Create a free/shared Atlas cluster, create a database user, allow your current IP address, then copy the Node.js connection string.

Example:

```text
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/midsa-wishlink?retryWrites=true&w=majority
```

## 2. Configure environment files

### Server

Copy:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and set at minimum:

```env
MONGODB_URI=your_atlas_connection_string
JWT_SECRET=use-a-long-random-secret
CLIENT_URL=http://localhost:5173
PUBLIC_APP_URL=http://localhost:5173
```

### Client

Copy:

```bash
cd ../client
cp .env.example .env
```

Default:

```env
VITE_API_URL=http://localhost:5000/api
VITE_PUBLIC_APP_URL=http://localhost:5173
```

## 3. Install dependencies

From the project root:

```bash
npm install
npm run install:all
```

## 4. Seed the first admin and sample wishes

From the project root:

```bash
npm run seed --prefix server
```

Default local seed login:

```text
Email: admin@midsa.local
Password: ChangeMe123!
```

Change this password/login approach before real deployment. You can also define `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in the server `.env` before seeding.

## 5. Run locally

From the project root:

```bash
npm run dev
```

Open:

- Officer portal: `http://localhost:5173/officer/login`
- API health: `http://localhost:5000/api/health`

## Testing QR codes with a phone

A phone cannot reach your computer through `http://localhost:5173` because `localhost` on the phone means the phone itself.

For same-Wi-Fi testing:

1. Find your computer’s LAN IP, e.g. `192.168.1.15`.
2. Run Vite so it listens on the network:

```bash
npm run dev --prefix client -- --host 0.0.0.0
```

3. Set in `server/.env`:

```env
CLIENT_URL=http://192.168.1.15:5173
PUBLIC_APP_URL=http://192.168.1.15:5173
```

4. Set in `client/.env`:

```env
VITE_API_URL=http://192.168.1.15:5000/api
VITE_PUBLIC_APP_URL=http://192.168.1.15:5173
```

5. Restart both frontend and backend.
6. Make sure your firewall permits local network access to ports 5173 and 5000.
7. Reopen/print the ornament so the QR uses the reachable URL.

For the real campaign, `PUBLIC_APP_URL` should be the deployed HTTPS website.

## Email setup

WishLink uses SMTP through Nodemailer. Fill these in `server/.env`:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-account
SMTP_PASS=your-app-password
EMAIL_FROM="MIDSA WishLink <midsa@example.edu>"
```

If these are left blank, the server simply logs an `[EMAIL MOCK]` confirmation instead of failing the reservation.

## SMS setup

Fill these in `server/.env` for Twilio:

```env
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

If omitted, the server logs an `[SMS MOCK]` message.

For a Philippine university rollout, you may later replace Twilio with your preferred local SMS gateway by editing `server/src/services/notificationService.js`.

## Reservation deadline behavior

`DEFAULT_RESERVATION_DAYS=5` means a donor normally gets five days to hand over the gift. The date is also clamped to `CAMPAIGN_DEADLINE`.

The server checks every 10 minutes for expired commitments. Expired reservations are automatically changed back to **Waiting for a Santa**, and the previous donor information is cleared from the active wish record. The action remains represented in the audit history without exposing donor details publicly.

An officer can extend a reserved wish’s deadline from its detail page when the donor has contacted MIDSA about a delay.

## Printing ornaments

Open any wish in the officer portal and press **Print ornament**. The browser’s print view is reduced to the front/back ornament card.

The on-screen QR is generated from the browser’s current URL. The backend also exposes a PNG QR endpoint for each wish at:

```text
GET /api/officer/wishes/:id/qr.png
```

That route is officer-authenticated and uses `PUBLIC_APP_URL` from the server environment.

## Suggested deployment hardening before the real event

- Deploy frontend/backend behind HTTPS.
- Use a university-controlled subdomain if available.
- Replace the seed password immediately.
- Add account-management UI or SSO for officers.
- Configure MongoDB Atlas network access narrowly.
- Use a transactional email service or official university SMTP.
- Confirm SMS costs and consent wording before enabling SMS.
- Add a privacy notice/consent text reviewed by your organization/university.
- Define a data-retention date and purge donor contact details after fulfillment/reporting.
- Back up the Atlas collection during the campaign.
- Consider a partner-foundation import CSV workflow if hundreds of wishes will be encoded.

## Project structure

```text
midsa-wishlink/
├── client/                 React + Vite frontend
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── styles/
│       └── utils/
├── server/                 Express + MongoDB backend
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── jobs/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── utils/
└── README.md
```

## Future additions that fit the concept well

- CSV/bulk wish import from partner foundations
- One-click downloadable print sheets for many ornaments
- Donor reminder email/SMS 24 hours before deadline
- Campaign analytics by foundation and fulfillment rate
- Gift intake receipt/claim stub
- Volunteer role with narrower permissions than officers
- Foundation handover checklist after the campaign
- Admin-configurable drop-off location, campaign dates, and message copy
- University-domain email validation
- Donor cancellation link with signed one-time token

---

**MIDSA WishLink — Share a little wonder.**
