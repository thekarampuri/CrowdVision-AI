package com.example.andoidappcrowd.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.andoidappcrowd.data.model.Alert
import com.example.andoidappcrowd.viewmodel.CrowdVisionViewModel
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CompletedAlertsScreen(
    viewModel: CrowdVisionViewModel = hiltViewModel()
) {
    val allAlerts by viewModel.alerts.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()
    
    // Filter only completed alerts (acknowledged or resolved)
    val completedAlerts = remember(allAlerts) {
        allAlerts.filter { it.status == "acknowledged" || it.status == "resolved" }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Completed Alerts") },
                actions = {
                    IconButton(onClick = { viewModel.refreshData() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when {
                isLoading -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                
                errorMessage != null -> {
                    Column(
                        modifier = Modifier.align(Alignment.Center),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            Icons.Default.Error,
                            contentDescription = "Error",
                            tint = MaterialTheme.colorScheme.error,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = errorMessage!!,
                            color = MaterialTheme.colorScheme.error
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(onClick = { viewModel.clearError() }) {
                            Text("Dismiss")
                        }
                    }
                }
                
                completedAlerts.isEmpty() -> {
                    Column(
                        modifier = Modifier.align(Alignment.Center),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            Icons.Default.CheckCircle,
                            contentDescription = "No completed alerts",
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "No completed alerts",
                            style = MaterialTheme.typography.bodyLarge
                        )
                    }
                }
                
                else -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(completedAlerts) { alert ->
                            CompletedAlertCard(alert = alert)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CompletedAlertCard(alert: Alert) {
    val dateFormat = SimpleDateFormat("MMM dd, HH:mm", Locale.getDefault())
    val resolvedDateFormat = SimpleDateFormat("MMM dd, HH:mm", Locale.getDefault())
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = alert.title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = alert.description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                // Status indicator
                CompletedStatusBadge(status = alert.status)
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Timestamps
            Column {
                Text(
                    text = "Created: ${dateFormat.format(Date(alert.timestamp))}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                if (alert.acknowledgedAt != null) {
                    Text(
                        text = "Acknowledged: ${resolvedDateFormat.format(Date(alert.acknowledgedAt!!))}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
                
                if (alert.resolvedAt != null) {
                    Text(
                        text = "Resolved: ${resolvedDateFormat.format(Date(alert.resolvedAt!!))}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.secondary
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Additional info
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                if (alert.peopleCount > 0) {
                    Text(
                        text = "People: ${alert.peopleCount}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                if (alert.location.isNotEmpty()) {
                    Text(
                        text = "Location: ${alert.location}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                // Severity indicator
                SeverityBadge(severity = alert.severity)
            }
        }
    }
}

@Composable
fun CompletedStatusBadge(status: String) {
    val (color, text) = when (status.lowercase()) {
        "acknowledged" -> Color(0xFFFF9800) to "Acknowledged"
        "resolved" -> Color.Green to "Resolved"
        else -> Color.Gray to "Unknown"
    }
    
    Surface(
        shape = MaterialTheme.shapes.small,
        color = color.copy(alpha = 0.2f)
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            style = MaterialTheme.typography.labelSmall,
            color = color,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
fun SeverityBadge(severity: String) {
    val (color, text) = when (severity.lowercase()) {
        "high" -> Color.Red to "HIGH"
        "medium" -> Color(0xFFFF9800) to "MEDIUM"
        "low" -> Color.Green to "LOW"
        else -> Color.Gray to "UNKNOWN"
    }
    
    Surface(
        shape = MaterialTheme.shapes.small,
        color = color.copy(alpha = 0.2f)
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            style = MaterialTheme.typography.labelSmall,
            color = color,
            fontWeight = FontWeight.Bold
        )
    }
}
