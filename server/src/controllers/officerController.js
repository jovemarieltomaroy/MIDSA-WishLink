import QRCode from 'qrcode';
import mongoose from 'mongoose';
import Wish from '../models/Wish.js';
import User from '../models/User.js';
import Campaign from '../models/Campaign.js';
import { createOrnamentCode } from '../utils/codes.js';
import { sendDeadlineUpdate } from '../services/notificationService.js';
import { releaseExpiredReservations } from '../services/wishService.js';

function campaignFilter(campaignId) {
  return campaignId ? { campaign: campaignId } : {};
}

export async function dashboard(req, res) {
  await releaseExpiredReservations();
  const { campaignId } = req.query;
  const base = campaignFilter(campaignId);
  const aggregateBase = campaignId && mongoose.isValidObjectId(campaignId)
    ? { campaign: new mongoose.Types.ObjectId(campaignId) }
    : {};
  const [total, available, reserved, granted, paused, recent, foundations] = await Promise.all([
    Wish.countDocuments(base),
    Wish.countDocuments({ ...base, status: 'available' }),
    Wish.countDocuments({ ...base, status: 'reserved' }),
    Wish.countDocuments({ ...base, status: 'granted' }),
    Wish.countDocuments({ ...base, status: 'paused' }),
    Wish.find(base)
      .populate('campaign', 'name academicPeriod status deadline')
      .sort({ updatedAt: -1 })
      .limit(8)
      .select('nickname wishItems status reservationExpiresAt updatedAt ornamentCode partnerFoundation campaign'),
    Wish.aggregate([
      { $match: aggregateBase },
      {
        $group: {
          _id: '$partnerFoundation',
          total: { $sum: 1 },
          available: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
          reserved: { $sum: { $cond: [{ $eq: ['$status', 'reserved'] }, 1, 0] } },
          granted: { $sum: { $cond: [{ $eq: ['$status', 'granted'] }, 1, 0] } },
          paused: { $sum: { $cond: [{ $eq: ['$status', 'paused'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  res.json({
    stats: {
      total,
      available,
      reserved,
      granted,
      paused,
      completionRate: total ? Math.round((granted / total) * 1000) / 10 : 0
    },
    recent,
    foundations: foundations.map((row) => ({
      name: row._id || 'Unspecified',
      total: row.total,
      available: row.available,
      reserved: row.reserved,
      granted: row.granted,
      paused: row.paused
    }))
  });
}

export async function listWishes(req, res) {
  await releaseExpiredReservations();
  const { status, q, campaignId, foundation } = req.query;
  const filter = {};
  if (campaignId) filter.campaign = campaignId;
  if (foundation && foundation !== 'all') filter.partnerFoundation = foundation;
  if (status && status !== 'all') filter.status = status;
  if (q) {
    filter.$or = [
      { nickname: { $regex: q, $options: 'i' } },
      { partnerFoundation: { $regex: q, $options: 'i' } },
      { ornamentCode: { $regex: q, $options: 'i' } },
      { 'donor.fullName': { $regex: q, $options: 'i' } },
      { 'donor.universityEmail': { $regex: q, $options: 'i' } }
    ];
  }
  const wishes = await Wish.find(filter)
    .populate('campaign', 'name academicPeriod status deadline')
    .sort({ createdAt: -1 });
  res.json({ wishes });
}

export async function getWish(req, res) {
  const wish = await Wish.findById(req.params.id)
    .populate('grantedByOfficer', 'name email')
    .populate('campaign', 'name academicPeriod startDate deadline status');
  if (!wish) return res.status(404).json({ message: 'Wish not found.' });
  res.json({ wish });
}

export async function createWish(req, res) {
  const { campaignId, nickname, partnerFoundation, wishItems, notes, ageGroup } = req.body;
  if (!campaignId) return res.status(400).json({ message: 'Please choose a campaign.' });
  if (!nickname || !partnerFoundation || !Array.isArray(wishItems) || !wishItems.filter(Boolean).length) {
    return res.status(400).json({ message: 'Nickname, partner foundation, and at least one wish item are required.' });
  }

  const campaign = await Campaign.findById(campaignId);
  if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });
  if (['completed', 'archived'].includes(campaign.status)) {
    return res.status(409).json({ message: 'New wishes cannot be added to a completed or archived campaign.' });
  }

  let code;
  do { code = createOrnamentCode(); } while (await Wish.exists({ ornamentCode: code }));
  const wish = await Wish.create({
    campaign: campaign._id,
    nickname: nickname.trim(),
    partnerFoundation: partnerFoundation.trim(),
    wishItems: wishItems.map((x) => String(x).trim()).filter(Boolean),
    notes: notes?.trim() || '',
    ageGroup: ageGroup?.trim() || '',
    ornamentCode: code,
    isPublished: true,
    history: [{
      action: 'wish_created',
      toStatus: 'available',
      note: `Wish added to ${campaign.name}.`,
      actorName: req.user.name,
      actorType: 'officer'
    }]
  });
  await wish.populate('campaign', 'name academicPeriod startDate deadline status');
  res.status(201).json({ wish });
}

export async function updateWish(req, res) {
  const wish = await Wish.findById(req.params.id);
  if (!wish) return res.status(404).json({ message: 'Wish not found.' });
  const allowed = ['nickname', 'partnerFoundation', 'wishItems', 'notes', 'ageGroup'];
  for (const key of allowed) if (req.body[key] !== undefined) wish[key] = req.body[key];

  if (req.body.campaignId !== undefined) {
    const campaign = await Campaign.findById(req.body.campaignId);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });
    if (['completed', 'archived'].includes(campaign.status)) {
      return res.status(409).json({ message: 'A wish cannot be moved into a completed or archived campaign.' });
    }
    wish.campaign = campaign._id;
  }

  wish.history.push({ action: 'wish_updated', note: 'Wish details were updated.', actorName: req.user.name, actorType: 'officer' });
  await wish.save();
  await wish.populate('campaign', 'name academicPeriod startDate deadline status');
  res.json({ wish });
}

export async function changeStatus(req, res) {
  const { status, note } = req.body;
  if (!['available', 'reserved', 'granted', 'paused'].includes(status)) return res.status(400).json({ message: 'Invalid status.' });
  const wish = await Wish.findById(req.params.id).populate('campaign');
  if (!wish) return res.status(404).json({ message: 'Wish not found.' });
  if (status === 'reserved' && !wish.donor) return res.status(400).json({ message: 'A wish cannot be marked reserved without donor information.' });
  if (status === 'available' && wish.campaign && ['completed', 'archived'].includes(wish.campaign.status)) {
    return res.status(409).json({ message: 'A completed or archived campaign cannot reopen wishes.' });
  }

  const from = wish.status;
  wish.status = status;
  if (status === 'available') {
    wish.donor = undefined;
    wish.reservationExpiresAt = null;
    wish.grantedAt = null;
    wish.grantedByOfficer = null;
  }
  if (status === 'granted') {
    wish.grantedAt = new Date();
    wish.grantedByOfficer = req.user._id;
    wish.reservationExpiresAt = null;
  }
  wish.history.push({ action: 'status_changed', fromStatus: from, toStatus: status, note: note || '', actorName: req.user.name, actorType: 'officer' });
  await wish.save();
  res.json({ wish });
}

export async function extendDeadline(req, res) {
  const wish = await Wish.findById(req.params.id).populate('campaign');
  if (!wish) return res.status(404).json({ message: 'Wish not found.' });
  if (wish.status !== 'reserved' || !wish.donor) return res.status(400).json({ message: 'Only reserved wishes can have a donor deadline.' });
  const next = new Date(req.body.reservationExpiresAt);
  if (Number.isNaN(next.getTime()) || next <= new Date()) return res.status(400).json({ message: 'Choose a future deadline.' });
  if (wish.campaign?.deadline && next > new Date(wish.campaign.deadline)) {
    return res.status(400).json({ message: 'Deadline cannot be after the campaign deadline.' });
  }
  wish.reservationExpiresAt = next;
  wish.donor.promisedDropOffAt = next;
  wish.history.push({ action: 'deadline_extended', note: req.body.note || `Drop-off deadline moved to ${next.toISOString()}.`, actorName: req.user.name, actorType: 'officer' });
  await wish.save();
  sendDeadlineUpdate(wish).catch((error) => console.error('Deadline update notification error:', error));
  res.json({ wish });
}

export async function qrPng(req, res) {
  const wish = await Wish.findById(req.params.id);
  if (!wish) return res.status(404).json({ message: 'Wish not found.' });
  const url = `${process.env.PUBLIC_APP_URL || process.env.CLIENT_URL}/wish/${wish.ornamentCode}`;
  const png = await QRCode.toBuffer(url, { width: 600, margin: 2, errorCorrectionLevel: 'M' });
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', `inline; filename="${wish.nickname}-${wish.ornamentCode}-qr.png"`);
  res.send(png);
}

export async function deleteWish(req, res) {
  const wish = await Wish.findById(req.params.id);
  if (!wish) return res.status(404).json({ message: 'Wish not found.' });
  if (wish.status === 'reserved') return res.status(409).json({ message: 'Release or grant the reservation before deleting this wish.' });
  await wish.deleteOne();
  res.json({ message: 'Wish deleted.' });
}

export async function listOfficers(req, res) {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users });
}

export async function createOfficer(req, res) {
  const { name, email, password, role = 'officer' } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required.' });
  const user = await User.create({ name, email, password, role: role === 'admin' ? 'admin' : 'officer' });
  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}
