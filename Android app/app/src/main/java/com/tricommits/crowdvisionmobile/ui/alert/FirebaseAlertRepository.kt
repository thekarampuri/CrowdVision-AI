package com.tricommits.crowdvisionmobile.ui.alert

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.google.firebase.Timestamp
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.QuerySnapshot

class FirebaseAlertRepository {

    private val firestore = FirebaseFirestore.getInstance()
    private val alertsCollection = firestore.collection("alerts")

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
                val riskLevel = doc.getString("severity")
                val message = doc.getString("description")

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

                if (cameraName != null && riskLevel != null && timestamp != null && appStatus != null && latitude != null && longitude != null) {
                    Alert(
                        id = alertId,
                        cameraName = cameraName,
                        riskLevel = riskLevel,
                        timestamp = timestamp,
                        status = appStatus,
                        message = message,
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
}
