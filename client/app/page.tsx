"use client";

import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { formatCompactCurrency } from "@/shared/lib/format-number";
import { DollarSign, Copy, CheckCircle2, Shield } from "lucide-react";
import Link from "next/link";
import { GiGoldBar } from "react-icons/gi";
import { BuyMetalsDialog } from "@/shared/components/shared/buy-metals-dialog";
import { useWalletStore } from "@/shared/store/wallet-store";
import { PiTelegramLogo } from "react-icons/pi";
import { MetalPriceCard } from "@/shared/components/shared/metal-price-card";


export default function Home() {
  const { userData } = useWalletStore();
  const [copiedIssuer, setCopiedIssuer] = useState(false);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);

  const ISSUER_ADDRESS = "GDRUFU6HP5UHCG4BYRXW5YSSYFKFCQ5EPEFDV6WGFJ42DBMWKXYAVTFF";

  const copyIssuer = () => {
    navigator.clipboard.writeText(ISSUER_ADDRESS);
    setCopiedIssuer(true);
    setTimeout(() => setCopiedIssuer(false), 2000);
  };

  // Use data from store
  const silverBalance = userData?.balances?.silver || { tokens: 0, ounces: 0, usd: 0, price: 0 };
  const goldBalance = userData?.balances?.gold || { tokens: 0, ounces: 0, usd: 0, price: 0 };

  // Use ounces from API if available, otherwise calculate
  // Gold: 1 token = 0.1 oz, Silver: 1 token = 1 oz
  const goldOunces = goldBalance.ounces ?? (goldBalance.tokens * 0.1);
  const silverOunces = silverBalance.ounces ?? (silverBalance.tokens * 1);
  const goldUsdValue = goldBalance.usd;
  const silverUsdValue = silverBalance.usd;
  const totalUsdValue = userData?.balances?.total?.usd || 0;

  return (
    <main className="min-h-screen pb-20 bg-neutral-950">

      {/* Modern Header */}
      <div className="backdrop-blur-xl bg-neutral-950/80 border-b border-neutral-800/50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-center gap-2.5">
            <div className="relative">
              <img
                src="/logo.png"
                alt="Winners"
                className="w-9 h-9 scale-150 object-contain drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-full blur-md -z-10"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-amber-100 via-amber-300 to-amber-100 bg-clip-text text-transparent leading-none" style={{ fontFamily: 'var(--font-raleway)', letterSpacing: '0.02em' }}>
                Winners
              </h1>
              <p className="text-[10px] text-neutral-500 font-medium mt-0.5">Digital Metals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Total Portfolio Value - BIG */}
      <div className="px-4 mb-4">
        <Card className="p-6 bg-gradient-to-br from-neutral-900/80 to-neutral-900/50 border-neutral-700 rounded-2xl shadow-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              <p className="text-xs text-neutral-400 uppercase tracking-widest font-semibold">Total Portfolio</p>
            </div>
            <div className="text-5xl font-bold bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent mb-3" style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 800 }}>
              ${formatCompactCurrency(totalUsdValue, 2)}
            </div>
            <div className="flex items-center justify-center gap-6 text-xs text-neutral-400">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <span>{goldOunces.toFixed(2)} oz Gold</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                <span>{silverOunces.toFixed(2)} oz Silver</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Gold Balance Card */}
      <div className="px-4 mb-3">
        <MetalPriceCard
          type="gold"
          price={goldBalance.price}
          balance={goldOunces}
          tokens={goldBalance.tokens}
          usdValue={goldUsdValue}
        />
      </div>

      {/* Silver Balance Card */}
      <div className="px-4 mb-4">
        <MetalPriceCard
          type="silver"
          price={silverBalance.price}
          balance={silverOunces}
          tokens={silverBalance.tokens}
          usdValue={silverUsdValue}
        />
      </div>

      {/* Bottom Section */}
      {/* <div className="px-4 mt-4 space-y-3">


        {/* Action Buttons */}
      {/* <div className="grid grid-cols-2 gap-3">
          <a
            href="https://t.me/your_channel"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl border border-neutral-700 transition-all duration-200 active:scale-95"
          >
            <PiTelegramLogo className="w-5 h-5" />
            <span className="text-sm">Telegram</span>
          </a>
          <button
            onClick={() => setBuyDialogOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-amber-950 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
          >
            <GiGoldBar className="w-5 h-5" />
            <span className="text-sm">Buy Metals</span>
          </button>
        </div>
      </div> */}

      <BuyMetalsDialog
        open={buyDialogOpen}
        onOpenChange={setBuyDialogOpen}
        silverBuyLink={silverBalance.buyLink}
        goldBuyLink={goldBalance.buyLink}
      />
    </main >
  );
}
