
package com.tricommits.crowdvisionmobile.ui.alert

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.tricommits.crowdvisionmobile.ui.theme.CrowdVisionMobileTheme
import com.tricommits.crowdvisionmobile.viewmodel.AlertViewModel

import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AlertDetailScreen(
    alert: Alert,
    viewModel: AlertViewModel,
    onBack: () -> Unit,
    onViewOnMap: (Alert) -> Unit
) {
    var metricsData by remember { mutableStateOf<Map<String, Any>>(emptyMap()) }

    LaunchedEffect(alert.id) {
        viewModel.getAlertMetrics(alert.id) { updatedMetrics ->
            metricsData = updatedMetrics
        }
    }

    val createdAt = metricsData["createdAt"] as? Long
    val assignedAt = metricsData["assignedAt"] as? Long
    val reachedAt = metricsData["reachedAt"] as? Long
    val assignedRescuer = metricsData["assignedRescuer"] as? String

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

            // [NEW] SOS Performance Metrics Card
            if (alert.status == "PENDING") {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1A1A1A)) // Dark theme for metrics
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Live SOS Tracking", color = Color.White, fontWeight = FontWeight.Bold)
                        
                        MetricRow("Created", createdAt?.let { formatTime(it) } ?: "Pending...")
                        MetricRow("Assigned", assignedAt?.let { formatTime(it) } ?: "Waiting for Dispatch")
                        MetricRow("Reached", reachedAt?.let { formatTime(it) } ?: "In Transit...")
                        
                        if (assignedRescuer != null) {
                            Text("Rescuer: $assignedRescuer", color = MaterialTheme.colorScheme.primary, fontSize = 14.sp)
                        }
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
                
                if (alert.status == "PENDING") {
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    if (assignedAt == null) {
                        Button(
                            onClick = { viewModel.assignRescuer(alert.id, "Rescue Team Alpha") },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6))
                        ) {
                            Text("Assign Rescue Team")
                        }
                    } else if (reachedAt == null) {
                        Button(
                            onClick = { viewModel.markAsReached(alert.id) },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
                        ) {
                            Text("Mark as Reached")
                        }
                    } else {
                        OutlinedButton(
                            onClick = { 
                                viewModel.markAlertAsCompleted(alert.id)
                                onBack() 
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Finalize & Resolve SOS")
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
                Button(
                    onClick = { 
                        viewModel.deleteAlert(alert.id)
                        onBack()
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Delete Alert")
                }
            }
        }
    }
}

@Composable
fun MetricRow(label: String, value: String) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, color = Color.Gray, fontSize = 12.sp)
        Text(value, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Medium)
    }
}

private fun formatTime(millis: Long): String {
    val sdf = java.text.SimpleDateFormat("HH:mm:ss", java.util.Locale.getDefault())
    return sdf.format(java.util.Date(millis))
}

@Composable
fun RiskLevelBadge(riskLevel: String) {
    val (backgroundColor, textColor) = when (riskLevel.lowercase()) {
        "safe" -> Color.Green to Color.White
        "warning" -> Color.Yellow to Color.Black
        "critical" -> Color.Red to Color.White
        else -> Color.Gray to Color.White
    }
    Badge(text = riskLevel, backgroundColor = backgroundColor, textColor = textColor)
}

@Composable
fun StatusBadge(status: String) {
    val (backgroundColor, textColor) = when (status) {
        "PENDING" -> Color(0xFFFFA500) to Color.White // Orange
        "COMPLETED" -> Color.Gray to Color.White
        else -> Color.LightGray to Color.Black
    }
    Badge(text = status, backgroundColor = backgroundColor, textColor = textColor)
}

@Composable
fun Badge(
    text: String,
    backgroundColor: Color,
    textColor: Color
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .background(backgroundColor)
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(
            text = text,
            color = textColor,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Preview(showBackground = true)
@Composable
fun AlertDetailScreenPreview() {
    CrowdVisionMobileTheme {
        val sampleAlert = Alert(
            id = "1",
            cameraName = "Main Street Cam",
            severity = "CRITICAL",
            timestamp = "2024-09-15 10:30:00",
            status = "PENDING",
            description = "High crowd density detected.",
            latitude = 40.7128,
            longitude = -74.0060
        )
        AlertDetailScreen(alert = sampleAlert, viewModel = viewModel(), onBack = {}, onViewOnMap = { })
    }
}
