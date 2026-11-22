import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Owner } from '../models/Owner.js';
import { requestOtp, verifyOtp } from '../services/otpService.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { maskPhone } from '../utils/otp.js';

const ownerView = (owner) => ({
  id: owner._id.toString(),
  phone: maskPhone(owner.phone),
  createdAt: owner.createdAt,
});

export const requestOtpController = asyncHandler(async (req, res) => {
  const result = await requestOtp(req.body.phone);
  res.json({
    success: true,
    message: env.devOtpEnabled
      ? 'Development OTP generated. No SMS was sent.'
      : 'If the number is valid, a code has been sent.',
    devOtp: result.devOtp,
    expiresInSeconds: result.expiresInSeconds,
    resendAfterSeconds: result.resendAfterSeconds,
  });
});

export const verifyOtpController = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  await verifyOtp(phone, otp);

  const owner = await Owner.findOneAndUpdate(
    { phone },
    { $set: { lastLoginAt: new Date() } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  if (!owner) throw new AppError('Could not create account', 500, 'OWNER_CREATE_FAILED');

  const token = jwt.sign({ id: owner._id.toString() }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

  res.json({
    success: true,
    token,
    owner: ownerView(owner),
    message: 'Signed in successfully',
  });
});

export const meController = asyncHandler(async (req, res) => {
  res.json({ success: true, owner: ownerView(req.owner) });
});
