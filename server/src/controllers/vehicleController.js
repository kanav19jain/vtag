import { CallRecord } from '../models/CallRecord.js';
import { ScanEvent } from '../models/ScanEvent.js';
import { Vehicle } from '../models/Vehicle.js';
import { createVehicleQr, dataUrlToPngBuffer, tagUrl } from '../services/qrService.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { generateTagId } from '../utils/tag.js';

const vehicleView = (vehicle) => ({
  id: vehicle._id.toString(),
  registrationNumber: vehicle.registrationNumber,
  model: vehicle.model,
  vehicleType: vehicle.vehicleType,
  tagId: vehicle.tagId,
  tagUrl: tagUrl(vehicle.tagId),
  qrDataUrl: vehicle.qrDataUrl,
  scanCount: vehicle.scanCount || 0,
  callCount: vehicle.callCount || 0,
  createdAt: vehicle.createdAt,
});

export const listVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ owner: req.owner._id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, vehicles: vehicles.map(vehicleView) });
});

export const createVehicle = asyncHandler(async (req, res) => {
  const { registrationNumber, model, vehicleType } = req.body;

  let vehicle;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const tagId = generateTagId();
    const { dataUrl } = await createVehicleQr(tagId);
    try {
      vehicle = await Vehicle.create({
        owner: req.owner._id,
        registrationNumber,
        model,
        vehicleType,
        tagId,
        qrDataUrl: dataUrl,
      });
      break;
    } catch (error) {
      // Retry only on an unlikely tagId collision; surface duplicate plates.
      if (error.code === 11000 && error.keyPattern?.tagId) continue;
      throw error;
    }
  }

  if (!vehicle) {
    throw new AppError('Could not generate a unique tag. Please try again.', 500, 'TAG_GENERATION_FAILED');
  }

  res.status(201).json({ success: true, vehicle: vehicleView(vehicle) });
});

export const getVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, owner: req.owner._id });
  if (!vehicle) throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
  res.json({ success: true, vehicle: vehicleView(vehicle) });
});

export const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, owner: req.owner._id });
  if (!vehicle) throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');

  await Promise.all([
    ScanEvent.deleteMany({ vehicle: vehicle._id }),
    CallRecord.deleteMany({ vehicle: vehicle._id }),
  ]);

  res.json({ success: true, message: 'Vehicle and its history were removed' });
});

export const downloadQr = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, owner: req.owner._id });
  if (!vehicle) throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');

  const png = dataUrlToPngBuffer(vehicle.qrDataUrl);
  const safeName = vehicle.registrationNumber.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
  res.set({
    'Content-Type': 'image/png',
    'Content-Disposition': `attachment; filename="vtag-${safeName}-${vehicle.tagId}.png"`,
    'Cache-Control': 'private, max-age=3600',
  });
  res.send(png);
});
