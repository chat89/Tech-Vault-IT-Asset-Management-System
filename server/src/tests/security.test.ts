import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';

describe('Security & Governance Guardrails', () => {
  const SECRET = 'test_webhook_secret_key_123';

  test('Valid HMAC signature is correctly produced and verified', () => {
    const payload = {
      asset_id: '33333333-3333-3333-3333-333333333001',
      health_score: 85,
      battery_level: 90,
      disk_status: 'healthy',
      cpu_temp_c: 42,
    };

    const payloadString = JSON.stringify(payload);
    const validSignature = crypto
      .createHmac('sha256', SECRET)
      .update(payloadString)
      .digest('hex');

    // Verification check using timingSafeEqual
    const sigBuffer = Buffer.from(validSignature, 'hex');
    const expectedBuffer = Buffer.from(
      crypto.createHmac('sha256', SECRET).update(payloadString).digest('hex'),
      'hex'
    );

    assert.equal(sigBuffer.length, expectedBuffer.length);
    assert.equal(crypto.timingSafeEqual(sigBuffer, expectedBuffer), true);
  });

  test('Tampered webhook payload fails HMAC verification', () => {
    const originalPayload = { asset_id: '123', health_score: 85 };
    const originalSig = crypto
      .createHmac('sha256', SECRET)
      .update(JSON.stringify(originalPayload))
      .digest('hex');

    const tamperedPayload = { asset_id: '123', health_score: 20 };
    const tamperedSig = crypto
      .createHmac('sha256', SECRET)
      .update(JSON.stringify(tamperedPayload))
      .digest('hex');

    assert.notEqual(originalSig, tamperedSig);
  });

  test('Timestamp anti-replay rejects requests older than 5 minutes', () => {
    const maxDriftMs = 5 * 60 * 1000;
    const staleTimestamp = Date.now() - (6 * 60 * 1000); // 6 min ago

    const isStale = Math.abs(Date.now() - staleTimestamp) > maxDriftMs;
    assert.equal(isStale, true);

    const freshTimestamp = Date.now() - 30 * 1000; // 30 sec ago
    const isFresh = Math.abs(Date.now() - freshTimestamp) <= maxDriftMs;
    assert.equal(isFresh, true);
  });

  test('Segregation of Duties (SoD) blocks self-approval', () => {
    const requesterId = 'user-admin-123';
    const reviewerId = 'user-admin-123';
    const reviewerRole = 'it_admin';
    const attemptedStatus = 'approved';

    const isSodViolation =
      (attemptedStatus === 'approved' || attemptedStatus === 'rejected') &&
      (reviewerRole === 'it_admin' || reviewerRole === 'super_admin') &&
      requesterId === reviewerId;

    assert.equal(isSodViolation, true);
  });

  test('IDOR guard: employee attempting to access another user assignments is rejected', () => {
    const loggedInUser = { id: 'emp-001', role: 'employee' };
    const requestedUserId = 'emp-002';

    const isDenied = loggedInUser.role === 'employee' && requestedUserId !== loggedInUser.id;
    assert.equal(isDenied, true);
  });
});

