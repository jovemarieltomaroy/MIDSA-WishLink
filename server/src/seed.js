import 'dotenv/config';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Wish from './models/Wish.js';
import Campaign from './models/Campaign.js';
import { createOrnamentCode } from './utils/codes.js';

await connectDB();
const adminEmail = process.env.SEED_ADMIN_EMAIL || 'adminECE@midsa.com';
const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'password123!';

let admin = await User.findOne({ email: adminEmail });
if (!admin) {
  admin = await User.create({ name: 'MIDSA Admin', email: adminEmail, password: adminPassword, role: 'admin' });
  console.log(`Created admin: ${adminEmail} / ${adminPassword}`);
} else {
  console.log(`Admin already exists: ${adminEmail}`);
}

const year = new Date().getFullYear();
let campaign = await Campaign.findOne({ name: `Christmas ${year}` });
if (!campaign) {
  campaign = await Campaign.create({
    name: `Christmas ${year}`,
    academicPeriod: `1st Semester AY ${year}–${year + 1}`,
    description: 'MIDSA Christmas giving campaign.',
    startDate: new Date(`${year}-11-01T08:00:00+08:00`),
    deadline: process.env.CAMPAIGN_DEADLINE
      ? new Date(process.env.CAMPAIGN_DEADLINE)
      : new Date(`${year}-12-15T17:00:00+08:00`),
    status: 'active',
    createdBy: admin._id
  });
  console.log(`Created campaign: ${campaign.name}`);
}

if ((await Wish.countDocuments()) === 0) {
  await Wish.create([
    {
      campaign: campaign._id,
      nickname: 'Star',
      partnerFoundation: 'Sample Partner Foundation',
      wishItems: ['School backpack', 'Colored pencils'],
      ageGroup: '8–10',
      ornamentCode: createOrnamentCode(),
      history: [{ action: 'wish_created', toStatus: 'available', note: 'Sample wish.', actorName: admin.name, actorType: 'officer' }]
    },
    {
      campaign: campaign._id,
      nickname: 'Mochi',
      partnerFoundation: 'Sample Partner Foundation',
      wishItems: ['Story books', 'Art materials'],
      ageGroup: '11–13',
      ornamentCode: createOrnamentCode(),
      history: [{ action: 'wish_created', toStatus: 'available', note: 'Sample wish.', actorName: admin.name, actorType: 'officer' }]
    },
    {
      campaign: campaign._id,
      nickname: 'Comet',
      partnerFoundation: 'Sample Partner Foundation',
      wishItems: ['Basketball', 'Sports shirt'],
      ageGroup: '14–16',
      ornamentCode: createOrnamentCode(),
      history: [{ action: 'wish_created', toStatus: 'available', note: 'Sample wish.', actorName: admin.name, actorType: 'officer' }]
    }
  ]);
  console.log('Created 3 sample wishes.');
}
process.exit(0);
