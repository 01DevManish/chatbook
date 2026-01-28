// Firebase Cloud Messaging helper functions
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import { ref, set, get } from "firebase/database";
import { rtdb } from "./firebase";

// VAPID Key for web push
const VAPID_KEY = "BNjmT16gLcXW01CYMIsYH4iY9jC3SsDZOaBTULgoKzwGpxbYkt3je_Ojk9NympusXLADPYfLQngTe6r69BzSsmo";

let messagingInstance: Messaging | null = null;

// Get messaging instance (only in browser)
export const getMessagingInstance = async () => {
    if (typeof window === "undefined") return null;

    if (!messagingInstance) {
        try {
            const { app } = await import("./firebase");
            messagingInstance = getMessaging(app);
        } catch (error) {
            console.error("Error initializing messaging:", error);
            return null;
        }
    }
    return messagingInstance;
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
    if (typeof window === "undefined") return null;

    try {
        // Check if notifications are supported
        if (!("Notification" in window)) {
            console.log("This browser does not support notifications");
            return null;
        }

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.log("Notification permission denied");
            return null;
        }

        // Register service worker
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        console.log("Service Worker registered:", registration);

        // Get messaging instance
        const messaging = await getMessagingInstance();
        if (!messaging) return null;

        // Get FCM token
        const token = await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration,
        });

        console.log("FCM Token:", token);
        return token;
    } catch (error) {
        console.error("Error getting FCM token:", error);
        return null;
    }
};

// Save FCM token to Firebase for a user
export const saveFcmToken = async (userId: string, token: string) => {
    if (!userId || !token) return;

    try {
        // Save token with device identifier (for multi-device support)
        const deviceId = getDeviceId();
        const tokenRef = ref(rtdb, `users/${userId}/fcmTokens/${deviceId}`);

        await set(tokenRef, {
            token,
            lastUpdated: Date.now(),
            userAgent: navigator.userAgent,
        });

        console.log("FCM token saved to Firebase");
    } catch (error) {
        console.error("Error saving FCM token:", error);
    }
};

// Get user's FCM tokens (for sending notifications)
export const getUserFcmTokens = async (userId: string): Promise<string[]> => {
    if (!userId) return [];

    try {
        const tokensRef = ref(rtdb, `users/${userId}/fcmTokens`);
        const snapshot = await get(tokensRef);

        if (!snapshot.exists()) return [];

        const tokens: string[] = [];
        snapshot.forEach((child) => {
            const data = child.val();
            if (data?.token) {
                tokens.push(data.token);
            }
        });

        return tokens;
    } catch (error) {
        console.error("Error fetching FCM tokens:", error);
        return [];
    }
};

// Generate a unique device ID
const getDeviceId = (): string => {
    if (typeof window === "undefined") return "unknown";

    let deviceId = localStorage.getItem("chatbook_device_id");
    if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("chatbook_device_id", deviceId);
    }
    return deviceId;
};

// Listen for foreground messages
export const onForegroundMessage = async (callback: (payload: any) => void) => {
    const messaging = await getMessagingInstance();
    if (!messaging) return () => { };

    return onMessage(messaging, (payload) => {
        console.log("Foreground message received:", payload);
        callback(payload);
    });
};
