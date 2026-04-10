import type { Metadata } from "next";
import { Barlow_Condensed, Space_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/theme-context";

const barlowCondensed = Barlow_Condensed({
  weight: ["400", "600", "700", "800"],
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FPL Unlocked",
  description: "Unlock smarter Fantasy Premier League decisions",
  themeColor: "#0c0c14",
  openGraph: {
    title: "FPL Unlocked",
    description: "Unlock smarter Fantasy Premier League decisions",
    siteName: "FPL Unlocked",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${spaceMono.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        {/* Prevent flash of wrong theme on reload */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('fpl-theme');if(t==='classic')document.documentElement.setAttribute('data-theme','classic');})();`,
          }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
