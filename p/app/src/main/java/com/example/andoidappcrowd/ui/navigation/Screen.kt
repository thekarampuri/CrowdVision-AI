package com.example.andoidappcrowd.ui.navigation

sealed class Screen(val route: String) {
    object Alerts : Screen("alerts")
    object Map : Screen("map")
    object CompletedAlerts : Screen("completed_alerts")
}
