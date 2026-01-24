
package com.tricommits.crowdvisionmobile.ui.alert

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tricommits.crowdvisionmobile.ui.theme.*

@Composable
fun AlertItem(
    alert: Alert,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    showMessage: Boolean = false
) {
    // Glassmorphism Card
    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .clip(RoundedCornerShape(24.dp))
            .background(
                brush = Brush.linearGradient(
                    colors = listOf(GlassWhite, GlassSurface)
                )
            )
            .border(
                width = 1.dp,
                brush = Brush.linearGradient(
                    colors = listOf(Color.White.copy(alpha = 0.3f), Color.Transparent)
                ),
                shape = RoundedCornerShape(24.dp)
            )
            .clickable { onClick() }
            .padding(16.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Icon Container
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(
                        color = when(alert.severity) {
                            "CRITICAL" -> Color(0x33FF5252)
                            "WARNING" -> Color(0x33FFD740)
                            else -> Color(0x33448AFF)
                        }
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = getSeverityIcon(alert.severity),
                    contentDescription = null,
                    tint = when(alert.severity) {
                        "CRITICAL" -> Color(0xFFFF5252)
                        "WARNING" -> Color(0xFFFFD740)
                        else -> Color(0xFF448AFF)
                    },
                    modifier = Modifier.size(24.dp)
                )
            }

            // Text Content
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = alert.cameraName,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextWhite
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = alert.timestamp.split(" ")[1], // Just show time
                    fontSize = 12.sp,
                    color = TextWhiteSecondary
                )
                if (showMessage && alert.description != null) {
                   Spacer(modifier = Modifier.height(4.dp))
                   Text(
                       text = alert.description,
                       fontSize = 12.sp,
                       color = TextWhite.copy(alpha = 0.7f),
                       maxLines = 1,
                       overflow = TextOverflow.Ellipsis
                   )
                }
            }

            // Status Badge (Simplified)
            if (alert.status == "PENDING") {
                Box(
                    modifier = Modifier
                        .background(AccentOrange.copy(alpha = 0.2f), CircleShape)
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "!",
                        color = AccentOrange,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
            }
        }
    }
}

fun getSeverityIcon(severity: String): ImageVector {
    return when (severity) {
        "CRITICAL" -> Icons.Default.Warning
        "WARNING" -> Icons.Default.Warning
        else -> Icons.Default.Info
    }
}

@Preview
@Composable
fun AlertItemPreview() {
    CrowdVisionMobileTheme {
        Box(modifier = Modifier.background(VioletDeep).padding(16.dp)) {
            AlertItem(
                alert = Alert("1", "Main Entrance Cam", "CRITICAL", "2024-10-10 10:00:00", "PENDING", "Overcrowding detected", 0.0, 0.0),
                onClick = {},
                showMessage = true
            )
        }
    }
}
