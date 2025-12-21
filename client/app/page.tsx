"use client";

import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { formatCompactCurrency } from "@/shared/lib/format-number";
import { DollarSign, Wallet, TrendingUp, Copy, CheckCircle2, Shield } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { METALS } from "@/shared/types/api";
import Link from "next/link";
import { GiMetalBar, GiGoldBar } from "react-icons/gi";
import { useWalletStore } from "@/shared/store/wallet-store";
import { useUserStatistics } from "@/shared/hooks/use-api";
import { PiTelegramLogo } from "react-icons/pi";


export default function Home() {
  const { userData } = useWalletStore();
  const { data, isLoading } = useUserStatistics();
  const [copiedIssuer, setCopiedIssuer] = useState(false);

  const ISSUER_ADDRESS = "GDRUFU6HP5UHCG4BYRXW5YSSYFKFCQ5EPEFDV6WGFJ42DBMWKXYAVTFF";

  const copyIssuer = () => {
    navigator.clipboard.writeText(ISSUER_ADDRESS);
    setCopiedIssuer(true);
    setTimeout(() => setCopiedIssuer(false), 2000);
  };

  // Use data from hook if available, otherwise use store
  const currentUserData = data || userData;
  const totalUsdValue = currentUserData?.balances?.total?.usd || 0;
  const silverBalance = currentUserData?.balances?.silver || { tokens: 0, usd: 0, price: 0 };
  const goldBalance = currentUserData?.balances?.gold || { tokens: 0, usd: 0, price: 0 };

  return (
    <main className="min-h-screen">
      <div className="max-w-lg mx-auto p-4 space-y-5">
        {/* Header */}
        <div className="text-center py-8 relative">
          {/* Animated background glow */}
          <div className="absolute inset-0 -z-10 opacity-30">
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0s', animationDuration: '4s' }} />
            <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-yellow-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '5s' }} />
          </div>

          {/* Logo with Gold Ingots */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/logo.png"
              alt="Gold Ingots"
              className="w-14 h-14 object-contain drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
            />
            <div className="h-10 w-px bg-gradient-to-b from-transparent via-amber-500/50 to-transparent" />
            <div className="text-left">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent leading-tight" style={{ fontFamily: 'var(--font-cinzel)' }}>
                Winners
              </h1>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-300 bg-clip-text text-transparent leading-tight" style={{ fontFamily: 'var(--font-cinzel)' }}>
                Century
              </h1>
            </div>
          </div>

          <p className="text-sm text-amber-200/60 tracking-wide">Precious Metal-Backed Digital Assets</p>
        </div>

        {/* Total Balance Card - Premium Gold Style */}
        <Card className="p-6 bg-gradient-to-br from-amber-950/40 via-yellow-950/30 to-amber-950/40 border border-amber-500/30 relative overflow-hidden rounded-2xl">
          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-500/40 rounded-tl-2xl" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-500/40 rounded-br-2xl" />

          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-500/30">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-amber-200/70 uppercase tracking-wider">Total Portfolio</p>
                  <p className="text-[10px] text-amber-200/40">Combined Value</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 rounded-full border border-amber-500/30">
                <TrendingUp className="w-3 h-3 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400">USD</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-cinzel)' }}>
                ${formatCompactCurrency(totalUsdValue, 2)}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-amber-200/50 pt-3 border-t border-amber-500/20">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                <span>{silverBalance.tokens.toFixed(2)} SILVER</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span>{goldBalance.tokens.toFixed(2)} GOLD</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Metal Balance Cards - Premium Style */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { metal: 'silver' as const, balance: silverBalance },
            { metal: 'gold' as const, balance: goldBalance }
          ].map(({ metal, balance }) => {
            const config = METALS[metal];
            const isGold = metal === 'gold';

            return (
              <Card
                key={metal}
                className={cn(
                  "p-4 border relative overflow-hidden group rounded-xl",
                  isGold
                    ? "bg-gradient-to-br from-amber-950/50 via-yellow-950/30 to-amber-950/40 border-amber-500/30"
                    : "bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-slate-900/40 border-slate-500/30"
                )}
              >
                {/* Decorative icon background */}
                <div className="absolute -bottom-2 -right-2 opacity-[0.08] group-hover:opacity-[0.12] transition-opacity">
                  {isGold ? (
                    <GiGoldBar className="w-16 h-16 text-amber-400 rotate-12" />
                  ) : (
                    <GiMetalBar className="w-16 h-16 text-slate-300 rotate-12" />
                  )}
                </div>

                <div className="relative z-10 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center border",
                      isGold
                        ? "bg-amber-500/20 border-amber-500/40"
                        : "bg-slate-500/20 border-slate-500/40"
                    )}>
                      <Wallet className={cn(
                        "w-4 h-4",
                        isGold ? "text-amber-400" : "text-slate-300"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-[10px] font-semibold uppercase tracking-wider truncate",
                        isGold ? "text-amber-400" : "text-slate-300"
                      )}>
                        {config.name}
                      </p>
                      <p className="text-[9px] text-muted-foreground/60">Balance</p>
                    </div>
                  </div>

                  {/* Token Balance */}
                  <div>
                    <div className="flex items-baseline gap-1 mb-0.5">
                      <span className={cn(
                        "text-2xl font-bold",
                        isGold
                          ? "bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent"
                          : "bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-clip-text text-transparent"
                      )} style={{ fontFamily: 'var(--font-cinzel)' }}>
                        {balance.tokens.toFixed(2)}
                      </span>
                      <span className={cn(
                        "text-[10px] font-medium",
                        isGold ? "text-amber-400/70" : "text-slate-400/70"
                      )}>{config.symbol}</span>
                    </div>
                  </div>

                  {/* USD Value */}
                  <div className={cn(
                    "p-2 rounded-lg border",
                    isGold
                      ? "bg-amber-500/10 border-amber-500/20"
                      : "bg-slate-500/10 border-slate-500/20"
                  )}>
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] text-muted-foreground/60 uppercase">Value</p>
                      <p className={cn(
                        "text-sm font-bold",
                        isGold ? "text-amber-400" : "text-slate-300"
                      )}>
                        ${formatCompactCurrency(balance.usd, 2)}
                      </p>
                    </div>
                    <p className={cn(
                      "text-[8px] mt-1",
                      isGold ? "text-amber-400/50" : "text-slate-400/50"
                    )}>
                      @ ${balance.price.toFixed(2)}/oz
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {isLoading && (
          <div className="text-center py-4 text-amber-200/50">
            Loading...
          </div>
        )}

        {/* Issuer Info Card */}
        <Card className="p-4 bg-amber-950/20 border-amber-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/15 rounded-lg border border-amber-500/30">
              <Shield className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-amber-200/70 mb-1">Token Issuer</p>
              <div className="flex items-center gap-2">
                <code className="text-[10px] text-amber-200/50 font-mono truncate flex-1">
                  {ISSUER_ADDRESS.slice(0, 12)}...{ISSUER_ADDRESS.slice(-12)}
                </code>
                <button
                  onClick={copyIssuer}
                  className="p-1.5 hover:bg-amber-500/10 rounded-lg transition-colors"
                >
                  {copiedIssuer ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-amber-200/50" />
                  )}
                </button>
              </div>
              <p className="text-[9px] text-amber-200/40 mt-1">
                Stellar Network • Verified Issuer
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons - Premium Style */}
        <div className="grid grid-cols-2 gap-3 pb-20">
          <a
            href="https://t.me/your_channel"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white font-semibold rounded-xl border border-slate-600/50 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
          >
            <PiTelegramLogo className="w-5 h-5" />
            Telegram
          </a>
          <Link
            href="/voucher/gold"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-amber-950 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 border border-amber-400/30"
          >
            <GiGoldBar className="w-5 h-5" />
            Buy
          </Link>
        </div>

      </div>
    </main >
  );
}
