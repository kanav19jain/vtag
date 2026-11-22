import QRCode from 'qrcode';
import { env } from '../config/env.js';

export const tagUrl = (tagId) => `${env.clientUrl}/t/${tagId}`;

/** Returns a high-resolution PNG data URL for a vehicle tag. */
export async function createVehicleQr(tagId) {
  const url = tagUrl(tagId);
  const dataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 640,
    color: { dark: '#0B1120', light: '#FFFFFF' },
  });
  return { url, dataUrl };
}

export function dataUrlToPngBuffer(dataUrl) {
  const base64 = String(dataUrl || '').split(',')[1];
  if (!base64) throw new Error('Invalid QR data URL');
  return Buffer.from(base64, 'base64');
}
