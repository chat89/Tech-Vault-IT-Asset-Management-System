import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateDepreciation } from '../services/financial.service';

describe('Financial Lifecycle & Depreciation Engine Tests', () => {
  test('Straight-Line depreciation computes correctly over half of useful life', () => {
    const purchaseCost = 2000;
    const salvageValue = 200;
    const usefulLifeYears = 4;
    // 2 years ago
    const twoYearsAgo = new Date(Date.now() - 2 * 365.25 * 86400 * 1000);

    const result = calculateDepreciation({
      purchaseCost,
      purchaseDate: twoYearsAgo,
      salvageValue,
      usefulLifeYears,
      depreciationModel: 'STRAIGHT_LINE',
    });

    // Depreciable base = 1800, annual = 450, 2 years = 900 depr, book value = 1100
    assert.equal(result.purchaseCost, 2000);
    assert.equal(result.salvageValue, 200);
    assert.equal(result.annualDepreciation, 450);
    assert.ok(Math.abs(result.currentBookValue - 1100) < 5);
    assert.ok(Math.abs(result.depreciatedPercentage - 50) < 1);
    assert.equal(result.isFullyDepreciated, false);
  });

  test('Book value never drops below salvage value even past useful life', () => {
    const purchaseCost = 1000;
    const salvageValue = 150;
    const usefulLifeYears = 3;
    // 5 years ago (exceeds 3 years useful life)
    const fiveYearsAgo = new Date(Date.now() - 5 * 365.25 * 86400 * 1000);

    const result = calculateDepreciation({
      purchaseCost,
      purchaseDate: fiveYearsAgo,
      salvageValue,
      usefulLifeYears,
      depreciationModel: 'STRAIGHT_LINE',
    });

    assert.equal(result.currentBookValue, 150);
    assert.equal(result.isFullyDepreciated, true);
    assert.equal(result.depreciatedPercentage, 100);
  });

  test('Double-Declining balance accelerates early depreciation', () => {
    const purchaseCost = 3000;
    const salvageValue = 300;
    const usefulLifeYears = 4;
    // 1 year ago: DDB rate = 2/4 = 50%
    const oneYearAgo = new Date(Date.now() - 1 * 365.25 * 86400 * 1000);

    const result = calculateDepreciation({
      purchaseCost,
      purchaseDate: oneYearAgo,
      salvageValue,
      usefulLifeYears,
      depreciationModel: 'DOUBLE_DECLINING',
    });

    // 50% depreciation in Year 1 -> ~1500
    assert.ok(result.currentBookValue < 1600 && result.currentBookValue > 1400);
    assert.ok(result.depreciatedPercentage >= 50);
  });

  test('Disposed asset stops depreciation and freezes at salvage', () => {
    const result = calculateDepreciation({
      purchaseCost: 2500,
      purchaseDate: new Date('2024-01-01'),
      salvageValue: 250,
      usefulLifeYears: 3,
      isDisposed: true,
    });

    assert.equal(result.currentBookValue, 250);
    assert.equal(result.isFullyDepreciated, true);
    assert.equal(result.annualDepreciation, 0);
  });

  test('Edge case: handles zero or negative purchase cost gracefully', () => {
    const result = calculateDepreciation({
      purchaseCost: 0,
      purchaseDate: new Date(),
    });

    assert.equal(result.purchaseCost, 0);
    assert.equal(result.currentBookValue, 0);
    assert.equal(result.isFullyDepreciated, true);
  });
});

