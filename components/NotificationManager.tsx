"use client";

import { useEffect, useRef } from "react";
import { ref, onChildAdded, query, limitToLast, remove } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { initOneSignal, setOneSignalUserId, requestOneSignalPermission } from "@/lib/onesignal";

export default function NotificationManager() {
    const { user } = useAuth();
    const processedMessagesRef = useRef<Set<string>>(new Set());
    const initialLoadRef = useRef(true);
    const oneSignalInitializedRef = useRef(false);

    // Initialize OneSignal when component mounts
    useEffect(() => {
        if (typeof window === "undefined") return;

        initOneSignal();
    }, []);

    // Set OneSignal user ID when user logs in
    useEffect(() => {
        if (!user || oneSignalInitializedRef.current) return;

        const setupOneSignal = async () => {
            try {
                // Wait a bit for OneSignal SDK to load
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Set the user ID in OneSignal
                await setOneSignalUserId(user.uid);

                // Request notification permission
                await requestOneSignalPermission();

                oneSignalInitializedRef.current = true;
                console.log("OneSignal setup complete for user:", user.uid);
            } catch (error) {
                console.error("Error setting up OneSignal:", error);
            }
        };

        setupOneSignal();
    }, [user]);

    // Listen for notifications stored in Firebase (fallback)
    useEffect(() => {
        if (!user) return;

        const notificationsRef = ref(rtdb, `notifications/${user.uid}`);

        const unsubscribe = onChildAdded(notificationsRef, (snapshot) => {
            const notification = snapshot.val();
            const notificationId = snapshot.key;

            if (!notification || !notificationId) return;

            if (processedMessagesRef.current.has(notificationId)) return;
            processedMessagesRef.current.add(notificationId);

            // Skip old notifications
            if (Date.now() - notification.timestamp > 30000) {
                remove(ref(rtdb, `notifications/${user.uid}/${notificationId}`));
                return;
            }

            // Show browser notification (fallback if OneSignal doesn't catch it)
            if (typeof window !== "undefined" && "Notification" in window) {
                if (Notification.permission === "granted" && document.visibilityState === "hidden") {
                    const notif = new Notification(notification.title || "New Message", {
                        body: notification.body || "You have a new message",
                        icon: "/logo.png",
                        tag: notification.chatId || "chatbook-notification",
                    });

                    setTimeout(() => notif.close(), 5000);

                    notif.onclick = () => {
                        window.focus();
                        notif.close();
                    };
                }
            }

            // Clean up
            setTimeout(() => {
                remove(ref(rtdb, `notifications/${user.uid}/${notificationId}`));
            }, 1000);
        });

        return () => unsubscribe();
    }, [user]);

    // Listen for direct messages (in-app notification fallback)
    useEffect(() => {
        if (!user) return;

        const chatsRef = ref(rtdb, "chats");

        const unsubscribe = onChildAdded(chatsRef, (snapshot) => {
            const chatId = snapshot.key;
            if (!chatId || !chatId.includes(user.uid)) return;

            const messagesRef = ref(rtdb, `chats/${chatId}/messages`);
            const q = query(messagesRef, limitToLast(1));

            return onChildAdded(q, (msgSnapshot) => {
                if (initialLoadRef.current) return;

                const msg = msgSnapshot.val();
                if (!msg) return;

                const msgKey = `msg_${msgSnapshot.key}`;
                if (processedMessagesRef.current.has(msgKey)) return;
                processedMessagesRef.current.add(msgKey);

                if (
                    msg.receiverId === user.uid &&
                    !msg.read &&
                    typeof document !== "undefined" &&
                    document.visibilityState === "hidden"
                ) {
                    if ("Notification" in window && Notification.permission === "granted") {
                        new Notification("New Message", {
                            body: msg.text || "📷 Image",
                            icon: "/logo.png",
                            tag: chatId,
                        });
                    }
                }
            });
        });

        setTimeout(() => {
            initialLoadRef.current = false;
        }, 2000);

        return () => { };
    }, [user]);

    return null;
}
