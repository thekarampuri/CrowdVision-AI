package com.tricommits.crowdvisionmobile.ui.alert

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.google.firebase.Timestamp
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.QuerySnapshot

class FirebaseAlertRepository {

    private val firestore = FirebaseFirestore.getInstance()
    private val alertsCollection = firestore.collection("high_risk_alerts")

    fun getAlerts(): LiveData<List<Alert>> {
        val alerts = MutableLiveData<List<Alert>>(emptyList()) // Initialize with empty list
        alertsCollection.addSnapshotListener { snapshot, e ->
            if (e != null) {
                Log.w("FirebaseAlertRepository", "Listen failed.", e)
                alerts.value = emptyList() // Post empty list on error
                return@addSnapshotListener
            }

            if (snapshot != null && !snapshot.isEmpty) {
                alerts.value = snapshot.toAlerts()
            } else {
                alerts.value = emptyList() // Post empty list for empty snapshot
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

                // Robustly get latitude and longitude, which might be stored as Long or Double
                val latitude = (doc.get("latitude") as? Number)?.toDouble()
                val longitude = (doc.get("longitude") as? Number)?.toDouble()

                // Robust timestamp handling
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
                    else -> statusFromFirestore // Fallback for other statuses
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
                    Log.w("FirebaseAlertRepository", "Skipping document ${doc.id} due to missing or invalid fields.")
                    null
                }
            } catch (e: Exception) {
                Log.e("FirebaseAlertRepository", "Error converting document ${doc.id} to Alert", e)
                null
            }
        }
    }

    fun updateAlertStatus(alertId: String, status: String) {
        val firestoreStatus = if (status == "COMPLETED") "resolved" else status
        alertsCollection.document(alertId).update("status", firestoreStatus)
            .addOnSuccessListener { Log.d("FirebaseAlertRepository", "Alert status updated for $alertId") }
            .addOnFailureListener { e -> Log.w("FirebaseAlertRepository", "Error updating alert status for $alertId", e) }
    }

    fun deleteAlert(alertId: String) {
        alertsCollection.document(alertId).delete()
            .addOnSuccessListener { Log.d("FirebaseAlertRepository", "Alert deleted: $alertId") }
            .addOnFailureListener { e -> Log.w("FirebaseAlertRepository", "Error deleting alert: $alertId", e) }
    }

    fun listenForNewAlerts(onNewAlert: (Alert) -> Unit) {
        alertsCollection.whereEqualTo("status", "active")
            .addSnapshotListener { snapshot, e ->
                if (e != null) {
                    Log.w("FirebaseAlertRepository", "Listen failed.", e)
                    return@addSnapshotListener
                }

                if (snapshot != null) {
                    for (dc in snapshot.documentChanges) {
                        if (dc.type == com.google.firebase.firestore.DocumentChange.Type.ADDED) {
                            // Check if the alert is recent (e.g., created within the last 60 seconds)
                            // to avoid notifying for old alerts on app startup
                            val timestampData = dc.document.get("timestamp")
                            val timestamp = when (timestampData) {
                                is Timestamp -> timestampData
                                else -> null
                            }

                            if (timestamp != null) {
                                val now = Timestamp.now()
                                val diff = now.seconds - timestamp.seconds
                                // Only notify if less than 60 seconds old
                                if (diff < 60) {
                                    val alertId = dc.document.id
                                    val cameraName = dc.document.getString("cameraName") ?: "Camera"
                                    val severity = dc.document.getString("severity") ?: "critical"
                                    val description = dc.document.getString("description")

                                    // Construct a minimal Alert object for notification
                                    // Note: lat/long/etc are not needed for simple notification title/body
                                    val alert = Alert(
                                        id = alertId,
                                        cameraName = cameraName,
                                        severity = severity,
                                        timestamp = timestamp.toDate().toString(),
                                        status = "PENDING",
                                        description = description,
                                        latitude = 0.0,
                                        longitude = 0.0
                                    )
                                    onNewAlert(alert)
                                }
                            }
                        }
                    }
                }
            }
    }
}
