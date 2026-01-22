package com.example.andoidappcrowd.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.andoidappcrowd.ui.screens.AlertsScreen
import com.example.andoidappcrowd.ui.screens.CompletedAlertsScreen
import com.example.andoidappcrowd.ui.screens.MapScreen

@Composable
fun Navigation() {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = Screen.Alerts.route) {
        composable(Screen.Alerts.route) {
            AlertsScreen()
        }
        composable(Screen.Map.route) {
            MapScreen()
        }
        composable(Screen.CompletedAlerts.route) {
            CompletedAlertsScreen()
        }
    }
}
