
package com.tricommits.crowdvisionmobile.ui.alert

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.tricommits.crowdvisionmobile.ui.theme.*
import com.tricommits.crowdvisionmobile.viewmodel.AlertViewModel

@Composable
fun AlertListScreen(
    viewModel: AlertViewModel,
    onAlertClick: (Alert) -> Unit,
    onHistoryClick: () -> Unit
) {
    val activeAlerts by viewModel.activeAlerts.observeAsState(emptyList())

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(BgGradientStart, BgGradientEnd)
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp)
        ) {
            // Custom Header
            Spacer(modifier = Modifier.height(48.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Menu, // Or a grid icon looks closer to "::"
                    contentDescription = "Menu",
                    tint = TextWhite,
                    modifier = Modifier.size(28.dp)
                )
                Icon(
                    imageVector = Icons.Default.Search,
                    contentDescription = "Search",
                    tint = TextWhite,
                    modifier = Modifier.size(28.dp)
                )
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Text(
                text = "CrowdVision AI",
                color = TextWhiteSecondary,
                fontSize = 16.sp
            )
            Text(
                text = "Live Monitoring",
                color = TextWhite,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Summary Card (The "Unlimited Storage" equivalent)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
                    .clip(RoundedCornerShape(32.dp))
                    .background(
                        brush = Brush.linearGradient(
                            colors = listOf(VioletSoft.copy(alpha=0.2f), VioletDeep.copy(alpha=0.5f))
                        )
                    )
                    .border(
                        width = 1.dp,
                        color = GlassWhite,
                        shape = RoundedCornerShape(32.dp)
                    )
            ) {
                // Decor elements (blobs) could go here
                
                Column(
                    modifier = Modifier
                        .padding(24.dp)
                        .fillMaxSize()
                ) {
                    Text(
                        text = "System Status",
                        color = TextWhite,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "${activeAlerts.size} Active Alerts",
                        color = TextWhiteSecondary,
                        fontSize = 14.sp
                    )
                    
                    Spacer(modifier = Modifier.weight(1f))
                    
                    Button(
                        onClick = onHistoryClick,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = AccentYellow
                        ),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.wrapContentWidth()
                    ) {
                        Text(
                            text = "View History",
                            color = Color.Black,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // List Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Recent Alerts",
                    color = TextWhite,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
                TextButton(onClick = { /* View All */ }) {
                    Text(
                        text = "View all",
                        color = TextWhiteSecondary,
                        fontSize = 14.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Alerts List
            LazyColumn(
                contentPadding = PaddingValues(bottom = 24.dp)
            ) {
                items(activeAlerts) { alert ->
                    AlertItem(
                        alert = alert,
                        onClick = { onAlertClick(alert) }
                    )
                }
            }
        }
    }
}

@Preview
@Composable
fun AlertListScreenPreview() {
    CrowdVisionMobileTheme {
        AlertListScreen(
            viewModel = viewModel<AlertViewModel>(),
            onAlertClick = {},
            onHistoryClick = {}
        )
    }
}
