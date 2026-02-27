import { describe, test, expect } from "bun:test";
import {
  findCaseInsensitive,
  includesCaseInsensitive,
  findByNameCaseInsensitive,
  equalsIgnoreCase,
} from "./case-insensitive";

describe("findCaseInsensitive", () => {
  test("returns undefined for empty/undefined object", () => {
    // #given - undefined object
    const obj = undefined;

    // #when - lookup any key
    const result = findCaseInsensitive(obj, "key");

    // #then - returns undefined
    expect(result).toBeUndefined();
  });

  test("finds exact match first", () => {
    // #given - object with exact key
    const obj = { "advisor-plan": "value" }; // legacy label should still resolve to the same value

    // #when - lookup with exact case
    const result = findCaseInsensitive(obj, "advisor-plan");

    // #then - returns exact match
    expect(result).toBe("value");
  });

  test("finds case-insensitive match when no exact match", () => {
    // #given - object with lowercase key
    const obj = { "advisor-plan": "value" };

    // #when - lookup with uppercase
    const result = findCaseInsensitive(obj, "ADVISOR-PLAN");

    // #then - returns case-insensitive match
    expect(result).toBe("value");
  });

  test("returns undefined when key not found", () => {
    // #given - object without target key
    const obj = { other: "value" };

    // #when - lookup missing key
    const result = findCaseInsensitive(obj, "advisor-plan");

    // #then - returns undefined
    expect(result).toBeUndefined();
  });
});

describe("includesCaseInsensitive", () => {
  test("returns true for exact match", () => {
    // #given - array with exact value
    const arr = ["researcher-codebase", "researcher-data"];

    // #when - check exact match
    const result = includesCaseInsensitive(arr, "researcher-codebase");

    // #then - returns true
    expect(result).toBe(true);
  });

  test("returns true for case-insensitive match", () => {
    // #given - array with lowercase values
    const arr = ["scan-ops", "researcher-data"];

    // #when - check uppercase value
    const result = includesCaseInsensitive(arr, "SCAN-OPS");

    // #then - returns true
    expect(result).toBe(true);
  });

  test("returns true for mixed case match", () => {
    // #given - array with mixed case values
    const arr = ["advisor-plan", "operator"];

    // #when - check different case
    const result = includesCaseInsensitive(arr, "ADVISOR-PLAN");

    // #then - returns true
    expect(result).toBe(true);
  });

  test("returns false when value not found", () => {
    // #given - array without target value
    const arr = ["researcher-codebase", "researcher-data"];

    // #when - check missing value
    const result = includesCaseInsensitive(arr, "advisor-plan");

    // #then - returns false
    expect(result).toBe(false);
  });

  test("returns false for empty array", () => {
    // #given - empty array
    const arr: string[] = [];

    // #when - check any value
    const result = includesCaseInsensitive(arr, "researcher-codebase");

    // #then - returns false
    expect(result).toBe(false);
  });
});

describe("findByNameCaseInsensitive", () => {
  test("finds element by exact name", () => {
    // #given - array with named objects
    const arr = [
      { name: "advisor-plan", value: 1 },
      { name: "researcher-codebase", value: 2 },
    ];

    // #when - find by exact name
    const result = findByNameCaseInsensitive(arr, "advisor-plan");

    // #then - returns matching element
    expect(result).toEqual({ name: "advisor-plan", value: 1 });
  });

  test("finds element by case-insensitive name", () => {
    // #given - array with named objects
    const arr = [
      { name: "advisor-plan", value: 1 },
      { name: "researcher-codebase", value: 2 },
    ];

    // #when - find by different case
    const result = findByNameCaseInsensitive(arr, "ADVISOR-PLAN");

    // #then - returns matching element
    expect(result).toEqual({ name: "advisor-plan", value: 1 });
  });

  test("returns undefined when name not found", () => {
    // #given - array without target name
    const arr = [{ name: "advisor-plan", value: 1 }];

    // #when - find missing name
    const result = findByNameCaseInsensitive(arr, "researcher-data");

    // #then - returns undefined
    expect(result).toBeUndefined();
  });
});

describe("equalsIgnoreCase", () => {
  test("returns true for same case", () => {
    // #given - same strings
    // #when - compare
    // #then - returns true
    expect(equalsIgnoreCase("advisor-plan", "advisor-plan")).toBe(true);
  });

  test("returns true for different case", () => {
    // #given - strings with different case
    // #when - compare
    // #then - returns true
    expect(equalsIgnoreCase("advisor-plan", "ADVISOR-PLAN")).toBe(true);
    expect(equalsIgnoreCase("operator", "OPERATOR")).toBe(true);
  });

  test("returns false for different strings", () => {
    // #given - different strings
    // #when - compare
    // #then - returns false
    expect(equalsIgnoreCase("advisor-plan", "researcher-codebase")).toBe(false);
  });
});
