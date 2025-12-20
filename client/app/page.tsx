"use client";

import { Metadata } from "next";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Progress } from "@/shared/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { mockMetalBalances, getMetalBalance } from "@/shared/lib/mock-data";
import { formatCompactNumber, formatCompactCurrency } from "@/shared/lib/format-number";
import { TrendingUp, TrendingDown, Coins, DollarSign, Wallet, Activity, Award, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { WebGLLogo } from "@/shared/components/shared/webgl-logo";
import { METALS } from "@/shared/types/api";
import Link from "next/link";
import { GiMetalBar, GiGoldBar } from "react-icons/gi";

export default function Home() {
  const silverBalance = getMetalBalance('silver');
  const goldBalance = getMetalBalance('gold');
  const totalUsdValue = mockMetalBalances.reduce((sum, b) => sum + b.usdValue, 0);

  return (
    <main className="min-h-screen">
      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="text-center py-6 relative">
          {/* Animated background glow */}
          <div className="absolute inset-0 -z-10 opacity-40">
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-slate-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0s', animationDuration: '4s' }} />
            <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '5s' }} />
          </div>

          <WebGLLogo size={160} metal="mixed" />
          <h1 className="text-3xl font-bold text-foreground mb-2 mt-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            Winners
          </h1>
          <p className="text-sm text-muted-foreground">Precious Metal-Backed Digital Assets on Stellar</p>
        </div>





        {/* Total Balance in USD */}
        <Card className="p-5 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10 border-2 border-emerald-500/30 dark:border-emerald-700/40 relative overflow-hidden">
          {/* Animated glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Balance</p>
                  <p className="text-[10px] text-muted-foreground">Combined USD Value</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-semibold">
                USD
              </Badge>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:via-green-400 dark:to-teal-400">
                ${formatCompactCurrency(totalUsdValue, 2)}
              </span>
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">USD</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="text-lg">🪙</span>
                <span>{formatCompactNumber(silverBalance?.balance || 0, 2)} SILVER × ${silverBalance?.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg">🏆</span>
                <span>{formatCompactNumber(goldBalance?.balance || 0, 2)} GOLD × ${goldBalance?.price.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Compact Stellar Wallet Balances */}
        <div className="grid grid-cols-2 gap-3">
          {mockMetalBalances.map((metalBalance) => {
            const config = METALS[metalBalance.metal];
            const isGold = metalBalance.metal === 'gold';

            return (
              <Card
                key={metalBalance.metal}
                className={cn(
                  "p-4 border relative overflow-hidden group",
                  isGold
                    ? "bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-amber-600/15 border-amber-500/40 dark:border-amber-700/40"
                    : "bg-gradient-to-br from-slate-400/15 via-slate-300/10 to-slate-500/15 border-slate-400/40 dark:border-slate-600/40"
                )}
              >
                {/* Decorative icon background */}
                <div className="absolute -bottom-2 -right-2 opacity-[0.06] group-hover:opacity-[0.1] transition-opacity">
                  {isGold ? (
                    <GiGoldBar className="w-20 h-20 text-amber-500 rotate-12" />
                  ) : (
                    <GiMetalBar className="w-20 h-20 text-slate-400 rotate-12" />
                  )}
                </div>

                <div className="relative z-10 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      isGold ? "bg-amber-500/30" : "bg-slate-400/30"
                    )}>
                      <Wallet className={cn(
                        "w-4 h-4",
                        isGold ? "text-amber-700 dark:text-amber-400" : "text-slate-600 dark:text-slate-300"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-[10px] font-bold uppercase tracking-wider truncate",
                        isGold ? "text-amber-700 dark:text-amber-400" : "text-slate-600 dark:text-slate-300"
                      )}>
                        {config.name} Balance
                      </p>
                      <p className="text-[9px] text-muted-foreground">Stellar Network</p>
                    </div>
                  </div>

                  {/* Token Balance */}
                  <div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className={cn(
                        "text-2xl font-bold",
                        isGold
                          ? "bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent dark:from-amber-400 dark:via-yellow-400 dark:to-amber-400"
                          : "bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 bg-clip-text text-transparent dark:from-slate-300 dark:via-slate-200 dark:to-slate-300"
                      )}>
                        {formatCompactNumber(metalBalance.balance, 2)}
                      </span>
                      <span className={cn(
                        "text-xs font-semibold",
                        isGold ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-slate-300"
                      )}>{config.symbol}</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground mb-2">
                      {formatCompactNumber(metalBalance.balance, 2)} oz {config.name.toLowerCase()}
                    </p>
                  </div>

                  {/* USD Value */}
                  <div className={cn(
                    "p-2 rounded-lg border",
                    isGold
                      ? "bg-amber-500/10 border-amber-500/30"
                      : "bg-slate-400/10 border-slate-400/30"
                  )}>
                    <div className="flex items-center gap-1 mb-0.5">
                      <Sparkles className={cn(
                        "w-3 h-3",
                        isGold ? "text-amber-500" : "text-slate-400"
                      )} />
                      <p className="text-[9px] text-muted-foreground uppercase">Value</p>
                    </div>
                    <p className={cn(
                      "text-sm font-bold",
                      isGold ? "text-amber-600 dark:text-amber-400" : "text-slate-600 dark:text-slate-300"
                    )}>
                      ${formatCompactCurrency(metalBalance.usdValue, 2)}
                    </p>
                    <p className="text-[8px] text-muted-foreground mt-0.5">
                      @ ${metalBalance.price.toFixed(2)}/oz
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>



      </div>
    </main >
  );
}
