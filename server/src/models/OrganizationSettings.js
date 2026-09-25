import mongoose from 'mongoose';

const organizationSettingsSchema =
  new mongoose.Schema(
    {
      settingsKey: {
        type: String,
        default: 'primary',
        unique: true,
        immutable: true
      },

      contactName: {
        type: String,
        trim: true,
        default:
          'MIDSA Christmas Program Team'
      },

      contactEmail: {
        type: String,
        trim: true,
        lowercase: true,
        default: ''
      },

      contactPhone: {
        type: String,
        trim: true,
        default: ''
      },

      dropOffLocation: {
        type: String,
        trim: true,
        default: ''
      }
    },
    {
      timestamps: true
    }
  );

export default mongoose.model(
  'OrganizationSettings',
  organizationSettingsSchema
);