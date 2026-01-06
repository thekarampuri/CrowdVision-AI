import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

export async function POST(request: NextRequest) {
  try {
    const { image, cameraId } = await request.json()

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // 2. Call the Python ML Inference Server
    const mlResponse = await fetch("http://127.0.0.1:5000/detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image, cameraId })
    })

    if (!mlResponse.ok) {
      throw new Error(`Inference server responded with ${mlResponse.status}`)
    }

    const mlDetections = await mlResponse.json()

    // 3. Check if alert should be sent
    if (mlDetections.riskLevel === "high") {
      // Store alert in Firestore
      try {
        await addDoc(collection(db, "alerts"), {
          cameraId,
          count: mlDetections.count,
          riskLevel: mlDetections.riskLevel,
          timestamp: serverTimestamp(),
          acknowledged: false,
          location: "Main Entrance", // Ideally fetched from camera config
          message: `High risk detected: ${mlDetections.count} people`
        })
        console.log("Alert stored in Firestore")
      } catch (firestoreError) {
        console.error("Error storing alert in Firestore:", firestoreError)
      }

      // Send push notification
      await sendAlertToAndroidApp({
        cameraId,
        count: mlDetections.count,
        riskLevel: mlDetections.riskLevel,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json(mlDetections)
  } catch (error) {
    console.error("Detection API error:", error)
    return NextResponse.json({ error: "Detection failed" }, { status: 500 })
  }
}

async function sendAlertToAndroidApp(alert: any) {
  try {
    // TODO: Integrate with Firebase Cloud Messaging
    console.log("Alert sent to Android app:", alert)
  } catch (error) {
    console.error("Failed to send alert:", error)
  }
}
