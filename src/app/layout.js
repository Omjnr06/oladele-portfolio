import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./themes.generated.css";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { DEFAULT_THEME } from "@/lib/themes";
import { NO_FLASH_SCRIPT } from "@/lib/themeScript";
import PaletteHost from "./components/palette/PaletteHost";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://www.magbadelojr.com"),
  title: "Oladele Magbadelo | Developer and Musician",
  description: "A digital station to see all the cool things I engage in!",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-pack={DEFAULT_THEME.pack}
      data-theme={DEFAULT_THEME.variant}
      data-nav="rail"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <PaletteHost />
        <Analytics />
        <SpeedInsights/>
      </body>
    </html>
  );
}
