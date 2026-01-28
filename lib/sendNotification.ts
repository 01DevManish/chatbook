// Utility to send push notification when a message is sent
// Uses both Firebase (for real-time in-app) and OneSignal API (for push)

import { ref, push, get } from "firebase/database";
import { rtdb } from "./firebase";

interface SendNotificationParams {
    receiverId: string;
    senderName: string;
    messageText: string;
    chatId: string;
    senderId: string;
}

// OneSignal REST API Key and App ID
const ONESIGNAL_APP_ID = "d76065f7-61da-4e36-9fb3-075a74be5ec6";

export const sendPushNotification = async ({
    receiverId,
    senderName,
    messageText,
    chatId,
    senderId,
}: SendNotificationParams): Promise<void> => {
    try {
        // 1. Store notification in Firebase (for in-app fallback)
        const notificationRef = ref(rtdb, `notifications/${receiverId}`);

        await push(notificationRef, {
            title: senderName || "New Message",
            body: messageText || "📷 Image",
            chatId,
            senderId,
            timestamp: Date.now(),
            read: false,
        });

        // 2. Send via OneSignal to receiver's devices
        // OneSignal will send to all devices where the user is logged in
        const response = await fetch("/api/send-notification", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                receiverId,
                title: senderName || "New Message",
                body: messageText || "📷 Image",
                chatId,
            }),
        });

        if (response.ok) {
            console.log("Push notification sent via OneSignal");
        }
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};
