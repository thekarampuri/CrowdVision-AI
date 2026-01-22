package com.example.andoidappcrowd

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.example.andoidappcrowd.ui.screens.MainScreen
import com.example.andoidappcrowd.ui.theme.AndoidAppCrowdTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AndoidAppCrowdTheme {
                MainScreen()
            }
        }
    }
}
