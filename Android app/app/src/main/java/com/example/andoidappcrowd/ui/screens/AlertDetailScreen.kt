package com.example.andoidappcrowd.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
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
import com.example.andoidappcrowd.ui.components.GlassBackground
import com.example.andoidappcrowd.ui.components.GlassCard
import com.example.andoidappcrowd.viewmodel.AlertViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun AlertDetailScreen(
    alertId: String,
    viewModel: AlertViewModel,
    onBack: () -> Unit
) {
    val alerts by viewModel.activeAlerts.collectAsState()
    val alert = alerts.find { it.id == alertId }

    GlassBackground {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
                .statusBarsPadding()
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = null, tint = Color.White)
            }

            if (alert != null) {
                val sdf = SimpleDateFormat("HH:mm:ss, dd MMMM yyyy", Locale.getDefault())
                
                Text(
                    text = alert.title,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    modifier = Modifier.padding(vertical = 16.dp)
                )

                GlassCard(modifier = Modifier.fillMaxWidth()) {
                    DetailRow("Camera", alert.cameraName)
                    DetailRow("Location", "${alert.latitude}, ${alert.longitude}")
                    DetailRow("Time", sdf.format(alert.timestamp.toDate()))
                    DetailRow("People Count", alert.peopleCount.toString())
                    DetailRow("Severity", alert.severity.uppercase())
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Text(
                        text = "Description",
                        color = Color.White.copy(alpha = 0.6f),
                        fontSize = 14.sp
                    )
                    Text(
                        text = alert.description,
                        color = Color.White,
                        fontSize = 16.sp,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }

                Spacer(modifier = Modifier.weight(1f))

                Button(
                    onClick = { 
                        viewModel.updateStatus(alertId, "resolved")
                        onBack()
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF22C55E)
                    ),
                    shape = androidx.compose.foundation.shape.RoundedCornerShape(16.dp)
                ) {
                    Text("MARK AS COMPLETED", fontWeight = FontWeight.Bold)
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                if (alert.status == "active") {
                    OutlinedButton(
                        onClick = { 
                            viewModel.updateStatus(alertId, "acknowledged")
                            onBack()
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = Color.White
                        ),
                        shape = androidx.compose.foundation.shape.RoundedCornerShape(16.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.3f))
                    ) {
                        Text("ACKNOWLEDGE")
                    }
                }
            }
        }
    }
}

@Composable
fun DetailRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, color = Color.White.copy(alpha = 0.6f))
        Text(value, color = Color.White, fontWeight = FontWeight.Medium)
    }
}
