package com.example.andoidappcrowd.data.repository

import com.example.andoidappcrowd.data.model.Alert
import com.example.andoidappcrowd.data.model.Camera
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AlertRepository @Inject constructor(
    private val firestore: FirebaseFirestore
) {
    fun getActiveAlerts(): Flow<List<Alert>> = callbackFlow {
        val subscription = firestore.collection("high_risk_alerts")
            .whereIn("status", listOf("active", "acknowledged"))
            .orderBy("timestamp", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val alerts = snapshot?.toObjects(Alert::class.java) ?: emptyList()
                trySend(alerts)
            }
        awaitClose { subscription.remove() }
    }

    fun getAlertHistory(): Flow<List<Alert>> = callbackFlow {
        val subscription = firestore.collection("high_risk_alerts")
            .whereEqualTo("status", "resolved")
            .orderBy("timestamp", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val alerts = snapshot?.toObjects(Alert::class.java) ?: emptyList()
                trySend(alerts)
            }
        awaitClose { subscription.remove() }
    }

    fun getCameras(): Flow<List<Camera>> = callbackFlow {
        val subscription = firestore.collection("cameras")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val cameras = snapshot?.toObjects(Camera::class.java) ?: emptyList()
                trySend(cameras)
            }
        awaitClose { subscription.remove() }
    }

    fun updateAlertStatus(alertId: String, status: String) {
        firestore.collection("high_risk_alerts").document(alertId)
            .update("status", status)
    }
}
