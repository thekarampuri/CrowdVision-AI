package com.tricommits.crowdvisionmobile.ui.map

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.tricommits.crowdvisionmobile.ui.theme.CrowdVisionMobileTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MapScreen(
    latitude: Double,
    longitude: Double,
    onBack: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Alert Location") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .padding(paddingValues)
                .fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Map Placeholder", style = MaterialTheme.typography.headlineMedium)
                Text("Latitude: $latitude")
                Text("Longitude: $longitude")
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun MapScreenPreview() {
    CrowdVisionMobileTheme {
        MapScreen(latitude = 40.7128, longitude = -74.0060, onBack = {})
    }
}
