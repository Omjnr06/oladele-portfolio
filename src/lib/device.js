export function isHandheld() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    navigator.userAgentData?.mobile === true ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  );
}
