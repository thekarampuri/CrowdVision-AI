package com.example.andoidappcrowd.data.model

import com.google.firebase.Timestamp
import com.google.firebase.firestore.DocumentId

data class Alert(
    @DocumentId
    val id: String = "",
    val title: String = "",
    val description: String = "",
    val status: String = "active", // active, acknowledged, resolved
    val severity: String = "info", // critical, warning, info
    val timestamp: Timestamp = Timestamp.now(),
    val cameraId: String = "",
    val cameraName: String = "",
    val peopleCount: Int = 0,
    val latitude: Double = 0.0,
    val longitude: Double = 0.0
)
