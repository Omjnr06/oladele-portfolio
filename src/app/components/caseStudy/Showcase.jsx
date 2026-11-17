function VaultSafeToSpend() {
  return (
    <div data-colors="fixed" className="rounded-2xl border border-accent/20 bg-gradient-to-br from-[#0F1535] to-[#0a0e22] p-6 md:p-8 max-w-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[11px] text-bright/50 tracking-wide">Safe to spend · week</span>
        <div className="flex gap-1 font-mono text-[11px]">
          <span className="px-2 py-0.5 rounded text-bright/40">Day</span>
          <span className="px-2 py-0.5 rounded bg-accent text-on-accent">Week</span>
          <span className="px-2 py-0.5 rounded text-bright/40">Month</span>
        </div>
      </div>
      <div className="text-5xl md:text-6xl font-bold tracking-tight text-bright mb-4">CA$800.00</div>
      <div className="flex items-center gap-4 text-[13px]">
        <span className="text-bright/50">Balance <span className="text-bright/80 font-semibold">CA$5,700</span></span>
        <div className="flex-1 h-1.5 rounded-full bg-bright/10 overflow-hidden">
          <div className="h-full w-[14%] bg-accent" />
        </div>
        <span className="text-bright/50">Threshold <span className="text-bright/80 font-semibold">CA$4,000</span></span>
      </div>
      <div className="font-mono text-[11px] text-bright/55 mt-2">14% of your balance is safe to spend</div>
    </div>
  );
}

const SHOWCASES = { "vault-safe-to-spend": VaultSafeToSpend };

export const SHOWCASE_IDS = Object.keys(SHOWCASES);

export default function Showcase({ id }) {
  const C = SHOWCASES[id];
  return C ? <C /> : null;
}
