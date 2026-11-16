export function themeTransition(event, apply) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduce) {
    apply();
    return;
  }

  let x = event?.clientX ?? 0;
  let y = event?.clientY ?? 0;
  if (!event || event.detail === 0) {
    const r = event?.currentTarget?.getBoundingClientRect?.();
    x = r ? r.left + r.width / 2 : window.innerWidth / 2;
    y = r ? r.top + r.height / 2 : window.innerHeight / 2;
  }
  const end = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  const root = document.documentElement;
  root.setAttribute("data-theme-switching", "");
  const t = document.startViewTransition(apply);
  t.ready
    .then(() =>
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 520, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
      ),
    )
    .catch(() => {});
  t.finished.finally(() => root.removeAttribute("data-theme-switching"));
}
