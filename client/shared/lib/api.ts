import axios from "axios";
import type { UserStatistics, WalletData, MetalBalance } from "@/shared/types/api";

// Create axios instance with base configuration
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});

// API Methods
export const apiService = {
    /**
     * Get user statistics including silver token balance and price
     */
    async getUserStatistics(): Promise<UserStatistics> {
        const response = await api.get<UserStatistics>("/userStatistics");
        return response.data;
    },

    /**
     * Add/register a new wallet
     */
    async addWallet(publicKey: string): Promise<{ success: boolean; wallet?: any; message?: string }> {
        const response = await api.post("/addWallet", { publicKey });
        return response.data;
    },

    /**
     * Verify wallet ownership
     */
    async verifyWallet(walletId: number): Promise<{ success: boolean; message?: string }> {
        const response = await api.post("/verifyWallet", { walletId });
        return response.data;
    },

    /**
     * Delete a wallet
     */
    async deleteWallet(walletId: number): Promise<{ success: boolean; message?: string }> {
        const response = await api.post("/deleteWallet", { walletId });
        return response.data;
    },
};

export default api;
