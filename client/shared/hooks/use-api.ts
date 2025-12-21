"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/shared/lib/api";
import toast from "react-hot-toast";

// Helper to get initData from cookie
function getCookieValue(name: string): string | undefined {
    if (typeof window === 'undefined') return undefined;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
}

// Query keys
export const queryKeys = {
    userStatistics: ['userStatistics'] as const,
    wallets: ['wallets'] as const,
};

/**
 * Hook to fetch user statistics
 */
export function useUserStatistics() {
    return useQuery({
        queryKey: queryKeys.userStatistics,
        queryFn: async () => {
            const initData = getCookieValue('tg_init_data');
            const response = await apiService.getUserStatistics(initData);
            return response.user;
        },
        staleTime: 30 * 1000, // 30 seconds
        retry: false, // Don't retry on auth errors
    });
}

/**
 * Hook to add a new wallet
 */
export function useAddWallet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (publicKey: string) => {
            const initData = getCookieValue('tg_init_data');
            return await apiService.addWallet(publicKey, initData);
        },
        onSuccess: (data) => {
            if (data.success) {
                // Invalidate user statistics to refresh data
                queryClient.invalidateQueries({ queryKey: queryKeys.userStatistics });

                if (!data.needsVerification) {
                    toast.success('Wallet added successfully!');
                }
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to add wallet');
        },
    });
}

/**
 * Hook to verify wallet
 */
export function useVerifyWallet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (walletId: number) => {
            const initData = getCookieValue('tg_init_data');
            return await apiService.verifyWallet(walletId, initData);
        },
        onSuccess: (data) => {
            if (data.success && data.verified) {
                queryClient.invalidateQueries({ queryKey: queryKeys.userStatistics });
                toast.success('Wallet verified successfully!');
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to verify wallet');
        },
    });
}

/**
 * Hook to delete a wallet
 */
export function useDeleteWallet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ walletId, publicKey }: { walletId: number; publicKey: string }) => {
            const initData = getCookieValue('tg_init_data');
            return await apiService.deleteWallet(walletId, initData);
        },
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: queryKeys.userStatistics });
                toast.success('Wallet deleted successfully!');
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete wallet');
        },
    });
}

/**
 * Hook to set active wallet
 */
export function useSetActiveWallet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (walletId: number) => {
            const initData = getCookieValue('tg_init_data');
            return await apiService.setActiveWallet(walletId, initData);
        },
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: queryKeys.userStatistics });
                toast.success('Active wallet updated!');
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to set active wallet');
        },
    });
}
