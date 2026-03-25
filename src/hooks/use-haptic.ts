"use client";

export function useHaptic() {
  function vibrate(pattern: number | number[] = 50) {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }

  return {
    tap: () => vibrate(50),
    success: () => vibrate([50, 30, 80]),
    error: () => vibrate([80, 40, 80]),
  };
}
