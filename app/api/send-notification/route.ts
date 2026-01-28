import { NextRequest, NextResponse } from "next/server";

// OneSignal REST API
const ONESIGNAL_APP_ID = "d76065f7-61da-4e36-9fb3-075a74be5ec6";
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY || "";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { receiverId, title, body: messageBody, chatId } = body;

        if (!receiverId) {
            return NextResponse.json(
                { error: "No receiver ID provided" },
                { status: 400 }
            );
        }

        // Send notification via OneSignal to the user
        // OneSignal uses "external_user_id" to target specific users
        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`,
            },
            body: JSON.stringify({
                app_id: ONESIGNAL_APP_ID,
                // Target user by their external user ID (which we set as Firebase UID)
                include_aliases: {
                    external_id: [receiverId],
                },
                target_channel: "push",
                // Notification content
                headings: { en: title || "New Message" },
                contents: { en: messageBody || "You have a new message" },
                // Additional data
                data: {
                    chatId,
                    type: "new_message",
                },
                // Web push specific
                web_url: "/",
                chrome_web_icon: "/logo.png",
                // iOS/Android specific
                ios_badgeType: "Increase",
                ios_badgeCount: 1,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("OneSignal error:", result);
            // Don't fail the request - notification is best effort
            return NextResponse.json({
                success: false,
                error: result.errors || "Failed to send notification",
            });
        }

        return NextResponse.json({
            success: true,
            notificationId: result.id,
        });
    } catch (error) {
        console.error("Error sending notification:", error);
        return NextResponse.json(
            { error: "Failed to send notification" },
            { status: 500 }
        );
    }
}
