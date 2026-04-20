package com.tricommits.crowdvisionmobile.data

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener

data class SOSMetrics(
    val avgTimeToAssign: Long = 0,
    val avgTimeToReach: Long = 0,
    val avgTotalResolveTime: Long = 0,
    val completedCount: Int = 0
)

class MetricsRepository {

    // Fix: Explicitly providing the database URL to avoid issues with spaces in the project name/ID from google-services.json
    private val database = FirebaseDatabase.getInstance("https://ai-based-crowd-watcher-for-7e13f-default-rtdb.firebaseio.com/")
    private val activeMetricsRef = database.getReference("sos_metrics/active")
    private val analyticsRef = database.getReference("sos_metrics/analytics")
    private val globalStatsRef = database.getReference("sos_metrics/global_stats")

    fun recordCreation(alertId: String) {
        activeMetricsRef.child(alertId).child("createdAt").setValue(System.currentTimeMillis())
    }

    fun recordAssignment(alertId: String, rescuerId: String) {
        val now = System.currentTimeMillis()
        activeMetricsRef.child(alertId).apply {
            child("assignedAt").setValue(now)
            child("assignedRescuer").setValue(rescuerId)
        }
    }

    fun recordReach(alertId: String) {
        activeMetricsRef.child(alertId).child("reachedAt").setValue(System.currentTimeMillis())
    }

    fun finalizeMetrics(alertId: String, resolvedAt: Long) {
        activeMetricsRef.child(alertId).get().addOnSuccessListener { snapshot ->
            if (snapshot.exists()) {
                val createdAt = snapshot.child("createdAt").getValue(Long::class.java) ?: 0L
                val assignedAt = snapshot.child("assignedAt").getValue(Long::class.java) ?: 0L
                val reachedAt = snapshot.child("reachedAt").getValue(Long::class.java) ?: 0L

                val timeToAssign = if (assignedAt > 0) assignedAt - createdAt else 0
                val timeToReach = if (reachedAt > 0 && assignedAt > 0) reachedAt - assignedAt else 0
                val totalTime = resolvedAt - createdAt

                val finalMetrics = mapOf(
                    "createdAt" to createdAt,
                    "assignedAt" to assignedAt,
                    "reachedAt" to reachedAt,
                    "resolvedAt" to resolvedAt,
                    "timeToAssign" to timeToAssign,
                    "timeToReach" to timeToReach,
                    "totalResponseTime" to totalTime
                )

                // Archive to analytics
                analyticsRef.child(alertId).setValue(finalMetrics)
                
                // Update global averages
                updateGlobalAverages(timeToAssign, timeToReach, totalTime)
                
                // Remove from active
                activeMetricsRef.child(alertId).removeValue()
            }
        }
    }

    private fun updateGlobalAverages(assign: Long, reach: Long, total: Long) {
        globalStatsRef.get().addOnSuccessListener { snapshot ->
            val count = snapshot.child("completedCount").getValue(Int::class.java) ?: 0
            val currentAvgAssign = snapshot.child("avgTimeToAssign").getValue(Long::class.java) ?: 0L
            val currentAvgReach = snapshot.child("avgTimeToReach").getValue(Long::class.java) ?: 0L
            val currentAvgTotal = snapshot.child("avgTotalResolveTime").getValue(Long::class.java) ?: 0L

            val newCount = count + 1
            val newAvgAssign = ((currentAvgAssign * count) + assign) / newCount
            val newAvgReach = ((currentAvgReach * count) + reach) / newCount
            val newAvgTotal = ((currentAvgTotal * count) + total) / newCount

            globalStatsRef.setValue(SOSMetrics(newAvgAssign, newAvgReach, newAvgTotal, newCount))
        }
    }

    fun getGlobalStats(): LiveData<SOSMetrics> {
        val stats = MutableLiveData<SOSMetrics>()
        globalStatsRef.addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                stats.value = snapshot.getValue(SOSMetrics::class.java) ?: SOSMetrics()
            }

            override fun onCancelled(error: DatabaseError) {
                Log.w("MetricsRepository", "Failed to read stats", error.toException())
            }
        })
        return stats
    }
    
    fun getAlertMetrics(alertId: String, onUpdate: (Map<String, Any>) -> Unit) {
        activeMetricsRef.child(alertId).addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                if (snapshot.exists()) {
                    val data = snapshot.value as? Map<String, Any> ?: emptyMap()
                    onUpdate(data)
                }
            }
            override fun onCancelled(error: DatabaseError) {}
        })
    }
}
