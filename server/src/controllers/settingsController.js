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

function normalizePhoneNumber(
  value
) {
  let phoneNumber =
    String(
      value || ''
    )
      .trim()
      .replace(
        /[^\d+]/g,
        ''
      );

  /*
   * If + is used, it must be
   * the first and only +.
   */
  if (
    phoneNumber.includes('+')
  ) {
    phoneNumber =
      '+' +
      phoneNumber
        .replace(
          /\+/g,
          ''
        );
  }

  return phoneNumber;
}

function isValidEmail(
  email
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

function isValidPhoneNumber(
  phoneNumber
) {
  /*
   * Accepted Philippine formats:
   *
   * 09171234567
   * 639171234567
   * +639171234567
   */
  return /^(09\d{9}|639\d{9}|\+639\d{9})$/.test(
    phoneNumber
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

        contactPhone:
          settings.contactPhone,

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
      contactPhone,
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

      contactPhone:
        normalizePhoneNumber(
          contactPhone
        ),

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
      !cleaned.contactPhone ||
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
     * Phone-number validation
     */
    if (
      !isValidPhoneNumber(
        cleaned.contactPhone
      )
    ) {
      return res
        .status(400)
        .json({
          message:
            'Please enter a valid Philippine contact number using 09XXXXXXXXX, 639XXXXXXXXX, or +639XXXXXXXXX.'
        });
    }

    const current =
      await getOrganizationSettings();

    const changed =
      current.contactName !==
        cleaned.contactName ||
      current.contactEmail !==
        cleaned.contactEmail ||
      current.contactPhone !==
        cleaned.contactPhone ||
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

          contactPhone:
            current.contactPhone,

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

        contactPhone:
          settings.contactPhone,

        dropOffLocation:
          settings.dropOffLocation
      }
    });
  } catch (error) {
    next(error);
  }
}