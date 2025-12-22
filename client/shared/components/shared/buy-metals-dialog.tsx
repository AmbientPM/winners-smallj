"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

interface BuyMetalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  silverBuyLink?: string | null;
  goldBuyLink?: string | null;
}

export function BuyMetalsDialog({ 
  open, 
  onOpenChange, 
  silverBuyLink, 
  goldBuyLink 
}: BuyMetalsDialogProps) {
  const handleBuyMetal = (link: string | null | undefined) => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-100 via-amber-300 to-amber-100 bg-clip-text text-transparent">
            Buy Precious Metals
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {/* Gold Option */}
          <button
            onClick={() => handleBuyMetal(goldBuyLink)}
            disabled={!goldBuyLink}
            className="w-full p-4 rounded-xl bg-gradient-to-br from-amber-900/30 to-yellow-900/20 border border-amber-700/50 hover:border-amber-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                  <Image 
                    src="/images/gold.png" 
                    alt="Gold"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-amber-100">Gold</h3>
                  <p className="text-xs text-amber-300/70">Purchase gold tokens</p>
                </div>
              </div>
              {goldBuyLink && (
                <ExternalLink className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
              )}
            </div>
          </button>

          {/* Silver Option */}
          <button
            onClick={() => handleBuyMetal(silverBuyLink)}
            disabled={!silverBuyLink}
            className="w-full p-4 rounded-xl bg-gradient-to-br from-slate-900/30 to-zinc-900/20 border border-slate-700/50 hover:border-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                  <Image 
                    src="/images/silver.png" 
                    alt="Silver"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-slate-100">Silver</h3>
                  <p className="text-xs text-slate-300/70">Purchase silver tokens</p>
                </div>
              </div>
              {silverBuyLink && (
                <ExternalLink className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              )}
            </div>
          </button>
        </div>

        <div className="mt-4 p-3 bg-neutral-800/50 rounded-lg border border-neutral-700">
          <p className="text-xs text-neutral-400 text-center">
            Tokens are backed by real precious metals on the Stellar network
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
