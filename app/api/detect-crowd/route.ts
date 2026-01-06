import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image, cameraId } = body

    console.log(`[API] --- New Request ---`)
    console.log(`[API] Camera: ${cameraId}`)
    console.log(`[API] Image size: ${Math.round(image?.length / 1024)} KB`)

    if (!image) {
      console.error("[API] Error: No image provided")
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // 2. Call the Python ML Inference Server
    console.log("[API] Forwarding to Python inference server (127.0.0.1:5000)...")

    try {
      const mlResponse = await fetch("http://127.0.0.1:5000/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, cameraId }),
        cache: 'no-store'
      })

      console.log(`[API] ML Server responded with status: ${mlResponse.status}`)

      if (!mlResponse.ok) {
        const errorText = await mlResponse.text()
        console.error(`[API] ML Server error: ${errorText}`)
        return NextResponse.json({ error: "ML Server Error" }, { status: mlResponse.status })
      }

      const mlDetections = await mlResponse.json()
      console.log(`[API] Detection Result: ${mlDetections.count} people, risk: ${mlDetections.riskLevel}`)

      // 3. Handle Alerts
      if (mlDetections.riskLevel === "high") {
        try {
          await addDoc(collection(db, "alerts"), {
            cameraId,
            count: mlDetections.count,
            riskLevel: mlDetections.riskLevel,
            timestamp: serverTimestamp(),
            acknowledged: false,
            location: "Main Entrance",
            message: `High risk detected: ${mlDetections.count} people`
          })
          console.log("[API] Alert stored in Firestore")
        } catch (firestoreError) {
          console.error("[API] Firestore Error:", firestoreError)
        }

        await sendAlertToAndroidApp({
          cameraId,
          count: mlDetections.count,
          riskLevel: mlDetections.riskLevel,
          timestamp: new Date().toISOString(),
        })
      }

      return NextResponse.json(mlDetections)

    } catch (fetchError: any) {
      console.error("[API] Failed to connect to Python server:", fetchError.message)
      return NextResponse.json({
        error: "ML Server Connection Failed",
        details: fetchError.message
      }, { status: 503 })
    }

  } catch (error: any) {
    console.error("[API] Global Route Error:", error.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

async function sendAlertToAndroidApp(alert: any) {
  try {
    console.log("[API] Sending alert to app:", alert.riskLevel)
    // FCM implementation would go here
  } catch (error) {
    console.error("[API] Push Notification Error:", error)
  }
}
