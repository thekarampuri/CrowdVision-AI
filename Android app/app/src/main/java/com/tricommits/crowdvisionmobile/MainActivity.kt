package com.tricommits.crowdvisionmobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.tricommits.crowdvisionmobile.ui.alert.AlertListScreen
import com.tricommits.crowdvisionmobile.ui.theme.CrowdVisionMobileTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            CrowdVisionMobileTheme {
                AlertListScreen()
            }
        }
    }
}