import OrganizationSettings from '../models/OrganizationSettings.js';

function getFallbackSettings() {
  return {
    contactName:
      process.env.ORG_CONTACT_NAME ||
      'MIDSA Christmas Program Team',

    contactEmail:
      process.env.ORG_CONTACT_EMAIL ||
      '',

    contactPhone:
      process.env.ORG_CONTACT_PHONE ||
      '',

    dropOffLocation:
      process.env.DROP_OFF_LOCATION ||
      'MIDSA designated drop-off point'
  };
}

export async function getOrganizationSettings() {
  try {
    let settings =
      await OrganizationSettings.findOne({
        settingsKey: 'primary'
      });

    /*
     * If no settings document exists yet,
     * create it using the old environment
     * values as the initial data.
     */
    if (!settings) {
      settings =
        await OrganizationSettings.create({
          settingsKey:
            'primary',

          ...getFallbackSettings()
        });
    }

    return settings;
  } catch (error) {
    console.error(
      'Organization settings database error:',
      error
    );

    /*
     * IMPORTANT:
     * Public WishLink pages should not stop
     * working because the settings document
     * could not be retrieved.
     */
    return getFallbackSettings();
  }
}

export async function getPublicOrganizationSettings() {
  try {
    const settings =
      await getOrganizationSettings();

    return {
      contactName:
        settings.contactName ||
        process.env.ORG_CONTACT_NAME ||
        'MIDSA Christmas Program Team',

      contactEmail:
        settings.contactEmail ||
        process.env.ORG_CONTACT_EMAIL ||
        '',

      contactPhone:
        settings.contactPhone ||
        process.env.ORG_CONTACT_PHONE ||
        '',

      dropOffLocation:
        settings.dropOffLocation ||
        process.env.DROP_OFF_LOCATION ||
        'MIDSA designated drop-off point'
    };
  } catch (error) {
    console.error(
      'Unable to prepare public organization settings:',
      error
    );

    return getFallbackSettings();
  }
}