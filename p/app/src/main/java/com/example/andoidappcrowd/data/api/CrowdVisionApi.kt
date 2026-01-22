package com.example.andoidappcrowd.data.api

import com.example.andoidappcrowd.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface CrowdVisionApi {
    
    @GET("api/alerts")
    suspend fun getAlerts(): Response<List<Alert>>
    
    @GET("api/alerts/{id}")
    suspend fun getAlert(@Path("id") id: String): Response<Alert>
    
    @POST("api/alerts/{id}/acknowledge")
    suspend fun acknowledgeAlert(@Path("id") id: String): Response<Alert>
    
    @POST("api/alerts/{id}/resolve")
    suspend fun resolveAlert(@Path("id") id: String): Response<Alert>
    
    @GET("api/cameras")
    suspend fun getCameras(): Response<List<Camera>>
    
    @GET("api/cameras/{id}")
    suspend fun getCamera(@Path("id") id: String): Response<Camera>
    
    @POST("api/cameras")
    suspend fun createCamera(@Body camera: Camera): Response<Camera>
    
    @PUT("api/cameras/{id}")
    suspend fun updateCamera(@Path("id") id: String, @Body camera: Camera): Response<Camera>
    
    @DELETE("api/cameras/{id}")
    suspend fun deleteCamera(@Path("id") id: String): Response<Unit>
    
    @POST("api/detect-crowd")
    suspend fun detectCrowd(@Body request: CrowdDetectionRequest): Response<CrowdDetection>
    
    @GET("api/analytics")
    suspend fun getAnalytics(
        @Query("timeRange") timeRange: String = "24h",
        @Query("cameraId") cameraId: String? = null
    ): Response<Analytics>
    
    @GET("api/analytics/hourly")
    suspend fun getHourlyAnalytics(
        @Query("timeRange") timeRange: String = "24h"
    ): Response<List<HourlyData>>
}

data class CrowdDetectionRequest(
    val cameraId: String,
    val imageData: String? = null, // Base64 encoded image
    val imageUrl: String? = null   // URL to image
)