import assert from 'node:assert/strict';
import test from 'node:test';

process.env.MOCK_CALL_FAILURE_RATE = '0';

const { MockTelephonyProvider } = await import('../src/services/telephony/mockProvider.js');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test('mock provider connects a normal demo call and can end it', async () => {
  const provider = new MockTelephonyProvider();
  const { providerCallId, status, demo } = await provider.initiateCall();
  assert.equal(status, 'ringing');
  assert.equal(demo, true);

  assert.equal((await provider.getStatus(providerCallId)).status, 'ringing');
  await wait(2000);
  const connected = await provider.getStatus(providerCallId);
  assert.equal(connected.status, 'connected');
  assert.ok(connected.connectedAt);

  const ended = await provider.endCall(providerCallId);
  assert.equal(ended.status, 'ended');
});

test('mock provider can simulate a failed call on demand', async () => {
  const provider = new MockTelephonyProvider();
  const { providerCallId } = await provider.initiateCall({ metadata: { forceFailure: true } });
  await wait(2000);
  const failed = await provider.getStatus(providerCallId);
  assert.equal(failed.status, 'failed');
  assert.match(failed.failureReason, /Simulated failure/);
});
