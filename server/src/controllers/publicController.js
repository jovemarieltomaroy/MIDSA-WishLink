import Wish from '../models/Wish.js';
import { getDefaultExpiry } from '../utils/dates.js';
import { releaseExpiredReservations } from '../services/wishService.js';
import { sendReservationConfirmation } from '../services/notificationService.js';

function reservationsAllowed(campaign) {
  if (!campaign || campaign.status !== 'active') return false;
  const now = new Date();
  return now >= new Date(campaign.startDate) && now <= new Date(campaign.deadline);
}

function campaignPublicState(campaign) {
  if (!campaign) return 'unassigned';
  const now = new Date();
  if (campaign.status === 'archived' || campaign.status === 'completed' || now > new Date(campaign.deadline)) return 'concluded';
  if (campaign.status === 'draft' || now < new Date(campaign.startDate)) return 'upcoming';
  return 'active';
}

function publicWish(wish) {
  const campaign = wish.campaign || null;
  const canReserve = reservationsAllowed(campaign);
  const remainingMs = wish.reservationExpiresAt ? new Date(wish.reservationExpiresAt) - new Date() : 0;
  return {
    ornamentCode: wish.ornamentCode,
    nickname: wish.nickname,
    wishItems: wish.wishItems,
    ageGroup: wish.ageGroup,
    status: wish.status,
    reservationExpiresAt: wish.status === 'reserved' ? wish.reservationExpiresAt : null,
    proposedReservationExpiresAt: wish.status === 'available' && canReserve ? getDefaultExpiry(campaign?.deadline) : null,
    daysRemaining: wish.status === 'reserved' ? Math.max(0, Math.ceil(remainingMs / 86400000)) : null,
    reservationsAllowed: canReserve,
    campaignState: campaignPublicState(campaign),
    campaign: campaign ? {
      name: campaign.name,
      academicPeriod: campaign.academicPeriod,
      startDate: campaign.startDate,
      deadline: campaign.deadline,
      status: campaign.status
    } : null,
    organization: {
      contactName: process.env.ORG_CONTACT_NAME,
      contactEmail: process.env.ORG_CONTACT_EMAIL,
      contactPhone: process.env.ORG_CONTACT_PHONE,
      dropOffLocation: process.env.DROP_OFF_LOCATION,
      campaignDeadline: campaign?.deadline || null
    }
  };
}

export async function getPublicWish(req, res) {
  await releaseExpiredReservations();
  const wish = await Wish.findOne({ ornamentCode: req.params.code, isPublished: true }).populate('campaign');
  if (!wish) return res.status(404).json({ message: 'This wish could not be found.' });
  res.json({ wish: publicWish(wish) });
}

export async function reserveWish(req, res) {
  await releaseExpiredReservations();
  const { fullName, universityEmail, phoneNumber, program, yearLevel, giftNamePreference } = req.body;
  if (![fullName, universityEmail, phoneNumber, program, yearLevel].every((v) => String(v || '').trim())) {
    return res.status(400).json({ message: 'Please complete all required donor fields.' });
  }

  const current = await Wish.findOne({ ornamentCode: req.params.code, isPublished: true }).populate('campaign');
  if (!current) return res.status(404).json({ message: 'This wish could not be found.' });
  if (!reservationsAllowed(current.campaign)) {
    return res.status(409).json({ message: 'This campaign is not currently accepting wish reservations.' });
  }

  const expiry = getDefaultExpiry(current.campaign.deadline);
  const wish = await Wish.findOneAndUpdate(
    { ornamentCode: req.params.code, status: 'available', isPublished: true, campaign: current.campaign._id },
    {
      $set: {
        status: 'reserved',
        donor: {
          fullName: String(fullName).trim(),
          universityEmail: String(universityEmail).trim().toLowerCase(),
          phoneNumber: String(phoneNumber).trim(),
          program: String(program).trim(),
          yearLevel: String(yearLevel).trim(),
          giftNamePreference: giftNamePreference === 'name' ? 'name' : 'anonymous',
          reservedAt: new Date(),
          promisedDropOffAt: expiry,
          lastConfirmationSentAt: new Date()
        },
        reservationExpiresAt: expiry
      },
      $push: {
        history: {
          action: 'wish_reserved',
          fromStatus: 'available',
          toStatus: 'reserved',
          note: 'A university donor committed to grant this wish.',
          actorName: String(fullName).trim(),
          actorType: 'donor',
          at: new Date()
        }
      }
    },
    { new: true }
  ).populate('campaign');

  if (!wish) {
    const latest = await Wish.findOne({ ornamentCode: req.params.code });
    return res.status(409).json({
      message: latest?.status === 'granted'
        ? 'This wish has already been granted.'
        : 'Someone else has already reserved this wish. Please choose another wish or check again later.'
    });
  }

  sendReservationConfirmation(wish).catch((error) => console.error('Confirmation notification error:', error));
  res.status(201).json({ message: 'Your wish reservation is confirmed.', wish: publicWish(wish) });
}
