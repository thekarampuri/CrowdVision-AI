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
                val alertId = doc.getString("alertId")
                val cameraName = doc.getString("cameraName")
                val riskLevel = doc.getString("riskLevel")
                
                // Robust timestamp handling
                val timestampData = doc.get("timestamp")
                val timestamp: String? = when (timestampData) {
                    is Timestamp -> timestampData.toDate().toString()
                    is String -> timestampData
                    is Long -> timestampData.toString()
                    else -> {
                        Log.w("FirebaseAlertRepository", "Unknown timestamp format for doc ${doc.id}: ${timestampData?.javaClass?.name}")
                        null
                    }
                }

                val status = doc.getString("status")
                val message = doc.getString("message")
                val latitude = doc.getDouble("latitude")
                val longitude = doc.getDouble("longitude")

                if (alertId != null && cameraName != null && riskLevel != null && timestamp != null && status != null && latitude != null && longitude != null) {
                    Alert(
                        id = alertId, // Firestore "alertId" maps to Alert "id"
                        cameraName = cameraName,
                        riskLevel = riskLevel,
                        timestamp = timestamp,
                        status = status,
                        message = message, // message can be null
                        latitude = latitude,
                        longitude = longitude
                    )
                } else {
                    Log.w("FirebaseAlertRepository", "Skipping document ${doc.id} due to missing fields.")
                    null
                }
            } catch (e: Exception) {
                Log.e("FirebaseAlertRepository", "Error converting document ${doc.id} to Alert", e)
                null
            }
        }
    }

    fun updateAlertStatus(alertId: String, status: String) {
        alertsCollection.document(alertId).update("status", status)
            .addOnSuccessListener { Log.d("FirebaseAlertRepository", "Alert status updated for $alertId") }
            .addOnFailureListener { e -> Log.w("FirebaseAlertRepository", "Error updating alert status for $alertId", e) }
    }
}
