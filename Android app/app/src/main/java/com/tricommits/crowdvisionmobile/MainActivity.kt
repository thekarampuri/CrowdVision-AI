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
        setContent {
            CrowdVisionMobileTheme {
                CrowdVisionNavHost()
            }
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