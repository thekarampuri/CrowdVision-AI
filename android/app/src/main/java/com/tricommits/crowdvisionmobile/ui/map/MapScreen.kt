
package com.tricommits.crowdvisionmobile.ui.map

import android.annotation.SuppressLint
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.tricommits.crowdvisionmobile.ui.alert.Alert
import com.tricommits.crowdvisionmobile.ui.alert.RiskLevelBadge
import com.tricommits.crowdvisionmobile.ui.alert.StatusBadge
import com.tricommits.crowdvisionmobile.ui.theme.CrowdVisionMobileTheme

@OptIn(ExperimentalMaterial3Api::class)
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun MapScreen(
    alert: Alert,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    
    // Encode parameters to handle spaces and special characters safely
    val encodedName = java.net.URLEncoder.encode(alert.cameraName, "UTF-8").replace("+", "%20")
    val encodedRisk = java.net.URLEncoder.encode(alert.severity, "UTF-8").replace("+", "%20")
    
    val url = "file:///android_asset/leaflet_map.html?lat=${alert.latitude}&lng=${alert.longitude}&zoom=15&name=$encodedName&risk=$encodedRisk"

    val webView = remember {
        WebView(context).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.allowFileAccess = true
            // Critical for loading local css/js files referenced in the HTML
            settings.allowFileAccessFromFileURLs = true
            settings.allowUniversalAccessFromFileURLs = true
            
            // Fix: Set layout params to ensure WebView takes up space
            layoutParams = android.view.ViewGroup.LayoutParams(
                android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                android.view.ViewGroup.LayoutParams.MATCH_PARENT
            )

            // Fix: Set a standard User-Agent to avoid being blocked by OSM tile servers
            settings.userAgentString = "Mozilla/5.0 (Linux; Android 10; Mobile; rv:88.0) Gecko/88.0 Firefox/88.0"

            // Enable detailed console logging
            webChromeClient = object : android.webkit.WebChromeClient() {
                override fun onConsoleMessage(consoleMessage: android.webkit.ConsoleMessage): Boolean {
                    android.util.Log.d("WebViewConsole", "${consoleMessage.message()} -- From line ${consoleMessage.lineNumber()} of ${consoleMessage.sourceId()}")
                    return true
                }
            }
            
            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    android.util.Log.d("WebViewStatus", "Page loaded: $url")
                }
                
                override fun onReceivedError(view: WebView?, request: android.webkit.WebResourceRequest?, error: android.webkit.WebResourceError?) {
                    super.onReceivedError(view, request, error)
                    android.util.Log.e("WebViewError", "Error loading ${request?.url}: ${error?.description}")
                }
            }
            loadUrl(url)
            // loadUrl("file:///android_asset/debug.html") // Uncomment to test basic WebView functionality
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Column {
                        Text("Camera Location")
                        Text("Live Alert Location", style = MaterialTheme.typography.bodySmall)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .padding(paddingValues)
                .fillMaxSize()
        ) {
            // WebView with Leaflet map
            AndroidView(
                factory = { webView },
                modifier = Modifier.fillMaxSize()
            )

            // Stats Card in the top left corner (Floating overlay)
            val stats by viewModel.globalStats.observeAsState(SOSMetrics())
            
            Column(
                modifier = Modifier
                    .padding(16.dp)
                    .width(180.dp)
                    .align(Alignment.TopStart)
            ) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xCC000000)), // Semi-transparent black
                    elevation = CardDefaults.cardElevation(defaultElevation = 10.dp),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text("Performance Metrics", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        Divider(color = Color.White.copy(alpha = 0.1f))
                        
                        AverageMetricItem("Avg. Assign", formatDuration(stats.avgTimeToAssign))
                        AverageMetricItem("Avg. Reach", formatDuration(stats.avgTimeToReach))
                        AverageMetricItem("Avg. Resolve", formatDuration(stats.avgTotalResolveTime))
                    }
                }
            }

            // Floating UI elements (FABs)
                    FloatingActionButton(
                        onClick = { webView.evaluateJavascript("zoomIn()", null) },
                        shape = CircleShape,
                        modifier = Modifier.size(48.dp)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = "Zoom In")
                    }
                    Spacer(modifier = Modifier.padding(8.dp))
                    FloatingActionButton(
                        onClick = { webView.evaluateJavascript("zoomOut()", null) },
                        shape = CircleShape,
                        modifier = Modifier.size(48.dp)
                    ) {
                        Icon(Icons.Default.Remove, contentDescription = "Zoom Out")
                    }
                    Spacer(modifier = Modifier.padding(8.dp))
                    FloatingActionButton(
                        onClick = { webView.evaluateJavascript("centerMap(${alert.latitude}, ${alert.longitude})", null) },
                        shape = CircleShape,
                        modifier = Modifier.size(48.dp)
                    ) {
                        Icon(Icons.Default.MyLocation, contentDescription = "Center Map")
                    }
                }

                // Info Card at the bottom
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = alert.cameraName,
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp
                        )
                        Spacer(modifier = Modifier.padding(4.dp))
                        Row {
                            RiskLevelBadge(riskLevel = alert.severity)
                            Spacer(modifier = Modifier.width(8.dp))
                            StatusBadge(status = alert.status)
                        }
                        Spacer(modifier = Modifier.padding(4.dp))
                        Text(
                            text = "${alert.latitude}, ${alert.longitude}",
                            fontSize = 12.sp,
                            color = Color.Gray
                        )
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun MapScreenPreview() {
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
        MapScreen(alert = sampleAlert, onBack = {})
    }
}
