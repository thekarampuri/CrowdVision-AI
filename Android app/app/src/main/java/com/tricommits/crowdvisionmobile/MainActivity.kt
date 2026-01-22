package com.tricommits.crowdvisionmobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.tricommits.crowdvisionmobile.ui.alert.AlertDetailScreen
import com.tricommits.crowdvisionmobile.ui.alert.AlertListScreen
import com.tricommits.crowdvisionmobile.ui.map.MapScreen
import com.tricommits.crowdvisionmobile.ui.theme.CrowdVisionMobileTheme
import com.tricommits.crowdvisionmobile.viewmodel.AlertViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
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