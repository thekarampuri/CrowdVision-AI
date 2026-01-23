package com.tricommits.crowdvisionmobile.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.map
import com.tricommits.crowdvisionmobile.ui.alert.Alert
import com.tricommits.crowdvisionmobile.ui.alert.FirebaseAlertRepository

class AlertViewModel : ViewModel() {

    private val repository = FirebaseAlertRepository()

    val allAlerts: LiveData<List<Alert>> = repository.getAlerts()

    // Expose active alerts (PENDING)
    val activeAlerts: LiveData<List<Alert>> = allAlerts.map {
        alerts -> alerts.filter { it.status == "PENDING" }
    }

    // Expose history alerts (COMPLETED)
    val historyAlerts: LiveData<List<Alert>> = allAlerts.map {
        alerts -> alerts.filter { it.status == "COMPLETED" }
    }

    fun markAlertAsCompleted(alertId: String) {
        repository.updateAlertStatus(alertId, "COMPLETED")
    }

    fun getAlertById(alertId: String): Alert? {
        return allAlerts.value?.find { it.id == alertId }
    }
}
