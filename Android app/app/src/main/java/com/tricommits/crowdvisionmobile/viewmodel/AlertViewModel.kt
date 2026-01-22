
package com.tricommits.crowdvisionmobile.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.map
import com.tricommits.crowdvisionmobile.data.LocalAlertRepository
import com.tricommits.crowdvisionmobile.ui.alert.Alert

class AlertViewModel : ViewModel() {

    private val repository = LocalAlertRepository

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
        repository.markAlertAsCompleted(alertId)
    }

    fun getAlertById(alertId: String): Alert? {
        return allAlerts.value?.find { it.id == alertId }
    }
    
    fun addAlert(alert: Alert) {
        repository.addAlert(alert)
    }
}
