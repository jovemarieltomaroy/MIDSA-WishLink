import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      /*
       * Password is no longer required.
       *
       * Existing password-based users can still
       * retain their password value in MongoDB,
       * but Google users do not need one.
       */
      password: {
        type: String,
        minlength: 8,
        select: false,
        default: undefined,
      },

      /*
       * Firebase UID assigned to the Google account.
       */
      firebaseUid: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
      },

      /*
       * Lets us know how this account authenticates.
       */
      authProvider: {
        type: String,
        enum: [
          'local',
          'google',
        ],
        default:
          'google',
      },

      role: {
        type: String,
        enum: [
          'officer',
          'admin',
        ],
        default:
          'officer',
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    }
  );

userSchema.pre(
  'save',
  async function () {
    if (
      !this.isModified(
        'password'
      ) ||
      !this.password
    ) {
      return;
    }

    this.password =
      await bcrypt.hash(
        this.password,
        12
      );
  }
);

userSchema.methods.comparePassword =
  function (
    candidate
  ) {
    if (
      !this.password
    ) {
      return false;
    }

    return bcrypt.compare(
      candidate,
      this.password
    );
  };

export default mongoose.model(
  'User',
  userSchema
);