import { type NextRequest, NextResponse } from "next/server";
import { adminMessaging, adminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
    try {
        if (!adminMessaging || !adminDb) {
            return NextResponse.json(
                { error: "Firebase Admin not initialized" },
                { status: 500 },
            );
        }

        const body = await request.json();
        const { title, body: messageBody, data } = body;

        console.log("[Notification API] Request:", { title, messageBody });

        // 1. Get all device tokens
        const devicesSnapshot = await adminDb.collection("devices").get();
        const tokens: string[] = [];

        devicesSnapshot.forEach((doc) => {
            const deviceData = doc.data();
            if (deviceData.fcmToken) {
                tokens.push(deviceData.fcmToken);
            }
        });

        if (tokens.length === 0) {
            console.log("[Notification API] No devices found to notify");
            return NextResponse.json({ message: "No devices found" });
        }

        console.log(`[Notification API] Found ${tokens.length} devices`);

        // 2. Send multicast message
        const message = {
            notification: {
                title: title,
                body: messageBody,
            },
            data: data || {},
            tokens: tokens,
        };

        const response = await adminMessaging.sendEachForMulticast(message);

        console.log(
            `[Notification API] Sent ${response.successCount} messages, failed ${response.failureCount}`,
        );

        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(tokens[idx]);
                    console.error(`[Notification API] Failure for token ${tokens[idx]}:`, resp.error);
                }
            });
            // Optional: Cleanup invalid tokens from DB
        }

        return NextResponse.json({
            success: true,
            sentCount: response.successCount,
            failureCount: response.failureCount,
        });
    } catch (error: any) {
        console.error("[Notification API] Error:", error);
        return NextResponse.json(
            { error: "Failed to send notification" },
            { status: 500 },
        );
    }
}
