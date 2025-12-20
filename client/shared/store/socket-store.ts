import { create } from "zustand";

type PurchaseStatus =
    | "waiting for transaction"
    | "transaction found, sending"
    | "completed"
    | "failed"
    | "payment time expired"
    | string;

interface PurchaseUpdate {
    purchase_id: number;
    status: PurchaseStatus;
    purchase?: Record<string, any>;
    log?: string;
    raw?: any;
}

type Subscriber = (update: PurchaseUpdate) => void;

interface SocketStoreState {
    connected: boolean;
    error: string | null;
    lastMessage: any | null;
    purchases: Record<number, PurchaseUpdate>;
    connect: (opts?: { url?: string; path?: string }) => void;
    disconnect: () => void;
    subscribeToPurchase: (purchaseId: number, cb: Subscriber) => () => void;
    send: (event: string, payload: any) => void;
}

// Default config - can be overridden on connect()
// const DEFAULT_WS_URL = "wss://trump-ff.sbs/api/ws/status";
const DEFAULT_WS_URL = "wss://tff.cash/api/ws/status";

// 10 minutes in ms
const PAYMENT_TIMEOUT_MS = 10 * 60 * 1000;

export const useSocketStore = create<SocketStoreState>()((set, get) => {
    let socket: WebSocket | null = null;
    const subscribers: Map<number, Set<Subscriber>> = new Map();
    const timeouts: Map<number, number> = new Map();
    let backoff = 1000;
    let forcedDisconnect = false;
    let reconnectTimeout: number | null = null;

    const clearPurchaseTimeout = (purchaseId: number) => {
        const t = timeouts.get(purchaseId);
        if (t) {
            window.clearTimeout(t);
            timeouts.delete(purchaseId);
        }
    };

    const startPaymentTimeout = (purchaseId: number) => {
        clearPurchaseTimeout(purchaseId);
        const t = window.setTimeout(() => {
            // If still waiting for transaction, mark expired
            const p = get().purchases[purchaseId];
            if (p && p.status === "waiting for transaction") {
                const update: PurchaseUpdate = {
                    purchase_id: purchaseId,
                    status: "payment time expired",
                    purchase: p.purchase,
                };
                // Save and notify
                set((s) => ({ purchases: { ...s.purchases, [purchaseId]: update } }));
                const subs = subscribers.get(purchaseId) ?? new Set();
                subs.forEach((cb) => cb(update));
            }
        }, PAYMENT_TIMEOUT_MS);
        timeouts.set(purchaseId, t);
    };

    const handleMessage = (data: any) => {
        console.log('[Socket] Received message:', data);
        set({ lastMessage: data });

        // Try to parse known shape
        try {
            const parsed = typeof data === "string" ? JSON.parse(data) : data;
            console.log('[Socket] Parsed message:', parsed);

            // Handle different message formats
            let purchaseId: number | null = null;
            let status: PurchaseStatus = "unknown";
            let purchaseData: any = null;

            // Format 1: Initial purchase creation with full purchase object
            if (parsed?.purchase?.purchase_id) {
                purchaseId = parsed.purchase.purchase_id;
                status = parsed.purchase.purchase_status ?? "unknown";
                purchaseData = parsed.purchase;
            }
            // Format 2: Status updates with purchase_status at root level
            else if (parsed?.purchase_status) {
                status = parsed.purchase_status;
                // Try to get purchase_id from existing data in the store
                // We'll notify all subscribers and let them filter
                const existingPurchases = get().purchases;
                const keys = Object.keys(existingPurchases);
                if (keys.length > 0) {
                    // Use the most recent purchase_id
                    purchaseId = Number(keys[keys.length - 1]);
                    purchaseData = existingPurchases[purchaseId]?.purchase;
                }
            }
            // Format 3: Direct purchase_id in message
            else if (parsed?.purchase_id) {
                purchaseId = parsed.purchase_id;
                status = parsed.status ?? "unknown";
                purchaseData = parsed;
            }

            if (purchaseId !== null) {
                const update: PurchaseUpdate = {
                    purchase_id: Number(purchaseId),
                    status,
                    purchase: purchaseData,
                    log: parsed.log,
                    raw: parsed,
                };

                console.log('[Socket] Purchase update:', {
                    purchaseId: update.purchase_id,
                    status: update.status,
                    subscribersCount: subscribers.get(update.purchase_id)?.size || 0
                });

                // Save to store
                set((s) => ({ purchases: { ...s.purchases, [update.purchase_id]: update } }));

                // If status is waiting, start timeout; if transaction found or later, clear timeout
                if (status === "waiting for transaction") {
                    startPaymentTimeout(update.purchase_id);
                } else if (status === "transaction found, sending" || status === "completed" || status === "failed") {
                    clearPurchaseTimeout(update.purchase_id);
                }

                // Notify subscribers
                const subs = subscribers.get(update.purchase_id) ?? new Set();
                subs.forEach((cb) => cb(update));
            }
        } catch (err) {
            console.error('[Socket] Failed to parse message:', err);
        }
    };

    const tryConnect = (url: string, path?: string) => {
        if (socket && socket.readyState !== WebSocket.CLOSED) {
            console.log('[Socket] Already connected');
            return;
        }

        const wsUrl = url; // Use full WebSocket URL
        console.log('[Socket] Connecting to:', wsUrl);
        set({ error: null });

        try {
            socket = new WebSocket(wsUrl);
            console.log('[Socket] WebSocket instance created');

            socket.onopen = () => {
                console.log('[Socket] Connected successfully');
                backoff = 1000;
                set({ connected: true, error: null });
            };

            socket.onclose = (event) => {
                console.log('[Socket] Disconnected:', event.code, event.reason);
                set({ connected: false });

                if (!forcedDisconnect) {
                    // attempt to reconnect with backoff
                    if (reconnectTimeout) clearTimeout(reconnectTimeout);
                    reconnectTimeout = window.setTimeout(() => {
                        if (!socket || socket.readyState === WebSocket.CLOSED) {
                            tryConnect(url, path);
                        }
                    }, backoff);
                    backoff = Math.min(30000, backoff * 1.5);
                }
            };

            socket.onerror = (err) => {
                console.error('[Socket] Connection error:', err);
                set({ error: 'WebSocket connection error' });
            };

            socket.onmessage = (event) => {
                console.log('[Socket] Raw message received:', event.data);
                try {
                    const data = JSON.parse(event.data);
                    handleMessage(data);
                } catch (err) {
                    console.error('[Socket] Failed to parse message:', err);
                    handleMessage(event.data);
                }
            };
        } catch (err: any) {
            console.error('[Socket] Failed to create WebSocket:', err);
            set({ error: String(err), connected: false });
        }
    };

    return {
        connected: false,
        error: null,
        lastMessage: null,
        purchases: {},

        connect: (opts?: { url?: string; path?: string }) => {
            forcedDisconnect = false;
            const url = opts?.url ?? DEFAULT_WS_URL;
            const path = opts?.path;
            console.log('[Socket] Connect called with url:', url, 'path:', path);
            tryConnect(url, path);
        },

        disconnect: () => {
            forcedDisconnect = true;
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
                reconnectTimeout = null;
            }
            if (socket) {
                socket.close();
                socket = null;
            }
            // clear timeouts
            Array.from(timeouts.keys()).forEach((id) => clearPurchaseTimeout(id));
            set({ connected: false });
        },

        subscribeToPurchase: (purchaseId: number, cb: Subscriber) => {
            console.log('[Socket] Subscribing to purchase:', purchaseId);
            const subs = subscribers.get(purchaseId) ?? new Set<Subscriber>();
            subs.add(cb);
            subscribers.set(purchaseId, subs);

            // Send subscription message to server if connected
            if (socket && socket.readyState === WebSocket.OPEN) {
                console.log('[Socket] Sending subscription message for purchase:', purchaseId);
                const message = JSON.stringify({ purchase_id: purchaseId });
                socket.send(message);
                console.log('[Socket] Sent:', message);
            } else {
                console.warn('[Socket] Cannot subscribe - socket not connected. ReadyState:', socket?.readyState);
            }

            // If we already have a cached value, immediately invoke
            const current = get().purchases[purchaseId];
            if (current) cb(current);

            // return unsubscribe
            return () => {
                const s = subscribers.get(purchaseId);
                if (s) {
                    s.delete(cb);
                    if (s.size === 0) subscribers.delete(purchaseId);
                }
            };
        },

        send: (event: string, payload: any) => {
            console.log('[Socket] Sending event:', event, payload);
            if (socket && socket.readyState === WebSocket.OPEN) {
                const message = JSON.stringify({ event, ...payload });
                socket.send(message);
            } else {
                console.error('[Socket] Cannot send - socket not connected');
                set({ error: "Socket not connected" });
            }
        },
    };
});

export default useSocketStore;
