package com.example.andoidappcrowd.data.model

import com.google.firebase.firestore.DocumentId

data class Camera(
    @DocumentId
    val id: String = "",
    val name: String = "",
    val location: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val radius: Int = 50,
    val peopleCount: Int = 0,
    val riskLevel: String = "low" // low, medium, high
)
