import { MetalBalance, MetalType, WalletData } from "@/shared/types/api";

// Mock metal balances
export const mockMetalBalances: MetalBalance[] = [
  {
    metal: 'silver',
    balance: 125.5, // SILVER token balance
    price: 31.00, // Price per ounce of silver
    usdValue: 3890.25, // 125.5 × $31.00
  },
  {
    metal: 'gold',
    balance: 1.5, // GOLD token balance
    price: 2650.00, // Price per ounce of gold
    usdValue: 3975.00, // 1.5 × $2650.00
  }
];

// Mock wallets
export const mockWallets: WalletData[] = [
  {
    id: 1,
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    balance: 75.5,
    isActive: true,
  },
  {
    id: 2,
    address: "0x8ba1f109551bD432803012645Ac136ddd64DBA",
    balance: 50.0,
    isActive: false,
  },
];

// Helper function to get balance for specific metal
export function getMetalBalance(metal: MetalType): MetalBalance | undefined {
  return mockMetalBalances.find(b => b.metal === metal);
}
