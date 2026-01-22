
package com.tricommits.crowdvisionmobile.ui.map

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tricommits.crowdvisionmobile.ui.alert.Alert
import com.tricommits.crowdvisionmobile.ui.alert.RiskLevelBadge
import com.tricommits.crowdvisionmobile.ui.alert.StatusBadge
import com.tricommits.crowdvisionmobile.ui.theme.CrowdVisionMobileTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MapScreen(
    alert: Alert,
    onBack: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Column {
                        Text("Camera Location")
                        Text("Live Alert Location", style = MaterialTheme.typography.bodySmall)
                    }
                },
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
                .fillMaxSize()
        ) {
            // Map container
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.LightGray), // Placeholder for the map
                contentAlignment = Alignment.Center
            ) {
                Text("Map Placeholder", style = MaterialTheme.typography.headlineMedium)
            }

            // Floating UI elements
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                // FABs in the top right corner
                Column(modifier = Modifier.align(Alignment.End)) {
                    FloatingActionButton(
                        onClick = { /* TODO: Zoom in */ },
                        shape = CircleShape,
                        modifier = Modifier.size(48.dp)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = "Zoom In")
                    }
                    Spacer(modifier = Modifier.padding(8.dp))
                    FloatingActionButton(
                        onClick = { /* TODO: Zoom out */ },
                        shape = CircleShape,
                        modifier = Modifier.size(48.dp)
                    ) {
                        Icon(Icons.Default.Remove, contentDescription = "Zoom Out")
                    }
                    Spacer(modifier = Modifier.padding(8.dp))
                    FloatingActionButton(
                        onClick = { /* TODO: Center map */ },
                        shape = CircleShape,
                        modifier = Modifier.size(48.dp)
                    ) {
                        Icon(Icons.Default.MyLocation, contentDescription = "Center Map")
                    }
                }

                // Info Card at the bottom
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = alert.cameraName,
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp
                        )
                        Spacer(modifier = Modifier.padding(4.dp))
                        Row {
                            RiskLevelBadge(riskLevel = alert.riskLevel)
                            Spacer(modifier = Modifier.width(8.dp))
                            StatusBadge(status = alert.status)
                        }
                        Spacer(modifier = Modifier.padding(4.dp))
                        Text(
                            text = "${alert.latitude}, ${alert.longitude}",
                            fontSize = 12.sp,
                            color = Color.Gray
                        )
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun MapScreenPreview() {
    CrowdVisionMobileTheme {
        val sampleAlert = Alert(
            id = "1",
            cameraName = "Main Street Cam",
            riskLevel = "CRITICAL",
            timestamp = "2024-09-15 10:30:00",
            status = "PENDING",
            message = "High crowd density detected.",
            latitude = 40.7128,
            longitude = -74.0060
        )
        MapScreen(alert = sampleAlert, onBack = {})
    }
}
