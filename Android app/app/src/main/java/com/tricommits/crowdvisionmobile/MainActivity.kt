package com.tricommits.crowdvisionmobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.google.gson.Gson
import com.tricommits.crowdvisionmobile.ui.alert.Alert
import com.tricommits.crowdvisionmobile.ui.alert.AlertDetailScreen
import com.tricommits.crowdvisionmobile.ui.alert.AlertListScreen
import com.tricommits.crowdvisionmobile.ui.map.MapScreen
import com.tricommits.crowdvisionmobile.ui.theme.CrowdVisionMobileTheme

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
    NavHost(navController = navController, startDestination = "alerts") {
        composable("alerts") {
            AlertListScreen(onAlertClick = {
                val json = Gson().toJson(it)
                navController.navigate("alertDetail/$json")
            })
        }
        composable(
            "alertDetail/{alertJson}",
            arguments = listOf(navArgument("alertJson") { type = NavType.StringType })
        ) { backStackEntry ->
            val json = backStackEntry.arguments?.getString("alertJson")
            val alert = Gson().fromJson(json, Alert::class.java)
            AlertDetailScreen(
                alert = alert,
                onBack = { navController.popBackStack() },
                onViewOnMap = { latitude, longitude ->
                    navController.navigate("map/$latitude/$longitude")
                }
            )
        }
        composable(
            "map/{latitude}/{longitude}",
            arguments = listOf(
                navArgument("latitude") { type = NavType.FloatType },
                navArgument("longitude") { type = NavType.FloatType }
            )
        ) { backStackEntry ->
            val latitude = backStackEntry.arguments?.getFloat("latitude")?.toDouble()
            val longitude = backStackEntry.arguments?.getFloat("longitude")?.toDouble()
            if (latitude != null && longitude != null) {
                MapScreen(
                    latitude = latitude,
                    longitude = longitude,
                    onBack = { navController.popBackStack() }
                )
            }
        }
    }
}
