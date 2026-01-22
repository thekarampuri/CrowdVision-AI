
package com.tricommits.crowdvisionmobile.ui.alert

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tricommits.crowdvisionmobile.ui.theme.CrowdVisionMobileTheme

@Composable
fun AlertItem(
    alert: Alert,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.5f))
    ) {
        Row(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = alert.cameraName,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = Color.Black
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = alert.timestamp,
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }
            Column(horizontalAlignment = Alignment.End) {
                RiskLevelBadge(riskLevel = alert.riskLevel)
                Spacer(modifier = Modifier.height(4.dp))
                StatusBadge(status = alert.status)
            }
        }
    }
}

@Composable
fun RiskLevelBadge(riskLevel: String) {
    val (backgroundColor, textColor) = when (riskLevel) {
        "SAFE" -> Color.Green to Color.White
        "WARNING" -> Color.Yellow to Color.Black
        "CRITICAL" -> Color.Red to Color.White
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
fun AlertItemPreview() {
    CrowdVisionMobileTheme {
        val sampleAlert = Alert("1", "Main Street Cam", "CRITICAL", "2024-09-15 10:30:00", "PENDING", "High crowd density detected.", 40.7128, -74.0060)
        AlertItem(
            alert = sampleAlert,
            onClick = {}
        )
    }
}
