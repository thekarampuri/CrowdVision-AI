import admin from "firebase-admin";

if (!admin.apps.length) {
    try {
        let serviceAccount: any = null;
        
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        } else {
            // Check if file exists without triggering build-time require failure
            const fs = require('fs');
            const path = require('path');
            const saPath = path.join(process.cwd(), 'service-account.json');
            
            if (fs.existsSync(saPath)) {
                try {
                    const saData = fs.readFileSync(saPath, 'utf8');
                    serviceAccount = JSON.parse(saData);
                } catch (e) {
                    console.error("[Firebase Admin] Error parsing service-account.json:", e);
                }
            }
        }

        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log("[Firebase Admin] Initialized successfully");
        } else {
            console.warn("[Firebase Admin] No service account provided. Admin SDK functions will be disabled.");
        }
    } catch (error) {
        console.error("[Firebase Admin] Initialization failed:", error);
    }
}

export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminMessaging = admin.apps.length ? admin.messaging() : null;
