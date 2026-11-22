import { Schema, model } from 'mongoose';

export const VEHICLE_TYPES = ['car', 'bike', 'suv', 'truck', 'van', 'ev', 'other'];

const vehicleSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'Owner',
      required: true,
      index: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 20,
    },
    model: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    vehicleType: {
      type: String,
      required: true,
      enum: VEHICLE_TYPES,
      default: 'car',
    },
    tagId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    /** Pre-generated PNG data URL so owners can download the QR at any time. */
    qrDataUrl: {
      type: String,
      required: true,
    },
    scanCount: {
      type: Number,
      default: 0,
    },
    callCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

vehicleSchema.index({ owner: 1, registrationNumber: 1 }, { unique: true });

export const Vehicle = model('Vehicle', vehicleSchema);
