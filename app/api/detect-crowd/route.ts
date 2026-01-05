import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

export async function POST(request: NextRequest) {
  try {
    const { image, cameraId } = await request.json()

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // TODO: Integrate with your ML model here
    // For now, return mock detections
    const mockDetections = generateMockDetections()

    // Check if alert should be sent
    if (mockDetections.riskLevel === "high") {
      // Store alert in Firestore
      try {
        await addDoc(collection(db, "alerts"), {
          cameraId,
          count: mockDetections.count,
          riskLevel: mockDetections.riskLevel,
          timestamp: serverTimestamp(), // Use server timestamp for consistency
          acknowledged: false,
          location: "Main Entrance", // Ideally fetched from camera config
          message: `High risk detected: ${mockDetections.count} people`
        })
        console.log("Alert stored in Firestore")
      } catch (firestoreError) {
        console.error("Error storing alert in Firestore:", firestoreError)
      }

      // Send push notification to Android app
      await sendAlertToAndroidApp({
        cameraId,
        count: mockDetections.count,
        riskLevel: mockDetections.riskLevel,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json(mockDetections)
  } catch (error) {
    console.error("Detection API error:", error)
    return NextResponse.json({ error: "Detection failed" }, { status: 500 })
  }
}

function generateMockDetections() {
  const count = Math.floor(Math.random() * 15) + 1
  const boundingBoxes = Array.from({ length: count }, () => ({
    x: Math.random() * 0.7 + 0.1,
    y: Math.random() * 0.6 + 0.1,
    width: 0.08 + Math.random() * 0.06,
    height: 0.12 + Math.random() * 0.1,
    confidence: 0.7 + Math.random() * 0.3,
  }))

  let riskLevel: "low" | "medium" | "high" = "low"
  if (count > 10) riskLevel = "high"
  else if (count > 6) riskLevel = "medium"

  return { count, riskLevel, boundingBoxes }
}

async function sendAlertToAndroidApp(alert: any) {
  try {
    // TODO: Integrate with Firebase Cloud Messaging
    console.log("Alert sent to Android app:", alert)
  } catch (error) {
    console.error("Failed to send alert:", error)
  }
}
