package com.tricommits.crowdvisionmobile.ui.alert

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ktx.toObject

class FirebaseAlertRepository {

    private val firestore = FirebaseFirestore.getInstance()
    private val alertsCollection = firestore.collection("alerts")

    fun getAlerts(): LiveData<List<Alert>> {
        val alerts = MutableLiveData<List<Alert>>()
        alertsCollection.addSnapshotListener { snapshot, e ->
            if (e != null) {
                Log.w("FirebaseAlertRepository", "Listen failed.", e)
                return@addSnapshotListener
            }

            if (snapshot != null) {
                val alertList = mutableListOf<Alert>()
                for (doc in snapshot.documents) {
                    val alert = doc.toObject<Alert>()
                    if (alert != null) {
                        alertList.add(alert)
                    }
                }
                alerts.value = alertList
            }
        }
        return alerts
    }

    fun updateAlertStatus(alertId: String, status: String) {
        alertsCollection.document(alertId).update("status", status)
            .addOnSuccessListener { Log.d("FirebaseAlertRepository", "Alert status updated") }
            .addOnFailureListener { e -> Log.w("FirebaseAlertRepository", "Error updating alert status", e) }
    }
}
