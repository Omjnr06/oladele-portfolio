export function Kbd({ children }) {
  return (
    <kbd className="mr-1 inline-flex h-5 min-w-5 items-center justify-center rounded border border-line-strong bg-panel px-1 font-mono text-[11px] leading-none text-fg/80 shadow-[inset_0_-1px_0_rgb(255_255_255/.06)]">
      {children}
    </kbd>
  );
}
