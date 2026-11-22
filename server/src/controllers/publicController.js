import { env } from '../config/env.js';
import { CallRecord } from '../models/CallRecord.js';
import { ScanEvent } from '../models/ScanEvent.js';
import { Vehicle } from '../models/Vehicle.js';
import { getTelephonyProvider } from '../services/telephony/index.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { hashIp } from '../utils/otp.js';
import { generatePublicId } from '../utils/tag.js';

const SCAN_DEDUPE_MS = 10 * 60 * 1000;

/** Only these fields are ever returned by public endpoints. No phone numbers. */
const publicCallView = (call) => ({
  publicId: call.publicId,
  status: call.status,
  demo: true,
  provider: call.provider,
  failureReason: call.failureReason || '',
  durationSec: call.durationSec || 0,
  initiatedAt: call.initiatedAt,
  connectedAt: call.connectedAt,
  endedAt: call.endedAt,
});

async function recordScan(vehicle, req) {
  const visitorKey = hashIp(req.ip, env.jwtSecret);
  const recent = await ScanEvent.findOne({
    vehicle: vehicle._id,
    visitorKey,
    createdAt: { $gte: new Date(Date.now() - SCAN_DEDUPE_MS) },
  }).lean();

  if (recent) return;

  await ScanEvent.create({
    vehicle: vehicle._id,
    owner: vehicle.owner,
    visitorKey,
    userAgent: String(req.headers['user-agent'] || '').slice(0, 300),
    referrer: String(req.headers.referer || '').slice(0, 300),
  });
  await Vehicle.updateOne({ _id: vehicle._id }, { $inc: { scanCount: 1 } });
}

export const getPublicVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOne({ tagId: req.params.tagId });
  if (!vehicle) throw new AppError('This VTag is not valid or has been removed', 404, 'TAG_NOT_FOUND');

  await recordScan(vehicle, req);

  res.json({
    success: true,
    vehicle: {
      tagId: vehicle.tagId,
      registrationNumber: vehicle.registrationNumber,
      model: vehicle.model,
      vehicleType: vehicle.vehicleType,
    },
    demo: true,
  });
});

export const startCall = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOne({ tagId: req.params.tagId });
  if (!vehicle) throw new AppError('This VTag is not valid or has been removed', 404, 'TAG_NOT_FOUND');

  const provider = getTelephonyProvider();
  const forceFailure = req.body?.forceFailure === true;

  const call = await CallRecord.create({
    vehicle: vehicle._id,
    owner: vehicle.owner,
    publicId: generatePublicId(),
    provider: provider.name,
    status: 'initiating',
    forceFailure,
  });

  const result = await provider.initiateCall({
    metadata: { forceFailure, vehicleId: vehicle._id.toString() },
  });

  call.providerCallId = result.providerCallId;
  call.status = result.status;
  await call.save();

  res.status(201).json({
    success: true,
    demo: true,
    message: 'Demo call initiated. No real phone call is placed.',
    call: publicCallView(call),
  });
});

export const getCall = asyncHandler(async (req, res) => {
  const call = await CallRecord.findOne({ publicId: req.params.publicId });
  if (!call) throw new AppError('Demo call not found', 404, 'CALL_NOT_FOUND');

  const provider = getTelephonyProvider();
  const state = await provider.getStatus(call.providerCallId);

  if (state.status !== call.status) {
    call.status = state.status;
    if (state.status === 'connected') {
      call.connectedAt = state.connectedAt || new Date();
      await Vehicle.updateOne({ _id: call.vehicle }, { $inc: { callCount: 1 } });
    }
    if (state.status === 'failed') {
      call.failureReason = state.failureReason || 'Demo call could not connect';
    }
    if (state.status === 'ended') {
      call.endedAt = state.endedAt || new Date();
    }
    await call.save();
  }

  res.json({ success: true, call: publicCallView(call) });
});

export const endCall = asyncHandler(async (req, res) => {
  const call = await CallRecord.findOne({ publicId: req.params.publicId });
  if (!call) throw new AppError('Demo call not found', 404, 'CALL_NOT_FOUND');

  const provider = getTelephonyProvider();
  const state = await provider.endCall(call.providerCallId);

  if (state.status === 'ended') {
    call.status = 'ended';
    call.endedAt = state.endedAt || new Date();
    call.durationSec = call.connectedAt
      ? Math.max(1, Math.round((call.endedAt.getTime() - call.connectedAt.getTime()) / 1000))
      : 0;
    await call.save();
  } else if (state.status === 'failed' && call.status !== 'failed') {
    call.status = 'failed';
    call.failureReason = state.failureReason || 'Demo call could not connect';
    await call.save();
  }

  res.json({ success: true, call: publicCallView(call) });
});
