package com.tricommits.crowdvisionmobile

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class CrowdVisionMessagingService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "Refreshed token: $token")
        saveTokenToFirestore(token)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        Log.d(TAG, "From: ${remoteMessage.from}")

        remoteMessage.notification?.let {
            sendNotification(it.title, it.body, remoteMessage.data)
        }
    }

    private fun sendNotification(title: String?, body: String?, data: Map<String, String>) {
        val channelId = "default_channel"
        val riskLevel = data["riskLevel"]

        val intent = Intent(this, MainActivity::class.java)
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        val pendingIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE)

        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)

        if (riskLevel == "CRITICAL") {
            notificationBuilder.priority = NotificationCompat.PRIORITY_HIGH
        }

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelId, "Default Channel", NotificationManager.IMPORTANCE_DEFAULT)
            if (riskLevel == "CRITICAL") {
                channel.importance = NotificationManager.IMPORTANCE_HIGH
            }
            notificationManager.createNotificationChannel(channel)
        }

        notificationManager.notify(0, notificationBuilder.build())
    }

    private fun saveTokenToFirestore(token: String) {
        val deviceId = Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)
        val device = hashMapOf(
            "fcmToken" to token,
            "platform" to "android"
        )

        FirebaseFirestore.getInstance().collection("devices").document(deviceId)
            .set(device)
            .addOnSuccessListener { Log.d(TAG, "FCM token saved to Firestore") }
            .addOnFailureListener { e -> Log.w(TAG, "Error saving FCM token to Firestore", e) }
    }

    companion object {
        private const val TAG = "CrowdVisionMessaging"
    }
}
