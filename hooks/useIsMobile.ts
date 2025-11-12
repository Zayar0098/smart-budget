export default function useIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const isTouch =
      "ontouchstart" in window ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
      (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    return Boolean(isTouch);
  } catch {
    return false;
  }
}
