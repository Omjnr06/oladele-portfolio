let root = null;

export function setScrollRoot(el) {
  root = el;
}

export function getScrollRoot() {
  return root;
}

export function scrollTop() {
  return root ? root.scrollTop : window.scrollY;
}

export function onScroll(cb) {
  const target = root || window;
  target.addEventListener("scroll", cb, { passive: true });
  return () => target.removeEventListener("scroll", cb);
}

export function scrollToTop({ smooth = true } = {}) {
  (root || window).scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
}

export function scrollToId(id, { smooth = true } = {}) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  return true;
}

export function lockScroll() {
  if (root) {
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }
  const y = window.scrollY;
  const b = document.body.style;
  b.position = "fixed";
  b.top = `-${y}px`;
  b.width = "100%";
  return () => {
    b.position = "";
    b.top = "";
    b.width = "";
    window.scrollTo(0, y);
  };
}
