import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    academicPeriod: {
      type: String,
      trim: true,
      default: '',
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    startDate: {
      type: Date,
      required: true,
    },

    deadline: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        'draft',
        'active',
        'completed',
        'archived',
      ],
      default: 'draft',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

campaignSchema.index(
  { status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: 'active',
    },
    name: 'single_active_campaign',
  }
);

export default mongoose.model(
  'Campaign',
  campaignSchema
);