
package com.tricommits.crowdvisionmobile.ui.alert

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import com.tricommits.crowdvisionmobile.R
import com.tricommits.crowdvisionmobile.ui.theme.CrowdVisionMobileTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AlertListScreen(onAlertClick: (Alert) -> Unit) {
    val alerts = listOf(
        Alert("1", "Entrance Cam", "CRITICAL", "2024-09-15 10:30:00", "PENDING", "High crowd density detected.", 40.7128, -74.0060),
        Alert("2", "Main Hall Cam", "WARNING", "2024-09-15 10:28:00", "PENDING", "Unusual crowd formation detected.", 34.0522, -118.2437),
        Alert("3", "Exit Cam", "SAFE", "2024-09-15 10:25:00", "COMPLETED", "Crowd flow is normal.", 51.5074, -0.1278),
    )

    Box {
        Image(
            painter = painterResource(id = R.drawable.ic_launcher_background),
            contentDescription = null,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Column {
                            Text(text = "CrowdVision Alerts")
                            Text(text = "Real-time Crowd Risk Updates", style = MaterialTheme.typography.bodySmall)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color.Transparent,
                        titleContentColor = Color.Black
                    )
                )
            },
            containerColor = Color.Transparent
        ) { paddingValues ->
            LazyColumn(modifier = Modifier.padding(paddingValues)) {
                items(alerts) { alert ->
                    AlertItem(
                        alert = alert,
                        onClick = { onAlertClick(alert) }
                    )
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun AlertListScreenPreview() {
    CrowdVisionMobileTheme {
        AlertListScreen(onAlertClick = {})
    }
}
