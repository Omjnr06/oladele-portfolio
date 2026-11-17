import { contact } from "@/content/contact";

const ICONS = {
  email: (
    <>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </>
  ),
  linkedin: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </>
  ),
  github: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>,
  devpost: <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"></polygon>,
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </>
  ),
  x: (
    <>
      <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
    </>
  ),
};

export default function ContactLinks({ compact = false }) {
  return (
    <div className={`flex flex-wrap justify-center gap-6 md:gap-10 ${compact ? " max-w-[280px] sm:max-w-[400px] md:max-w-none mx-auto" : ""}`}>
      {contact.map((c) => (
        <a key={c.id} href={c.href} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-4">
          <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-panel border border-bright/10 flex items-center justify-center shadow-lg transition duration-300 group-hover:-translate-y-2 group-hover:border-accent group-hover:shadow-[0_0_25px_color-mix(in_srgb,var(--color-accent)_20%,transparent)] ${compact ? " overflow-hidden" : ""}`}>
            <svg className="w-8 h-8 md:w-10 md:h-10 text-muted group-hover:text-accent group-hover:scale-110 transition duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              {ICONS[c.icon]}
            </svg>
          </div>
          <span className="font-mono text-[11px] text-muted tracking-widest uppercase group-hover:text-accent transition-colors">{c.label}</span>
        </a>
      ))}
    </div>
  );
}

export function ContactSection({ compact }) {
  return (
    <div id="contact" className={`w-full flex flex-col items-center justify-center pb-32 pt-20 border-t border-bright/5 scroll-mt-24 relative`}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
      <span className="font-mono text-[11px] text-accent tracking-[0.3em] uppercase mb-4">{"// Lets Work Together"}</span>
      <h2 className="text-3xl md:text-4xl font-bold text-bright mb-12 tracking-tight">Contact Information</h2>
      <ContactLinks compact={compact} />
    </div>
  );
}
