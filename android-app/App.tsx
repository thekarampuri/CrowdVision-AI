"use client"

/**
 * CrowdVision AI Android App
 * Real-time crowd detection alerts for authorities
 *
 * This is a React Native application that receives push notifications
 * from the CrowdVision AI surveillance system when high crowd density is detected.
 */

import { useEffect, useState } from "react"
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  PermissionsAndroid,
} from "react-native"
import messaging from "@react-native-firebase/messaging"
import notifee, { AndroidImportance } from "@notifee/react-native"
import { LinearGradient } from "expo-linear-gradient"

interface Alert {
  id: string
  cameraId: string
  cameraName: string
  location: string
  count: number
  riskLevel: "low" | "medium" | "high"
  timestamp: string
  acknowledged: boolean
}

export default function App() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [fcmToken, setFcmToken] = useState<string>("")

  useEffect(() => {
    requestUserPermission()
    setupNotifications()
    subscribeToTopics()
  }, [])

  const requestUserPermission = async () => {
    if (Platform.OS === "android") {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
    }

    const authStatus = await messaging().requestPermission()
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL

    if (enabled) {
      console.log("Authorization status:", authStatus)
      getFCMToken()
    }
  }

  const getFCMToken = async () => {
    try {
      const token = await messaging().getToken()
      setFcmToken(token)
      console.log("FCM Token:", token)
      // Send this token to your backend to store for targeted notifications
    } catch (error) {
      console.error("Error getting FCM token:", error)
    }
  }

  const subscribeToTopics = async () => {
    // Subscribe to alert topics
    await messaging().subscribeToTopic("crowdvision-alerts")
    await messaging().subscribeToTopic("high-density-alerts")
    console.log("Subscribed to alert topics")
  }

  const setupNotifications = () => {
    // Foreground notification handler
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log("Foreground notification:", remoteMessage)

      // Add to alerts list
      if (remoteMessage.data) {
        const newAlert: Alert = {
          id: Date.now().toString(),
          cameraId: remoteMessage.data.cameraId as string,
          cameraName: (remoteMessage.data.cameraName as string) || "Unknown Camera",
          location: (remoteMessage.data.location as string) || "Unknown Location",
          count: Number.parseInt(remoteMessage.data.count as string) || 0,
          riskLevel: (remoteMessage.data.riskLevel as Alert["riskLevel"]) || "medium",
          timestamp: (remoteMessage.data.timestamp as string) || new Date().toISOString(),
          acknowledged: false,
        }
        setAlerts((prev) => [newAlert, ...prev])
      }

      // Display notification
      await displayNotification(remoteMessage)
    })

    // Background notification handler
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("Background notification:", remoteMessage)
      await displayNotification(remoteMessage)
    })

    return unsubscribe
  }

  const displayNotification = async (message: any) => {
    // Create a channel for Android
    const channelId = await notifee.createChannel({
      id: "crowdvision-alerts",
      name: "CrowdVision AI Alerts",
      importance: AndroidImportance.HIGH,
      sound: "alert",
      vibration: true,
    })

    // Display notification
    await notifee.displayNotification({
      title: message.notification?.title || "Crowd Alert",
      body: message.notification?.body || "High crowd density detected",
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: "default",
        },
        color: "#00BFFF",
        largeIcon: require("./assets/alert-icon.png"),
        sound: "alert",
        vibrationPattern: [300, 500, 300, 500],
      },
      data: message.data,
    })
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert)))
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return ["#FF4444", "#FF6B6B"]
      case "medium":
        return ["#FFA500", "#FFB84D"]
      case "low":
        return ["#00C853", "#00E676"]
      default:
        return ["#607D8B", "#90A4AE"]
    }
  }

  const renderAlert = ({ item }: { item: Alert }) => {
    const colors = getRiskColor(item.riskLevel)

    return (
      <TouchableOpacity style={styles.alertCard} onPress={() => acknowledgeAlert(item.id)} activeOpacity={0.8}>
        <LinearGradient colors={[`${colors[0]}15`, `${colors[1]}10`]} style={styles.alertGradient}>
          <View style={styles.alertHeader}>
            <View>
              <Text style={styles.cameraName}>{item.cameraName}</Text>
              <Text style={styles.location}>{item.location}</Text>
            </View>
            <View style={[styles.riskBadge, { backgroundColor: colors[0] }]}>
              <Text style={styles.riskText}>{item.riskLevel.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.alertBody}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>People Detected</Text>
              <Text style={styles.statValue}>{item.count}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Camera ID</Text>
              <Text style={styles.statValue}>{item.cameraId}</Text>
            </View>
          </View>

          <View style={styles.alertFooter}>
            <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
            {item.acknowledged && <Text style={styles.acknowledgedText}>✓ Acknowledged</Text>}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      {/* Header */}
      <LinearGradient colors={["#0A1628", "#1E3A5F"]} style={styles.header}>
        <Image source={require("./assets/crowdvision-logo.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>CrowdVision AI Alerts</Text>
        <Text style={styles.subtitle}>Real-time Crowd Monitoring</Text>
      </LinearGradient>

      {/* Alerts List */}
      <View style={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statCardLabel}>Total Alerts</Text>
            <Text style={styles.statCardValue}>{alerts.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statCardLabel}>Unacknowledged</Text>
            <Text style={styles.statCardValue}>{alerts.filter((a) => !a.acknowledged).length}</Text>
          </View>
        </View>

        <FlatList
          data={alerts}
          renderItem={renderAlert}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No alerts yet</Text>
              <Text style={styles.emptySubtext}>You'll receive notifications when high crowd density is detected</Text>
            </View>
          }
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1628",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#90CAF9",
  },
  content: {
    flex: 1,
    backgroundColor: "#0F1F38",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 24,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  statCardLabel: {
    fontSize: 12,
    color: "#90CAF9",
    marginBottom: 8,
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  alertCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  alertGradient: {
    padding: 20,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cameraName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: "#90CAF9",
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  alertBody: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 12,
    padding: 12,
  },
  statLabel: {
    fontSize: 11,
    color: "#90CAF9",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  alertFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timestamp: {
    fontSize: 12,
    color: "#64B5F6",
  },
  acknowledgedText: {
    fontSize: 12,
    color: "#00E676",
    fontWeight: "bold",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#90CAF9",
    textAlign: "center",
    paddingHorizontal: 40,
  },
})
