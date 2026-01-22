package com.example.andoidappcrowd.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.andoidappcrowd.data.model.Alert
import com.example.andoidappcrowd.ui.components.GlassBackground
import com.example.andoidappcrowd.ui.components.GlassCard
import com.example.andoidappcrowd.viewmodel.AlertViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun AlertListScreen(
    viewModel: AlertViewModel,
    onAlertClick: (String) -> Unit
) {
    val alerts by viewModel.activeAlerts.collectAsState()

    GlassBackground {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
                .statusBarsPadding()
        ) {
            Text(
                text = "Active Alerts",
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                modifier = Modifier.padding(bottom = 24.dp)
            )

            if (alerts.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text("No active alerts", color = Color.White.copy(alpha = 0.6f))
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(alerts) { alert ->
                        AlertItem(alert = alert) {
                            onAlertClick(alert.id)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AlertItem(alert: Alert, onClick: () -> Unit) {
    val sdf = SimpleDateFormat("HH:mm, dd MMM", Locale.getDefault())
    val date = alert.timestamp.toDate()
    
    val severityColor = when (alert.severity) {
        "critical" -> Color(0xFFEF4444)
        "warning" -> Color(0xFFFBBF24)
        else -> Color(0xFF3B82F6)
    }

    GlassCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(4.dp, 40.dp)
                    .background(severityColor, MaterialTheme.shapes.small)
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Column {
                Text(
                    text = alert.title,
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp
                )
                Text(
                    text = alert.cameraName,
                    color = Color.White.copy(alpha = 0.7f),
                    fontSize = 14.sp
                )
                Text(
                    text = sdf.format(date),
                    color = Color.White.copy(alpha = 0.5f),
                    fontSize = 12.sp
                )
            }
            
            Spacer(modifier = Modifier.weight(1f))
            
            Icon(
                imageVector = Icons.Default.Warning,
                contentDescription = null,
                tint = severityColor,
                modifier = Modifier.size(24.dp)
            )
        }
    }
}
