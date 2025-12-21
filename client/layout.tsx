import type { Metadata } from "next";
import { Inter, Playfair_Display, EB_Garamond, Cinzel, Courier_Prime } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/shared/components/shared/bottom-nav";
import { AnimatedIngotsBackground } from "@/shared/components/shared/animated-ingots-background";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

const courierPrime = Courier_Prime({
  variable: "--font-courier",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Winners - Digital Precious Metals",
  description: "Your gateway to precious metal-backed digital assets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} ${ebGaramond.variable} ${cinzel.variable} ${courierPrime.variable} antialiased`}
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        {/* Animated metallic background */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="animated-bg" />
          <div className="animated-bg-overlay" />
        </div>
        {/* Animated falling ingots */}
        <AnimatedIngotsBackground />
        <div className="pb-20 relative z-0">
          {children}
        </div>
        <BottomNav />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(20, 20, 25, 0.95)',
              color: '#f5f5f5',
              border: '1px solid rgba(115, 115, 125, 0.3)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              style: {
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#10b981',
              },
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              style: {
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#ef4444',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
