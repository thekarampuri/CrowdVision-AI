package com.example.andoidappcrowd.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import androidx.core.app.NotificationCompat
import com.example.andoidappcrowd.MainActivity
import com.example.andoidappcrowd.R
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class FirebaseMessagingService : FirebaseMessagingService() {
    
    @Inject
    lateinit var webSocketManager: com.example.andoidappcrowd.data.websocket.WebSocketManager
    
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        // Handle FCM messages
        remoteMessage.notification?.let {
            sendNotification(it.title ?: "CrowdVision Alert", it.body ?: "New alert received")
        }
        
        // Handle data messages
        remoteMessage.data.isNotEmpty().let {
            val title = remoteMessage.data["title"] ?: "CrowdVision Alert"
            val body = remoteMessage.data["body"] ?: "New alert received"
            sendNotification(title, body)
        }
    }
    
    override fun onNewToken(token: String) {
        // Send token to your server
        super.onNewToken(token)
    }
    
    private fun sendNotification(title: String, body: String) {
        val intent = Intent(this, MainActivity::class.java)
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
        )
        
        val channelId = "crowdvision_alerts"
        val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setSound(defaultSoundUri)
            .setContentIntent(pendingIntent)
        
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        // Create channel for Android O and above
        val channel = NotificationChannel(
            channelId,
            "CrowdVision Alerts",
            NotificationManager.IMPORTANCE_HIGH
        )
        notificationManager.createNotificationChannel(channel)
        
        notificationManager.notify(0, notificationBuilder.build())
    }
}