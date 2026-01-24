package com.tricommits.crowdvisionmobile

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.tricommits.crowdvisionmobile.ui.alert.AlertDetailScreen
import com.tricommits.crowdvisionmobile.ui.alert.AlertHistoryScreen
import com.tricommits.crowdvisionmobile.ui.alert.AlertListScreen
import com.tricommits.crowdvisionmobile.ui.map.MapScreen
import com.tricommits.crowdvisionmobile.ui.theme.CrowdVisionMobileTheme
import com.tricommits.crowdvisionmobile.viewmodel.AlertViewModel

class MainActivity : ComponentActivity() {

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            // FCM SDK (and your app) can post notifications.
        } else {
            // TODO: Inform user that that your app will not show notifications.
        }
    }

    private fun askNotificationPermission() {
        // This is only necessary for API level 33 and higher.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) ==
                PackageManager.PERMISSION_GRANTED
            ) {
                // FCM SDK (and your app) can post notifications.
            } else if (shouldShowRequestPermissionRationale(Manifest.permission.POST_NOTIFICATIONS)) {
                // TODO: Display an educational UI explaining why the permission is needed.
            } else {
                // Directly ask for the permission.
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        askNotificationPermission()
        enableEdgeToEdge()
        
        // Start listening for new alerts
        val repository = com.tricommits.crowdvisionmobile.ui.alert.FirebaseAlertRepository()
        repository.listenForNewAlerts { alert ->
            sendLocalNotification(alert)
        }

        setContent {
            CrowdVisionMobileTheme {
                CrowdVisionNavHost()
            }
        }
    }

    private fun sendLocalNotification(alert: com.tricommits.crowdvisionmobile.ui.alert.Alert) {
        val channelId = "default_channel"
        val notificationManager = getSystemService(android.content.Context.NOTIFICATION_SERVICE) as android.app.NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = android.app.NotificationChannel(
                channelId,
                "Crowd Alerts",
                android.app.NotificationManager.IMPORTANCE_HIGH
            )
            notificationManager.createNotificationChannel(channel)
        }

        val intent = android.content.Intent(this, MainActivity::class.java).apply {
            flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK or android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent = android.app.PendingIntent.getActivity(
            this, 0, intent,
            android.app.PendingIntent.FLAG_IMMUTABLE or android.app.PendingIntent.FLAG_UPDATE_CURRENT
        )

        val builder = androidx.core.app.NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_launcher_foreground) // Ensure this resource exists, fallback if needed
            .setContentTitle("Critical Alert: ${alert.cameraName}")
            .setContentText("Crowd density high! ${alert.description}")
            .setPriority(androidx.core.app.NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)

        if (androidx.core.content.ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        ) {
            notificationManager.notify(System.currentTimeMillis().toInt(), builder.build())
        }
    }
}

@Composable
fun CrowdVisionNavHost() {
    val navController = rememberNavController()
    val alertViewModel: AlertViewModel = viewModel()

    NavHost(navController = navController, startDestination = "alerts") {
        composable("alerts") {
            AlertListScreen(
                viewModel = alertViewModel,
                onAlertClick = { alert ->
                    navController.navigate("alertDetail/${alert.id}")
                },
                onHistoryClick = { navController.navigate("history") }
            )
        }
        composable("history") {
            AlertHistoryScreen(
                viewModel = alertViewModel,
                onBack = { navController.popBackStack() },
                onAlertClick = { alert ->
                    navController.navigate("alertDetail/${alert.id}")
                }
            )
        }
        composable(
            "alertDetail/{alertId}",
            arguments = listOf(navArgument("alertId") { type = NavType.StringType })
        ) { backStackEntry ->
            val alertId = backStackEntry.arguments?.getString("alertId")
            val alert = alertViewModel.getAlertById(alertId ?: "")
            if (alert != null) {
                AlertDetailScreen(
                    alert = alert,
                    viewModel = alertViewModel,
                    onBack = { navController.popBackStack() },
                    onViewOnMap = { selectedAlert ->
                        navController.navigate("map/${selectedAlert.id}")
                    }
                )
            }
        }
        composable(
            "map/{alertId}",
            arguments = listOf(navArgument("alertId") { type = NavType.StringType })
        ) { backStackEntry ->
            val alertId = backStackEntry.arguments?.getString("alertId")
            val alert = alertViewModel.getAlertById(alertId ?: "")
            if (alert != null) {
                MapScreen(
                    alert = alert,
                    onBack = { navController.popBackStack() }
                )
            }
        }
    }
}