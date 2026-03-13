package com.tricommits.crowdvisionmobile.ui.alert

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.google.firebase.Timestamp
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.QuerySnapshot
import com.tricommits.crowdvisionmobile.data.MetricsRepository

class FirebaseAlertRepository {

    private val firestore = FirebaseFirestore.getInstance()
    private val alertsCollection = firestore.collection("high_risk_alerts")
    private val metricsRepository = MetricsRepository()

    fun getAlerts(): LiveData<List<Alert>> {
        val alerts = MutableLiveData<List<Alert>>(emptyList())
        alertsCollection.addSnapshotListener { snapshot, e ->
            if (e != null) {
                Log.w("FirebaseAlertRepository", "Listen failed.", e)
                alerts.value = emptyList()
                return@addSnapshotListener
            }

            if (snapshot != null && !snapshot.isEmpty) {
                alerts.value = snapshot.toAlerts()
            } else {
                alerts.value = emptyList()
            }
        }
        return alerts
    }

    private fun QuerySnapshot.toAlerts(): List<Alert> {
        return documents.mapNotNull { doc ->
            try {
                val alertId = doc.id
                val cameraName = doc.getString("cameraName")
                val severity = doc.getString("severity")
                val description = doc.getString("description")
                val latitude = (doc.get("latitude") as? Number)?.toDouble()
                val longitude = (doc.get("longitude") as? Number)?.toDouble()

                val timestampData = doc.get("timestamp")
                val timestamp: String? = when (timestampData) {
                    is Timestamp -> timestampData.toDate().toString()
                    is String -> timestampData
                    is Long -> timestampData.toString()
                    else -> null
                }

                val statusFromFirestore = doc.getString("status")
                val appStatus = when (statusFromFirestore) {
                    "active" -> "PENDING"
                    "resolved" -> "COMPLETED"
                    else -> statusFromFirestore
                }

                if (cameraName != null && severity != null && timestamp != null && appStatus != null && latitude != null && longitude != null) {
                    Alert(
                        id = alertId,
                        cameraName = cameraName,
                        severity = severity,
                        timestamp = timestamp,
                        status = appStatus,
                        description = description,
                        latitude = latitude,
                        longitude = longitude
                    )
                } else {
                    null
                }
            } catch (e: Exception) {
                null
            }
        }
    }

    fun updateAlertStatus(alertId: String, status: String) {
        val firestoreStatus = if (status == "COMPLETED") "resolved" else status
        alertsCollection.document(alertId).update("status", firestoreStatus)
            .addOnSuccessListener { Log.d("FirebaseAlertRepository", "Alert status updated for $alertId") }
    }

    fun deleteAlert(alertId: String) {
        alertsCollection.document(alertId).delete()
    }

    fun listenForNewAlerts(onNewAlert: (Alert) -> Unit) {
        alertsCollection.whereEqualTo("status", "active")
            .addSnapshotListener { snapshot, e ->
                if (e != null || snapshot == null) return@addSnapshotListener

                for (dc in snapshot.documentChanges) {
                    if (dc.type == com.google.firebase.firestore.DocumentChange.Type.ADDED) {
                        val alertId = dc.document.id
                        
                        // [NEW] Trigger RTDB metric tracking for NEW alerts
                        metricsRepository.recordCreation(alertId)

                        val timestampData = dc.document.get("timestamp")
                        val timestamp = when (timestampData) {
                            is Timestamp -> timestampData
                            else -> null
                        }

                        if (timestamp != null) {
                            val now = Timestamp.now()
                            val diff = now.seconds - timestamp.seconds
                            if (diff < 60) {
                                val alert = Alert(
                                    id = alertId,
                                    cameraName = dc.document.getString("cameraName") ?: "Camera",
                                    severity = dc.document.getString("severity") ?: "critical",
                                    timestamp = timestamp.toDate().toString(),
                                    status = "PENDING",
                                    description = dc.document.getString("description"),
                                    latitude = (dc.document.get("latitude") as? Number)?.toDouble() ?: 0.0,
                                    longitude = (dc.document.get("longitude") as? Number)?.toDouble() ?: 0.0
                                )
                                onNewAlert(alert)
                            }
                        }
                    }
                }
            }
    }
}
