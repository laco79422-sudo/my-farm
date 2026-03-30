/**
 * 후면 카메라 우선(capture) UX — 모바일·터치 기기에서 true.
 * PC/데스크톱은 파일 선택(업로드) 위주로 분기.
 */
export function prefersCameraCapture(): boolean {
  if (typeof window === 'undefined') return false;
  const narrow = window.matchMedia('(max-width: 768px)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const touch = 'ontouchstart' in window || (navigator.maxTouchPoints ?? 0) > 0;
  return narrow || (coarse && touch);
}
