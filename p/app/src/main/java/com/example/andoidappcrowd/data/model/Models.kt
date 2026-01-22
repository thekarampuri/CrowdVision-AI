package com.example.andoidappcrowd.data.model

data class Alert(
    val id: String = "",
    val title: String = "",
    val description: String = "",
    val severity: String = "low", // low, medium, high
    val status: String = "active", // active, acknowledged, resolved
    val timestamp: Long = 0L,
    val cameraId: String = "",
    val location: String = "",
    val peopleCount: Int = 0,
    val acknowledgedBy: String? = null,
    val acknowledgedAt: Long? = null,
    val resolvedAt: Long? = null
)

data class Camera(
    val id: String = "",
    val name: String = "",
    val location: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val status: String = "online", // online, offline, error
    val peopleCount: Int = 0,
    val riskLevel: String = "low", // low, medium, high
    val coverageRadius: Int = 50,
    val lastUpdated: Long = 0L,
    val isActive: Boolean = true
)

data class CrowdDetection(
    val cameraId: String = "",
    val peopleCount: Int = 0,
    val confidence: Float = 0.0f,
    val timestamp: Long = 0L,
    val boundingBoxes: List<BoundingBox> = emptyList(),
    val riskLevel: String = "low"
)

data class BoundingBox(
    val x: Float = 0.0f,
    val y: Float = 0.0f,
    val width: Float = 0.0f,
    val height: Float = 0.0f,
    val confidence: Float = 0.0f
)

data class Analytics(
    val totalPeopleCount: Int = 0,
    val activeCameras: Int = 0,
    val highRiskCameras: Int = 0,
    val alertsCount: Int = 0,
    val timestamp: Long = 0L,
    val hourlyData: List<HourlyData> = emptyList()
)

data class HourlyData(
    val hour: String = "",
    val peopleCount: Int = 0,
    val alertsCount: Int = 0
)

data class User(
    val uid: String = "",
    val email: String = "",
    val displayName: String = "",
    val role: String = "user", // user, admin, operator
    val isActive: Boolean = true,
    val createdAt: Long = 0L,
    val lastLoginAt: Long = 0L
)