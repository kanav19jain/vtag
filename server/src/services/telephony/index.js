import { env } from '../../config/env.js';
import { MockTelephonyProvider } from './mockProvider.js';

let provider;

export function getTelephonyProvider() {
  if (provider) return provider;

  switch (env.telephonyProvider) {
    case 'mock':
    default:
      provider = new MockTelephonyProvider();
  }
  return provider;
}
