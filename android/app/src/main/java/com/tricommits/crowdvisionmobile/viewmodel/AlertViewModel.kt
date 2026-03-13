package com.tricommits.crowdvisionmobile.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.map
import com.tricommits.crowdvisionmobile.data.MetricsRepository
import com.tricommits.crowdvisionmobile.data.SOSMetrics
import com.tricommits.crowdvisionmobile.ui.alert.Alert
import com.tricommits.crowdvisionmobile.ui.alert.FirebaseAlertRepository

class AlertViewModel : ViewModel() {

    private val repository = FirebaseAlertRepository()
    private val metricsRepository = MetricsRepository()

    val allAlerts: LiveData<List<Alert>> = repository.getAlerts()
    val globalStats: LiveData<SOSMetrics> = metricsRepository.getGlobalStats()

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
        metricsRepository.finalizeMetrics(alertId, System.currentTimeMillis())
    }

    fun assignRescuer(alertId: String, rescuerId: String) {
        metricsRepository.recordAssignment(alertId, rescuerId)
    }

    fun markAsReached(alertId: String) {
        metricsRepository.recordReach(alertId)
    }

    fun deleteAlert(alertId: String) {
        repository.deleteAlert(alertId)
    }

    fun getAlertById(alertId: String): Alert? {
        return allAlerts.value?.find { it.id == alertId }
    }
    
    fun getAlertMetrics(alertId: String, onUpdate: (Map<String, Any>) -> Unit) {
        metricsRepository.getAlertMetrics(alertId, onUpdate)
    }
}
