package com.example.andoidappcrowd.ui.screens

import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.viewinterop.AndroidView
import com.example.andoidappcrowd.ui.components.GlassBackground
import com.example.andoidappcrowd.viewmodel.AlertViewModel
import com.google.gson.Gson

@Composable
fun MapScreen(viewModel: AlertViewModel) {
    val cameras by viewModel.cameras.collectAsState()
    val camerasJson = Gson().toJson(cameras)

    GlassBackground {
        Column(modifier = Modifier.fillMaxSize()) {
            AndroidView(
                factory = { context ->
                    WebView(context).apply {
                        settings.javaScriptEnabled = true
                        webViewClient = WebViewClient()
                        loadDataWithBaseURL(
                            "https://unpkg.com/",
                            getLeafletHtml(camerasJson),
                            "text/html",
                            "UTF-8",
                            null
                        )
                    }
                },
                update = { webView ->
                    webView.evaluateJavascript("updateCameras($camerasJson)", null)
                },
                modifier = Modifier.fillMaxSize()
            )
        }
    }
}

fun getLeafletHtml(initialCamerasJson: String): String {
    return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                body { margin: 0; padding: 0; background: #0F172A; }
                #map { height: 100vh; width: 100vw; background: #0F172A; }
                .custom-marker svg { drop-shadow(0 0 5px rgba(0,0,0,0.5)); }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                const map = L.map('map', { zoomControl: false }).setView([17.6599, 75.9064], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap'
                }).addTo(map);

                let markers = [];

                function updateCameras(cameras) {
                    markers.forEach(m => map.removeLayer(m));
                    markers = [];

                    cameras.forEach(cam => {
                        const color = cam.riskLevel === 'high' ? '#ef4444' : 
                                      (cam.riskLevel === 'medium' ? '#eab308' : '#22c55e');
                        
                        const icon = L.divIcon({
                            className: 'custom-marker',
                            html: `<svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                                     <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z" fill="${color}"/>
                                     <circle cx="16" cy="16" r="6" fill="white"/>
                                   </svg>`,
                            iconSize: [32, 42],
                            iconAnchor: [16, 42]
                        });

                        const marker = L.marker([cam.latitude, cam.longitude], { icon: icon })
                            .bindPopup(`<b>${cam.name}</b><br>People: ${cam.peopleCount}<br>Risk: ${cam.riskLevel}`)
                            .addTo(map);
                        markers.push(marker);
                    });
                }

                updateCameras($initialCamerasJson);
            </script>
        </body>
        </html>
    """.trimIndent()
}
