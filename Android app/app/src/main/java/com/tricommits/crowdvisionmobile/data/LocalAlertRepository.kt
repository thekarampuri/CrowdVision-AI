
package com.tricommits.crowdvisionmobile.data

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.tricommits.crowdvisionmobile.ui.alert.Alert

object LocalAlertRepository {

    private val sampleAlerts = mutableListOf(
        Alert("1", "Entrance Cam", "CRITICAL", "2024-09-15 10:30:00", "PENDING", "High crowd density detected.", 40.7128, -74.0060),
        Alert("2", "Main Hall Cam", "WARNING", "2024-09-15 10:28:00", "PENDING", "Unusual crowd formation detected.", 34.0522, -118.2437),
        Alert("3", "Exit Cam", "SAFE", "2024-09-15 10:25:00", "COMPLETED", "Crowd flow is normal.", 51.5074, -0.1278),
        Alert("4", "Plaza Cam", "CRITICAL", "2024-09-15 11:00:00", "PENDING", "Sudden surge in crowd numbers.", 48.8584, 2.2945),
        Alert("5", "West Wing", "COMPLETED", "2024-09-14 09:00:00", "COMPLETED", "All clear.", 35.6895, 139.6917)
    )

    private val alertsLiveData = MutableLiveData<List<Alert>>(sampleAlerts)

    fun getAlerts(): LiveData<List<Alert>> = alertsLiveData

    fun addAlert(alert: Alert) {
        synchronized(this) {
            val currentList = alertsLiveData.value?.toMutableList() ?: mutableListOf()
            currentList.add(0, alert) // Add to the top
            alertsLiveData.postValue(currentList)
        }
    }

    fun markAlertAsCompleted(alertId: String) {
        synchronized(this) {
            val currentList = alertsLiveData.value?.toMutableList() ?: return
            val alertIndex = currentList.indexOfFirst { it.id == alertId }
            if (alertIndex != -1) {
                val updatedAlert = currentList[alertIndex].copy(status = "COMPLETED")
                currentList[alertIndex] = updatedAlert
                alertsLiveData.postValue(currentList)
            }
        }
    }
}
