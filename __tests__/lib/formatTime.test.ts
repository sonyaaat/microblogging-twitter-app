import { formatTime } from "../../lib/formatTime";

describe("formatTime", () => {
  const fixedNow = new Date("2026-03-31T12:00:00.000Z");

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(fixedNow);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const isoSecondsAgo = (seconds: number) => new Date(fixedNow.getTime() - seconds * 1000).toISOString();

  test.each([
    [59, "just now"],
    [60, "1m ago"],
    [61, "1m ago"],
    [60 * 60, "1h ago"],
    [24 * 60 * 60, "1d ago"],
  ])("returns '%s' boundary output for %ss ago", (secondsAgo, expected) => {
    // targets: FM1, FM2, FM3
    expect(formatTime(isoSecondsAgo(secondsAgo))).toBe(expected);
  });

  it("returns a full date for input exactly 30 days ago", () => {
    // targets: FM4
    const value = isoSecondsAgo(30 * 24 * 60 * 60);
    const expected = new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    expect(formatTime(value)).toBe(expected);
  });

  it("returns 'just now' for a future date input", () => {
    // targets: FM5
    const futureIso = new Date(fixedNow.getTime() + 30_000).toISOString();
    expect(formatTime(futureIso)).toBe("just now");
  });

  test.each([null, undefined, "", "not-a-date"])(
    "does not throw for invalid input %p and returns a fallback string",
    (value) => {
      // targets: FM6
      expect(() => formatTime(value as unknown as string)).not.toThrow();
      const result = formatTime(value as unknown as string);
      expect(typeof result).toBe("string");
    }
  );

  it("returns exact '2h ago' for representative 2-hour input", () => {
    expect(formatTime(isoSecondsAgo(2 * 60 * 60))).toBe("2h ago");
  });

  it("returns exact '10d ago' for representative 10-day input", () => {
    expect(formatTime(isoSecondsAgo(10 * 24 * 60 * 60))).toBe("10d ago");
  });
});
