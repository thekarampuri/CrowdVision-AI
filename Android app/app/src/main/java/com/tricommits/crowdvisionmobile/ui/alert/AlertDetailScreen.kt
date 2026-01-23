
package com.tricommits.crowdvisionmobile.ui.alert

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
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
import androidx.lifecycle.viewmodel.compose.viewModel
import com.tricommits.crowdvisionmobile.ui.theme.CrowdVisionMobileTheme
import com.tricommits.crowdvisionmobile.viewmodel.AlertViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AlertDetailScreen(
    alert: Alert,
    viewModel: AlertViewModel,
    onBack: () -> Unit,
    onViewOnMap: (Alert) -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Alert Details") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .padding(paddingValues)
                .padding(16.dp)
                .verticalScroll(rememberScrollState())
                .fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Alert Header Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = alert.cameraName,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row {
                        RiskLevelBadge(riskLevel = alert.severity)
                        Spacer(modifier = Modifier.width(8.dp))
                        StatusBadge(status = alert.status)
                    }
                }
            }

            // Alert Information Section
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Message: ${alert.description}", style = MaterialTheme.typography.bodyLarge)
                    Text("Timestamp: ${alert.timestamp}", style = MaterialTheme.typography.bodyMedium)
                    Text("Camera ID: ${alert.id}", style = MaterialTheme.typography.bodyMedium)
                    Text("Location: ${alert.latitude}, ${alert.longitude}", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                }
            }

            // Action Buttons
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                Button(
                    onClick = { onViewOnMap(alert) },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("View Location on Map")
                }
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedButton(
                    onClick = { 
                        viewModel.markAlertAsCompleted(alert.id)
                        onBack() 
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = alert.status == "PENDING"
                ) {
                    Text("Mark as Completed")
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun AlertDetailScreenPreview() {
    CrowdVisionMobileTheme {
        val sampleAlert = Alert("1", "Entrance Cam", "CRITICAL", "2024-09-15 10:30:00", "PENDING", "High crowd density detected.", 40.7128, -74.0060)
        AlertDetailScreen(alert = sampleAlert, viewModel = viewModel(), onBack = {}, onViewOnMap = { })
    }
}
