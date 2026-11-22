import crypto from 'node:crypto';
import { env } from '../../config/env.js';
import { TelephonyProvider } from './provider.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const RING_MS = 1900;

/**
 * Simulated telephony provider. It never dials a real number and never
 * stores or exposes a phone number. All state lives in memory.
 */
export class MockTelephonyProvider extends TelephonyProvider {
  constructor() {
    super();
    this.calls = new Map();
  }

  get name() {
    return 'mock-demo';
  }

  async initiateCall({ metadata = {} } = {}) {
    await delay(450);

    const providerCallId = `sim_${crypto.randomBytes(8).toString('hex')}`;
    const forceFailure = Boolean(metadata.forceFailure);
    const willFail = forceFailure || Math.random() < env.mockCallFailureRate;

    this.calls.set(providerCallId, {
      status: 'ringing',
      willFail,
      forceFailure,
      startedAt: Date.now(),
      connectedAt: null,
      endedAt: null,
    });

    return { providerCallId, status: 'ringing', demo: true };
  }

  async getStatus(providerCallId) {
    const call = this.calls.get(providerCallId);
    if (!call) {
      return { status: 'failed', failureReason: 'Demo call no longer available' };
    }

    if (call.status === 'ringing' && Date.now() - call.startedAt >= RING_MS) {
      if (call.willFail) {
        call.status = 'failed';
        call.failureReason = call.forceFailure
          ? 'Simulated failure requested from demo controls'
          : 'Network unreachable (simulated)';
      } else {
        call.status = 'connected';
        call.connectedAt = Date.now();
      }
    }

    return {
      status: call.status,
      connectedAt: call.connectedAt ? new Date(call.connectedAt) : null,
      endedAt: call.endedAt ? new Date(call.endedAt) : null,
      failureReason: call.failureReason || '',
    };
  }

  async endCall(providerCallId) {
    const call = this.calls.get(providerCallId);
    if (!call) {
      return { status: 'failed', failureReason: 'Demo call no longer available' };
    }
    if (call.status === 'failed' || call.status === 'ended') {
      return { status: call.status, endedAt: call.endedAt };
    }

    call.status = 'ended';
    call.endedAt = Date.now();
    return { status: 'ended', endedAt: new Date(call.endedAt) };
  }
}
