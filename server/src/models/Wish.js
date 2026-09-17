import mongoose from 'mongoose';

const donorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true
    },

    email: {
      type: String,
      trim: true,
      lowercase: true
    },

    phoneNumber: {
      type: String,
      trim: true
    },

    program: {
      type: String,
      trim: true
    },

    yearLevel: {
      type: String,
      trim: true
    },

    giftNamePreference: {
      type: String,
      enum: ['name', 'anonymous'],
      default: 'anonymous'
    },

    reservedAt: Date,

    promisedDropOffAt: Date,

    lastConfirmationSentAt: Date
  },
  {
    _id: false
  }
);

const historySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true
    },

    fromStatus: String,

    toStatus: String,

    note: String,

    actorName: String,

    actorType: {
      type: String,
      enum: [
        'donor',
        'officer',
        'system'
      ],
      default: 'system'
    },

    at: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: false
  }
);

const wishSchema =
  new mongoose.Schema(
    {
      campaign: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        index: true,
        default: null
      },

      nickname: {
        type: String,
        required: true,
        trim: true
      },

      partnerFoundation: {
        type: String,
        required: true,
        trim: true
      },

      wishItems: [
        {
          type: String,
          required: true,
          trim: true
        }
      ],

      notes: {
        type: String,
        trim: true,
        default: ''
      },

      ageGroup: {
        type: String,
        trim: true,
        default: ''
      },

      ornamentCode: {
        type: String,
        unique: true,
        index: true
      },

      status: {
        type: String,
        enum: [
          'available',
          'reserved',
          'granted',
          'paused'
        ],
        default: 'available',
        index: true
      },

      donor: {
        type: donorSchema,
        default: undefined
      },

      reservationExpiresAt: {
        type: Date,
        default: null,
        index: true
      },

      grantedAt: {
        type: Date,
        default: null
      },

      grantedByOfficer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },

      isPublished: {
        type: Boolean,
        default: true
      },

      history: {
        type: [historySchema],
        default: []
      }
    },
    {
      timestamps: true
    }
  );

wishSchema.index({
  campaign: 1,
  status: 1,
  reservationExpiresAt: 1
});

wishSchema.index({
  campaign: 1,
  partnerFoundation: 1
});

export default mongoose.model(
  'Wish',
  wishSchema
);