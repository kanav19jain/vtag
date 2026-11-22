import { Schema, model } from 'mongoose';

const scanEventSchema = new Schema(
  {
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'Owner',
      required: true,
      index: true,
    },
    /** HMAC of visitor IP - raw IP addresses are never persisted. */
    visitorKey: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      default: '',
    },
    referrer: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

scanEventSchema.index({ vehicle: 1, visitorKey: 1, createdAt: -1 });

export const ScanEvent = model('ScanEvent', scanEventSchema);
