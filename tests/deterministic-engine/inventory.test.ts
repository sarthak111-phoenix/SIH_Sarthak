import { describe, it, expect } from "vitest";
import {
  calculateUsableStock,
  calculateProjectedShortageDate,
} from "../../src/deterministic-engine/inventory";

describe("Deterministic Inventory Engine", () => {
  it("should correctly compute usable stock", () => {
    const result = calculateUsableStock({
      currentStock: 1000,
      reservedStock: 200,
      damagedStock: 50,
    });
    expect(result).toBe(750);
  });

  it("should handle damaged stock exceeding current stock by returning 0", () => {
    const result = calculateUsableStock({
      currentStock: 100,
      reservedStock: 50,
      damagedStock: 100,
    });
    expect(result).toBe(0);
  });

  it("should handle zero consumption without error", () => {
    const result = calculateProjectedShortageDate({
      usableStock: 500,
      averageDailyConsumption: 0,
    });
    expect(result.shortageDays).toBe(Infinity);
    expect(result.projectedDate).toBeNull();
  });

  it("should calculate correct projected shortage date when consumption > 0", () => {
    const baseDate = new Date("2026-08-23T00:00:00Z");
    const result = calculateProjectedShortageDate(
      {
        usableStock: 500,
        averageDailyConsumption: 100,
      },
      baseDate
    );
    expect(result.shortageDays).toBe(5);
    expect(result.projectedDate?.toISOString().slice(0, 10)).toBe("2026-08-28");
  });
});
