import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Smart Procurement Forecasting Engine Logic', () => {
  test('Runway days reaches 0 when available stock is exhausted or equals pending requests', () => {
    const availableStock = 2;
    const pendingRequests = 2;
    const monthlyBurn = 1.0;
    const dailyBurn = monthlyBurn / 30;

    const netAvailable = Math.max(0, availableStock - pendingRequests);
    const runwayDays = netAvailable === 0 ? 0 : Math.round(netAvailable / dailyBurn);

    assert.equal(runwayDays, 0);
  });

  test('Lead time and safety stock establish sensible reorder point', () => {
    const monthlyBurn = 3.0; // 3 laptops/month
    const dailyBurn = monthlyBurn / 30; // 0.1 laptops/day
    const leadTimeDays = 14;
    const safetyBufferDays = 30;

    const safetyStock = Math.ceil(dailyBurn * safetyBufferDays); // ceil(3) = 3 units
    const reorderPoint = Math.ceil((dailyBurn * leadTimeDays) + safetyStock); // ceil(1.4 + 3) = 5 units

    assert.equal(safetyStock, 3);
    assert.equal(reorderPoint, 5);

    // If current stock is 2 (below reorder point 5), suggested reorder restores target 90-day buffer (9 units)
    const availableStock = 2;
    const targetBuffer = Math.ceil(monthlyBurn * 3); // 9 units
    const suggestedReorder = Math.max(0, targetBuffer - availableStock);

    assert.equal(suggestedReorder, 7);
  });

  test('High-runway categories with no pending demand require zero reorders', () => {
    const availableStock = 10;
    const monthlyBurn = 0.5;
    const pendingRequests = 0;

    const targetBuffer = Math.ceil(monthlyBurn * 3); // 2 units
    const suggestedReorder = Math.max(0, targetBuffer + pendingRequests - availableStock);

    assert.equal(suggestedReorder, 0);
  });
});

