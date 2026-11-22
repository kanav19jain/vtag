import assert from 'node:assert/strict';
import test from 'node:test';
import { generateOtp, hashIp, isValidPhone, maskPhone, normalizePhone } from '../src/utils/otp.js';
import { generatePublicId, generateTagId } from '../src/utils/tag.js';

test('OTP is a random 6-digit string', () => {
  const otp = generateOtp();
  assert.match(otp, /^\d{6}$/);
  const many = new Set(Array.from({ length: 200 }, () => generateOtp()));
  assert.ok(many.size > 150, 'OTP generator should not repeat predictably');
});

test('phone normalization and validation', () => {
  assert.equal(normalizePhone('+91 98765 43210'), '9876543210');
  assert.equal(normalizePhone('(555) 123-4567'), '5551234567');
  assert.equal(normalizePhone('0091 98765 43210'), '9876543210');
  assert.ok(isValidPhone(normalizePhone('+1 415 555 2671')));
  assert.ok(!isValidPhone('123'));
});

test('maskPhone never reveals the full number', () => {
  assert.equal(maskPhone('9876543210'), '••••••3210');
  assert.ok(!maskPhone('9876543210').includes('98765'));
});

test('tag ids are URL safe and unique', () => {
  const ids = new Set(Array.from({ length: 100 }, () => generateTagId()));
  assert.equal(ids.size, 100);
  for (const id of ids) assert.match(id, /^vt_[A-Za-z0-9_-]{16}$/);
  assert.match(generatePublicId(), /^[0-9a-f-]{36}$/);
});

test('IP hashing is deterministic and irreversible', () => {
  const a = hashIp('127.0.0.1', 'secret');
  assert.equal(a, hashIp('127.0.0.1', 'secret'));
  assert.notEqual(a, hashIp('127.0.0.2', 'secret'));
  assert.ok(!a.includes('127.0.0.1'));
});
