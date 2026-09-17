import mongoose from 'mongoose';

const emailVerificationSchema =
  new mongoose.Schema(
    {
      ornamentCode: {
        type: String,
        required: true,
        index: true
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true
      },

      codeHash: {
        type: String,
        required: true
      },

      expiresAt: {
        type: Date,
        required: true,
        index: true
      },

      attempts: {
        type: Number,
        default: 0
      },

      verified: {
        type: Boolean,
        default: false
      },

      donorData: {
        fullName: {
          type: String,
          required: true,
          trim: true
        },

        email: {
          type: String,
          required: true,
          trim: true,
          lowercase: true
        },

        phoneNumber: {
          type: String,
          required: true,
          trim: true
        },

        program: {
          type: String,
          required: true,
          trim: true
        },

        yearLevel: {
          type: String,
          required: true,
          trim: true
        },

        giftNamePreference: {
          type: String,
          enum: [
            'name',
            'anonymous'
          ],
          default: 'anonymous'
        }
      }
    },
    {
      timestamps: true
    }
  );

/*
 * MongoDB automatically removes expired
 * verification records.
 *
 * Note: TTL cleanup is not always immediate,
 * so the controller also checks expiresAt.
 */
emailVerificationSchema.index(
  {
    expiresAt: 1
  },
  {
    expireAfterSeconds: 0
  }
);

emailVerificationSchema.index(
  {
    ornamentCode: 1,
    email: 1
  }
);

export default mongoose.model(
  'EmailVerification',
  emailVerificationSchema
);