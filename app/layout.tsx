import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Poppins, Noto_Sans_Malayalam, Noto_Nastaliq_Urdu, Noto_Naskh_Arabic, Lateef } from "next/font/google";
import "./globals.css";
import Shell from "@/components/Shell";
import { AuthProvider } from "@/lib/auth";
import { LangProvider } from "@/lib/lang";
import { AppearanceProvider } from "@/lib/appearance";

const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });
const body = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });
const ur = Noto_Nastaliq_Urdu({ subsets: ["arabic"], weight: ["400", "600"], variable: "--font-ur" });
const naskh = Noto_Naskh_Arabic({ subsets: ["arabic"], weight: ["400", "600"], variable: "--font-naskh" });
const lateef = Lateef({ subsets: ["arabic"], weight: ["400", "600"], variable: "--font-lateef" });
const ml = Noto_Sans_Malayalam({ subsets: ["malayalam"], weight: ["400", "500", "600"], variable: "--font-ml" });

export const metadata: Metadata = {
  title: "Hisaabi",
  description: "Your all-in-one Muslim companion",
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Hisaabi", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#1a2a32" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${ml.variable} ${ur.variable} ${naskh.variable} ${lateef.variable}`}>
      <body><AuthProvider><LangProvider><AppearanceProvider><Shell>{children}</Shell></AppearanceProvider></LangProvider></AuthProvider></body>
    </html>
  );
}
