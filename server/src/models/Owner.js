import { Schema, model } from 'mongoose';

const ownerSchema = new Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^\d{10,15}$/,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Owner = model('Owner', ownerSchema);
