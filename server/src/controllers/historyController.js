import { CallRecord } from '../models/CallRecord.js';
import { ScanEvent } from '../models/ScanEvent.js';
import { Vehicle } from '../models/Vehicle.js';
import { asyncHandler } from '../utils/errors.js';

const vehicleSummary = (vehicle) =>
  vehicle
    ? {
        id: vehicle._id.toString(),
        registrationNumber: vehicle.registrationNumber,
        model: vehicle.model,
        tagId: vehicle.tagId,
        vehicleType: vehicle.vehicleType,
      }
    : null;

export const getHistory = asyncHandler(async (req, res) => {
  const ownerId = req.owner._id;

  const [vehicles, scans, calls] = await Promise.all([
    Vehicle.find({ owner: ownerId }).select('registrationNumber model tagId vehicleType scanCount callCount'),
    ScanEvent.find({ owner: ownerId })
      .populate('vehicle', 'registrationNumber model tagId vehicleType')
      .sort({ createdAt: -1 })
      .limit(20),
    CallRecord.find({ owner: ownerId })
      .populate('vehicle', 'registrationNumber model tagId vehicleType')
      .sort({ createdAt: -1 })
      .limit(20),
  ]);

  res.json({
    success: true,
    totals: {
      vehicles: vehicles.length,
      scans: vehicles.reduce((sum, v) => sum + (v.scanCount || 0), 0),
      calls: vehicles.reduce((sum, v) => sum + (v.callCount || 0), 0),
    },
    scans: scans.map((scan) => ({
      id: scan._id.toString(),
      vehicle: vehicleSummary(scan.vehicle),
      createdAt: scan.createdAt,
    })),
    calls: calls.map((call) => ({
      id: call.publicId,
      vehicle: vehicleSummary(call.vehicle),
      status: call.status,
      demo: call.demo,
      durationSec: call.durationSec || 0,
      createdAt: call.createdAt,
    })),
  });
});
