// OneSignal Push Notification Helper
// Using OneSignal for cross-device push notifications

const ONESIGNAL_APP_ID = "d76065f7-61da-4e36-9fb3-075a74be5ec6";

declare global {
    interface Window {
        OneSignalDeferred: any[];
        OneSignal: any;
    }
}

// Initialize OneSignal
export const initOneSignal = () => {
    if (typeof window === "undefined") return;

    // Initialize the deferred array
    window.OneSignalDeferred = window.OneSignalDeferred || [];

    // Load OneSignal SDK script
    if (!document.getElementById("onesignal-sdk")) {
        const script = document.createElement("script");
        script.id = "onesignal-sdk";
        script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
        script.defer = true;
        document.head.appendChild(script);
    }

    // Initialize OneSignal
    window.OneSignalDeferred.push(async function (OneSignal: any) {
        await OneSignal.init({
            appId: ONESIGNAL_APP_ID,
            allowLocalhostAsSecureOrigin: true, // For development
        });
        console.log("OneSignal initialized");
    });
};

// Set OneSignal External User ID (link to your user)
export const setOneSignalUserId = async (userId: string) => {
    if (typeof window === "undefined" || !window.OneSignal) return;

    try {
        await window.OneSignal.login(userId);
        console.log("OneSignal user set:", userId);
    } catch (error) {
        console.error("Error setting OneSignal user:", error);
    }
};

// Get OneSignal Player ID (for sending targeted notifications)
export const getOneSignalPlayerId = async (): Promise<string | null> => {
    if (typeof window === "undefined" || !window.OneSignal) return null;

    try {
        const playerId = await window.OneSignal.User.PushSubscription.id;
        return playerId;
    } catch (error) {
        console.error("Error getting OneSignal player ID:", error);
        return null;
    }
};

// Request notification permission
export const requestOneSignalPermission = async (): Promise<boolean> => {
    if (typeof window === "undefined" || !window.OneSignal) return false;

    try {
        const permission = await window.OneSignal.Notifications.requestPermission();
        return permission;
    } catch (error) {
        console.error("Error requesting OneSignal permission:", error);
        return false;
    }
};
