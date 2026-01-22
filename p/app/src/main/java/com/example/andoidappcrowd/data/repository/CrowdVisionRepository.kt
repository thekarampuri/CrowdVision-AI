package com.example.andoidappcrowd.data.repository

import com.example.andoidappcrowd.data.api.CrowdVisionApi
import com.example.andoidappcrowd.data.model.*
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import javax.inject.Singleton

@Singleton
class CrowdVisionRepository(
    private val api: CrowdVisionApi,
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore
) {
    
    // Authentication
    suspend fun signIn(email: String, password: String): Result<FirebaseUser> {
        return try {
            val result = auth.signInWithEmailAndPassword(email, password).await()
            Result.success(result.user!!)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun signUp(email: String, password: String, displayName: String): Result<FirebaseUser> {
        return try {
            val result = auth.createUserWithEmailAndPassword(email, password).await()
            val user = result.user!!
            
            // Update user profile
            val profileUpdates = com.google.firebase.auth.UserProfileChangeRequest.Builder()
                .setDisplayName(displayName)
                .build()
            user.updateProfile(profileUpdates).await()
            
            // Save user data to Firestore
            saveUserToFirestore(user.uid, email, displayName)
            
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun signOut() {
        auth.signOut()
    }
    
    fun getCurrentUser(): FirebaseUser? = auth.currentUser
    
    private suspend fun saveUserToFirestore(uid: String, email: String, displayName: String) {
        val user = User(
            uid = uid,
            email = email,
            displayName = displayName,
            role = "user",
            isActive = true,
            createdAt = System.currentTimeMillis(),
            lastLoginAt = System.currentTimeMillis()
        )
        firestore.collection("users").document(uid).set(user).await()
    }
    
    // Alerts
    suspend fun getAlerts(): Result<List<Alert>> {
        return try {
            val response = api.getAlerts()
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                Result.failure(Exception("Failed to fetch alerts: ${response.code()}"))
            }
        } catch (e: Exception) {
            // Fallback to Firestore
            getAlertsFromFirestore()
        }
    }
    
    private suspend fun getAlertsFromFirestore(): Result<List<Alert>> {
        return try {
            val snapshot = firestore.collection("alerts")
                .orderBy("timestamp", Query.Direction.DESCENDING)
                .get()
                .await()
            val alerts = snapshot.toObjects(Alert::class.java)
            Result.success(alerts)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun acknowledgeAlert(alertId: String): Result<Alert> {
        return try {
            val response = api.acknowledgeAlert(alertId)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                // Update in Firestore
                acknowledgeAlertInFirestore(alertId)
            }
        } catch (e: Exception) {
            acknowledgeAlertInFirestore(alertId)
        }
    }
    
    private suspend fun acknowledgeAlertInFirestore(alertId: String): Result<Alert> {
        return try {
            val currentUser = getCurrentUser()
            firestore.collection("alerts").document(alertId)
                .update(
                    mapOf(
                        "status" to "acknowledged",
                        "acknowledgedBy" to currentUser?.uid,
                        "acknowledgedAt" to System.currentTimeMillis()
                    )
                ).await()
            
            // Get updated alert
            val alertDoc = firestore.collection("alerts").document(alertId).get().await()
            Result.success(alertDoc.toObject(Alert::class.java)!!)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Cameras
    suspend fun getCameras(): Result<List<Camera>> {
        return try {
            val response = api.getCameras()
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                getCamerasFromFirestore()
            }
        } catch (e: Exception) {
            getCamerasFromFirestore()
        }
    }
    
    private suspend fun getCamerasFromFirestore(): Result<List<Camera>> {
        return try {
            val snapshot = firestore.collection("cameras").get().await()
            val cameras = snapshot.toObjects(Camera::class.java)
            Result.success(cameras)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Analytics
    suspend fun getAnalytics(timeRange: String = "24h"): Result<Analytics> {
        return try {
            val response = api.getAnalytics(timeRange)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                getAnalyticsFromFirestore()
            }
        } catch (e: Exception) {
            getAnalyticsFromFirestore()
        }
    }
    
    private suspend fun getAnalyticsFromFirestore(): Result<Analytics> {
        return try {
            val camerasSnapshot = firestore.collection("cameras").get().await()
            val alertsSnapshot = firestore.collection("alerts")
                .whereGreaterThan("timestamp", System.currentTimeMillis() - 24 * 60 * 60 * 1000)
                .get().await()
            
            val cameras = camerasSnapshot.toObjects(Camera::class.java)
            val alerts = alertsSnapshot.toObjects(Alert::class.java)
            
            val analytics = Analytics(
                totalPeopleCount = cameras.sumOf { it.peopleCount },
                activeCameras = cameras.count { it.status == "online" },
                highRiskCameras = cameras.count { it.riskLevel == "high" },
                alertsCount = alerts.size,
                timestamp = System.currentTimeMillis()
            )
            
            Result.success(analytics)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Real-time updates
    fun getAlertsFlow(): Flow<List<Alert>> = callbackFlow {
        val listener = firestore.collection("alerts")
            .orderBy("timestamp", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                
                val alerts = snapshot?.toObjects(Alert::class.java) ?: emptyList()
                trySend(alerts)
            }
        
        awaitClose { listener.remove() }
    }
    
    fun getCamerasFlow(): Flow<List<Camera>> = callbackFlow {
        val listener = firestore.collection("cameras")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSNapshotListener
                }
                
                val cameras = snapshot?.toObjects(Camera::class.java) ?: emptyList()
                trySend(cameras)
            }
        
        awaitClose { listener.remove() }
    }
}