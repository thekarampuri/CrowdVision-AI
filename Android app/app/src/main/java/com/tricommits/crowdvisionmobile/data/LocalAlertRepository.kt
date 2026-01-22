package com.tricommits.crowdvisionmobile.data

import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.util.ArrayList

/**
 * Data model for an Alert.
 */
data class Alert(
    val alertId: String,
    val cameraName: String,
    val latitude: Double,
    val longitude: Double,
    val riskLevel: String,
    val message: String,
    val timestamp: Long,
    var status: String // "PENDING" or "COMPLETED"
)

/**
 * Repository to manage alerts locally in-memory.
 * Simulates backend behavior.
 */
class LocalAlertRepository private constructor() {

    // In-memory storage
    private val alerts = ArrayList<Alert>()
    
    // Mutex for thread safety
    private val mutex = Mutex()

    /**
     * Get all active alerts (status == PENDING).
     */
    suspend fun getActiveAlerts(): List<Alert> = mutex.withLock {
        alerts.filter { it.status == "PENDING" }
    }

    /**
     * Get the full history of alerts.
     */
    suspend fun getAlertHistory(): List<Alert> = mutex.withLock {
        // Return a copy to avoid modification issues
        ArrayList(alerts)
    }

    /**
     * Mark an alert as COMPLETED by its ID.
     */
    suspend fun markAlertCompleted(alertId: String) = mutex.withLock {
        val index = alerts.indexOfFirst { it.alertId == alertId }
        if (index != -1) {
            val alert = alerts[index]
            // Update the status
            alerts[index] = alert.copy(status = "COMPLETED")
        }
    }

    /**
     * Add a new alert to the repository.
     */
    suspend fun addAlert(alert: Alert) = mutex.withLock {
        alerts.add(alert)
    }

    companion object {
        @Volatile
        private var INSTANCE: LocalAlertRepository? = null

        fun getInstance(): LocalAlertRepository {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: LocalAlertRepository().also { INSTANCE = it }
            }
        }
    }
}
