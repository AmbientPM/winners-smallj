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
        <div className="grid grid-cols-2 gap-3">
            {/* Price Card with Image */}
            <Card className={`${c.bgGradient} ${c.borderColor} rounded-2xl p-4`}>
                <div className="flex items-center gap-2 mb-3">
                    {isGold ? (
                        <GiGoldBar className={`w-4 h-4 ${c.livePriceText}`} />
                    ) : (
                        <GiMetalBar className={`w-4 h-4 ${c.livePriceText}`} />
                    )}
                    <span className={`text-sm font-bold ${c.livePriceText}`} style={{ fontFamily: 'var(--font-cinzel)' }}>
                        {type.toUpperCase()}
                    </span>
                </div>

                <div className="mb-3">
                    <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">Spot Price</div>
                    <div className={`text-2xl font-bold ${c.priceText}`} style={{ fontFamily: 'var(--font-cinzel)' }}>
                        ${price.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-neutral-500">per oz</div>
                </div>

                <div className="flex items-center justify-center h-20">
                    <img
                        src={c.image}
                        alt={`${type} bars`}
                        className={`h-full object-contain ${c.imageShadow}`}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling;
                            if (fallback) fallback.classList.remove('hidden');
                        }}
                    />
                    <div className="hidden">
                        <FallbackIcon className={`h-16 ${c.badgeText}`} />
                    </div>
                </div>
            </Card>

            {/* Balance Card */}
            <Card className={`${c.bgGradient} ${c.borderColor} rounded-2xl p-4`}>
                <span className={`inline-block px-2 py-1 ${c.badgeBg} rounded-lg text-[10px] font-bold ${c.badgeText} border ${c.badgeBorder} mb-3`}>
                    {c.badge}
                </span>

                <div className="mb-3">
                    <div className={`text-[10px] ${c.balanceLabel} uppercase tracking-wider mb-1`}>
                        Your Holdings
                    </div>
                    <div className={`text-2xl font-bold ${c.balanceText}`} style={{ fontFamily: 'var(--font-cinzel)' }}>
                        {balance.toFixed(isGold ? 4 : 2)}
                    </div>
                    <div className="text-[10px] text-neutral-500">ounces</div>
                </div>

                <div className="pt-3 border-t border-neutral-700/50">
                    <div className={`text-[10px] ${c.balanceLabel} mb-1`}>Market Value</div>
                    <div className={`text-xl font-bold ${c.priceText}`} style={{ fontFamily: 'var(--font-cinzel)' }}>
                        ${formatCompactCurrency(calculatedUsdValue, 2)}
                    </div>
                </div>
            </Card>
        </div>
    );
}
