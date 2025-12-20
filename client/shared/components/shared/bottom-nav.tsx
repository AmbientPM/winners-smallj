"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Award, ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { METALS } from "@/shared/types/api";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Voucher",
    href: "/voucher",
    icon: Award,
    hasDropdown: true,
  },
  {
    label: "Wallets",
    href: "/wallets",
    icon: Wallet,
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border backdrop-blur-lg bg-card/95">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          if (item.hasDropdown) {
            return (
              <DropdownMenu key={item.href} open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors relative outline-none",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full" />
                    )}
                    <div className="relative">
                      <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
                      <ChevronDown className="w-3 h-3 absolute -right-2 -top-1" />
                    </div>
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  side="top"
                  className="mb-2 bg-card/95 backdrop-blur-lg border-border"
                >
                  {Object.entries(METALS).map(([key, config]) => (
                    <DropdownMenuItem key={key} asChild>
                      <Link
                        href={`/voucher/${key}`}
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <span className="text-lg">{config.icon}</span>
                        <span className="font-medium">{config.name} Voucher</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full" />
              )}
              <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
