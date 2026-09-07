import 'dotenv/config';
import { connectDB } from './config/db.js';
import Campaign from './models/Campaign.js';
import Wish from './models/Wish.js';

await connectDB();

const unassigned = await Wish.find({ $or: [{ campaign: null }, { campaign: { $exists: false } }] }).sort({ createdAt: 1 });
if (!unassigned.length) {
  console.log('No unassigned wishes found. Migration is not needed.');
  process.exit(0);
}

const year = new Date().getFullYear();
const oldDeadline = process.env.CAMPAIGN_DEADLINE ? new Date(process.env.CAMPAIGN_DEADLINE) : null;
const validOldDeadline = oldDeadline && !Number.isNaN(oldDeadline.getTime()) ? oldDeadline : null;
const earliestCreated = unassigned[0]?.createdAt ? new Date(unassigned[0].createdAt) : new Date();
const defaultStart = new Date(Math.min(earliestCreated.getTime(), Date.now()));
const defaultDeadline = validOldDeadline || new Date(`${year}-12-15T17:00:00+08:00`);

let campaign = await Campaign.findOne({ name: `Christmas ${year}` });
if (!campaign) {
  campaign = await Campaign.create({
    name: `Christmas ${year}`,
    academicPeriod: '',
    description: 'Created automatically to group wishes that existed before campaign support was added.',
    startDate: defaultStart < defaultDeadline ? defaultStart : new Date(defaultDeadline.getTime() - 86400000),
    deadline: defaultDeadline,
    status: 'active'
  });
  console.log(`Created campaign: ${campaign.name}`);
}

const result = await Wish.updateMany(
  { $or: [{ campaign: null }, { campaign: { $exists: false } }] },
  { $set: { campaign: campaign._id, isPublished: true } }
);

console.log(`Assigned ${result.modifiedCount} existing wish(es) to ${campaign.name}.`);
console.log('Campaign migration completed.');
process.exit(0);
