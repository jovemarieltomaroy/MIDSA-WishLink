import { isValidMessengerUrl } from '../utils/messenger.js';
import OrganizationSettings from '../models/OrganizationSettings.js';

import {
  getOrganizationSettings
} from '../services/organizationSettingsService.js';

function normalizeEmail(
  value
) {
  return String(
    value || ''
  )
    .trim()
    .toLowerCase();
}

function isValidEmail(
  email
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

export async function getSettings(
  req,
  res,
  next
) {
  try {
    const settings =
      await getOrganizationSettings();

    return res.json({
      settings: {
        contactName:
          settings.contactName,

        contactEmail:
          settings.contactEmail,

        messengerUrl:
          settings.messengerUrl,

        dropOffLocation:
          settings.dropOffLocation
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(
  req,
  res,
  next
) {
  try {
    const {
      contactName,
      contactEmail,
      messengerUrl,
      dropOffLocation
    } =
      req.body;

    const cleaned = {
      contactName:
        String(
          contactName || ''
        ).trim(),

      contactEmail:
        normalizeEmail(
          contactEmail
        ),

      messengerUrl:
        String(messengerUrl || '').trim(),

      dropOffLocation:
        String(
          dropOffLocation || ''
        ).trim()
    };

    /*
     * Required field validation
     */
    if (
      !cleaned.contactName ||
      !cleaned.contactEmail ||
      !cleaned.dropOffLocation
    ) {
      return res
        .status(400)
        .json({
          message:
            'Please complete all organization contact details.'
        });
    }

    /*
     * Email validation
     */
    if (
      !isValidEmail(
        cleaned.contactEmail
      )
    ) {
      return res
        .status(400)
        .json({
          message:
            'Please enter a valid contact email address.'
        });
    }

    /*
     * Messenger-link validation
     */
    if (
      !isValidMessengerUrl(
        cleaned.messengerUrl
      )
    ) {
      return res
        .status(400)
        .json({
          message:
            'Please enter a valid HTTPS Messenger link, such as https://m.me/yourpage.'
        });
    }

    const current =
      await getOrganizationSettings();

    const changed =
      current.contactName !==
        cleaned.contactName ||
      current.contactEmail !==
        cleaned.contactEmail ||
      current.messengerUrl !==
        cleaned.messengerUrl ||
      current.dropOffLocation !==
        cleaned.dropOffLocation;

    if (
      !changed
    ) {
      return res.json({
        message:
          'No changes were made.',

        settings: {
          contactName:
            current.contactName,

          contactEmail:
            current.contactEmail,

          messengerUrl:
            current.messengerUrl,

          dropOffLocation:
            current.dropOffLocation
        }
      });
    }

    const settings =
      await OrganizationSettings.findOneAndUpdate(
        {
          settingsKey:
            'primary'
        },
        {
          $set:
            cleaned
        },
        {
          new:
            true,

          upsert:
            true,

          runValidators:
            true,

          setDefaultsOnInsert:
            true
        }
      );

    return res.json({
      message:
        'Organization details updated successfully.',

      settings: {
        contactName:
          settings.contactName,

        contactEmail:
          settings.contactEmail,

        messengerUrl:
          settings.messengerUrl,

        dropOffLocation:
          settings.dropOffLocation
      }
    });
  } catch (error) {
    next(error);
  }
}