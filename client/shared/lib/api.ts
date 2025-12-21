import axios from "axios";
import type { UserStatisticsResponse } from "@/shared/types/api";

// Create axios instance with base configuration
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});

// API Methods
export const apiService = {
    /**
     * Get user statistics including balances, wallets, and certificates
     */
    async getUserStatistics(initData?: string): Promise<UserStatisticsResponse> {
        const response = await api.get<UserStatisticsResponse>("/userStatistics", {
            params: initData ? { initData } : undefined
        });
        return response.data;
    },

    /**
     * Add/register a new wallet
     */
    async addWallet(publicKey: string, initData?: string): Promise<{ success: boolean; wallet?: any; message?: string; needsVerification?: boolean; verificationCode?: string; depositAddress?: string; minAmount?: number; expiresAt?: string }> {
        const response = await api.post("/addWallet", { publicKey, initData });
        return response.data;
    },

    /**
     * Verify wallet ownership
     */
    async verifyWallet(walletId: number, initData?: string): Promise<{ success: boolean; verified?: boolean; message?: string; verificationStatus?: string }> {
        const response = await api.post("/verifyWallet", { walletId, initData });
        return response.data;
    },

    /**
     * Delete a wallet
     */
    async deleteWallet(walletId: number, initData?: string): Promise<{ success: boolean; message?: string }> {
        const response = await api.post("/deleteWallet", { walletId, initData });
        return response.data;
    },

    /**
     * Set active wallet
     */
    async setActiveWallet(walletId: number, initData?: string): Promise<{ success: boolean; message?: string }> {
        const response = await api.post("/setActiveWallet", { walletId, initData });
        return response.data;
    },
};

export default api;
