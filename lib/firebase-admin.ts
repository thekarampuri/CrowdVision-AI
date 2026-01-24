import admin from "firebase-admin";

if (!admin.apps.length) {
    try {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
            : require("@/service-account.json"); // Fallback to local file

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log("[Firebase Admin] Initialized successfully");
    } catch (error) {
        console.error("[Firebase Admin] Initialization failed:", error);
        console.error(
            "Please ensure FIREBASE_SERVICE_ACCOUNT_KEY env var is set or service-account.json exists.",
        );
    }
}

export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminMessaging = admin.apps.length ? admin.messaging() : null;
