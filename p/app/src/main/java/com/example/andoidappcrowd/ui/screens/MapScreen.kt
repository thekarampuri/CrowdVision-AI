package com.example.andoidappcrowd.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.andoidappcrowd.data.model.Camera
import com.example.andoidappcrowd.viewmodel.CrowdVisionViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MapScreen(
    viewModel: CrowdVisionViewModel = hiltViewModel()
) {
    val cameras by viewModel.cameras.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()
    val connectionState by viewModel.connectionState.collectAsState()
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Camera Map") },
                actions = {
                    IconButton(onClick = { viewModel.refreshData() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                }
            )
        },
        bottomBar = {
            ConnectionStatusBar(connectionState = connectionState)
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
                
                cameras.isEmpty() -> {
                    Column(
                        modifier = Modifier.align(Alignment.Center),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            Icons.Default.CameraAlt,
                            contentDescription = "No cameras",
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "No cameras available",
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
                        item {
                            AnalyticsSummary(cameras = cameras)
                        }
                        
                        items(cameras) { camera ->
                            CameraCard(camera = camera)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ConnectionStatusBar(connectionState: com.example.andoidappcrowd.data.websocket.ConnectionState) {
    val (color, text) = when (connectionState) {
        com.example.andoidappcrowd.data.websocket.ConnectionState.CONNECTED -> 
            Color.Green to "Connected"
        com.example.andoidappcrowd.data.websocket.ConnectionState.CONNECTING -> 
            Color(0xFFFF9800) to "Connecting..."
        com.example.andoidappcrowd.data.websocket.ConnectionState.DISCONNECTED -> 
            Color.Gray to "Disconnected"
        com.example.andoidappcrowd.data.websocket.ConnectionState.ERROR -> 
            Color.Red to "Connection Error"
    }
    
    Surface(
        color = color.copy(alpha = 0.1f),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .background(color, shape = MaterialTheme.shapes.small)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "WebSocket: $text",
                    style = MaterialTheme.typography.bodySmall,
                    color = color
                )
            }
        }
    }
}

@Composable
fun AnalyticsSummary(cameras: List<Camera>) {
    val activeCameras = cameras.count { it.status == "online" }
    val totalPeople = cameras.sumOf { it.peopleCount }
    val highRiskCameras = cameras.count { it.riskLevel == "high" }
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Live Overview",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                StatItem(
                    label = "Active Cameras",
                    value = activeCameras.toString(),
                    color = MaterialTheme.colorScheme.primary
                )
                
                StatItem(
                    label = "Total People",
                    value = totalPeople.toString(),
                    color = MaterialTheme.colorScheme.secondary
                )
                
                StatItem(
                    label = "High Risk",
                    value = highRiskCameras.toString(),
                    color = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}

@Composable
fun StatItem(label: String, value: String, color: Color) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = value,
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            color = color
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
fun CameraCard(camera: Camera) {
    val (statusColor, statusText) = when (camera.status.lowercase()) {
        "online" -> Color.Green to "Online"
        "offline" -> Color.Gray to "Offline"
        "error" -> Color.Red to "Error"
        else -> Color.Gray to "Unknown"
    }
    
    val (riskColor, riskText) = when (camera.riskLevel.lowercase()) {
        "high" -> Color.Red to "High"
        "medium" -> Color(0xFFFF9800) to "Medium"
        "low" -> Color.Green to "Low"
        else -> Color.Gray to "Unknown"
    }
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
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
                        text = camera.name,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.LocationOn,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = camera.location,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                
                Row {
                    StatusBadge(color = statusColor, text = statusText)
                    Spacer(modifier = Modifier.width(8.dp))
                    StatusBadge(color = riskColor, text = riskText)
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "People Count",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = camera.peopleCount.toString(),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
                
                Column {
                    Text(
                        text = "Coverage",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "${camera.coverageRadius}m",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
                
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "Coordinates",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "${camera.latitude.take(6)}, ${camera.longitude.take(6)}",
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }
        }
    }
}

@Composable
fun StatusBadge(color: Color, text: String) {
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
