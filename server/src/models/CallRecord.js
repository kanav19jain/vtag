import { Schema, model } from 'mongoose';

export const CALL_STATUSES = ['initiating', 'ringing', 'connected', 'ended', 'failed'];

const callRecordSchema = new Schema(
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
    /** Public lookup token; the internal _id is never sent to clients. */
    publicId: {
      type: String,
      required: true,
      unique: true,
    },
    provider: {
      type: String,
      default: 'mock',
    },
    providerCallId: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: CALL_STATUSES,
      default: 'initiating',
      index: true,
    },
    failureReason: {
      type: String,
      default: '',
    },
    forceFailure: {
      type: Boolean,
      default: false,
    },
    demo: {
      type: Boolean,
      default: true,
    },
    initiatedAt: {
      type: Date,
      default: Date.now,
    },
    connectedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    durationSec: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const CallRecord = model('CallRecord', callRecordSchema);
