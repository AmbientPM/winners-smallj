"use client";

import { Card } from "@/shared/components/ui/card";
import { formatCompactCurrency } from "@/shared/lib/format-number";
import { GiMetalBar, GiGoldBar } from "react-icons/gi";
import { Info } from "lucide-react";

export type MetalCardType = 'gold' | 'silver';

interface MetalPriceCardProps {
    type: MetalCardType;
    price: number;
    balance: number; // in ounces
    tokens?: number; // token amount
    usdValue?: number; // USD value from API
}

export function MetalPriceCard({ type, price, balance, tokens = 0, usdValue }: MetalPriceCardProps) {
    const isGold = type === 'gold';
    const calculatedUsdValue = usdValue || (balance * price);

    const config = {
        gold: {
            // Visual effects
            bgGradient: 'bg-gradient-to-br from-neutral-800/60 via-neutral-900/40 to-neutral-800/60',
            borderColor: 'border-neutral-700/50',

            // Badge
            badge: '24K • 999%',
            badgeBg: 'bg-amber-500/20',
            badgeText: 'text-amber-400',
            badgeBorder: 'border-amber-500/30',

            // Image
            image: '/images/gold.png',
            imageShadow: 'drop-shadow-[0_4px_12px_rgba(251,191,36,0.4)]',
            FallbackIcon: GiGoldBar,

            // Text colors
            livePriceText: 'text-amber-400',
            priceText: 'text-amber-300',
            infoText: 'text-neutral-500',
            balanceLabel: 'text-neutral-400',
            balanceText: 'text-amber-300',
        },
        silver: {
            // Visual effects
            bgGradient: 'bg-gradient-to-br from-neutral-800/60 via-neutral-900/40 to-neutral-800/60',
            borderColor: 'border-neutral-700/50',

            // Badge
            badge: '.999 Fine',
            badgeBg: 'bg-slate-500/20',
            badgeText: 'text-slate-300',
            badgeBorder: 'border-slate-500/30',

            // Image
            image: '/images/silver.png',
            imageShadow: 'drop-shadow-[0_4px_12px_rgba(148,163,184,0.4)]',
            FallbackIcon: GiMetalBar,

            // Text colors
            livePriceText: 'text-slate-400',
            priceText: 'text-slate-300',
            infoText: 'text-neutral-500',
            balanceLabel: 'text-neutral-400',
            balanceText: 'text-slate-300',
        },
    };

    const c = config[type];
    const FallbackIcon = c.FallbackIcon;

    return (
        <Card className={`relative overflow-hidden ${c.bgGradient} ${c.borderColor} rounded-3xl p-5`}>
            {/* Top Section - Metal Name & Type */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    {isGold ? (
                        <GiGoldBar className={`w-5 h-5 ${c.livePriceText}`} />
                    ) : (
                        <GiMetalBar className={`w-5 h-5 ${c.livePriceText}`} />
                    )}
                    <span className={`text-lg font-bold ${c.livePriceText}`} style={{ fontFamily: 'var(--font-cinzel)' }}>
                        {type.toUpperCase()}
                    </span>
                </div>
                <div className="text-right">
                    <div className="text-xs text-neutral-400 uppercase tracking-wider">Spot Price</div>
                    <div className="text-xs text-neutral-500 mt-0.5">Market Rate</div>
                </div>
            </div>

            {/* Main Price Display */}
            <div className="mb-3">
                <div className={`text-4xl font-bold ${c.priceText} mb-1`} style={{ fontFamily: 'var(--font-cinzel)' }}>
                    ${price.toFixed(2)}/oz
                </div>
                <div className="flex items-center gap-1 text-xs text-neutral-500">
                    <span>This price includes 3% GST, locker charges and insurance</span>
                    <Info className="w-3.5 h-3.5 text-amber-600" />
                </div>
            </div>
            {/* Badge and Image Row */}
            <div className="flex items-center justify-between mb-5">
                <span className={`px-3 py-1.5 ${c.badgeBg} rounded-lg text-xs font-bold ${c.badgeText} border ${c.badgeBorder}`}>
                    {c.badge}
                </span>

                <div className="flex items-center justify-end w-40 h-28">
                    <img
                        src={c.image}
                        alt={`${type} bars`}
                        className={`w-full h-full object-contain ${c.imageShadow}`}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling;
                            if (fallback) fallback.classList.remove('hidden');
                        }}
                    />
                    <div className="hidden">
                        <FallbackIcon className={`w-20 h-16 ${c.badgeText}`} />
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent mb-4"></div>

            {/* Balance Section */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className={`text-sm ${c.balanceLabel}`}>
                        Your current {type} balance is:
                    </span>
                    <span className={`text-2xl font-bold ${c.balanceText}`} style={{ fontFamily: 'var(--font-cinzel)' }}>
                        {balance.toFixed(isGold ? 4 : 2)} <span className="text-xl">oz</span>
                    </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-neutral-700/50">
                    <span className={`text-xs ${c.balanceLabel}`}>
                        Market Value:
                    </span>
                    <span className={`text-xl font-bold ${c.priceText}`} style={{ fontFamily: 'var(--font-cinzel)' }}>
                        ${formatCompactCurrency(calculatedUsdValue, 2)}
                    </span>
                </div>
            </div>
        </Card>
    );
}
