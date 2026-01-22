package com.example.andoidappcrowd.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.andoidappcrowd.data.model.Alert
import com.example.andoidappcrowd.data.model.Camera
import com.example.andoidappcrowd.data.repository.AlertRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AlertViewModel @Inject constructor(
    private val repository: AlertRepository
) : ViewModel() {

    private val _activeAlerts = MutableStateFlow<List<Alert>>(emptyList())
    val activeAlerts: StateFlow<List<Alert>> = _activeAlerts

    private val _alertHistory = MutableStateFlow<List<Alert>>(emptyList())
    val alertHistory: StateFlow<List<Alert>> = _alertHistory

    private val _cameras = MutableStateFlow<List<Camera>>(emptyList())
    val cameras: StateFlow<List<Camera>> = _cameras

    init {
        viewModelScope.launch {
            repository.getActiveAlerts().collectLatest {
                _activeAlerts.value = it
            }
        }
        viewModelScope.launch {
            repository.getAlertHistory().collectLatest {
                _alertHistory.value = it
            }
        }
        viewModelScope.launch {
            repository.getCameras().collectLatest {
                _cameras.value = it
            }
        }
    }

    fun updateStatus(alertId: String, status: String) {
        repository.updateAlertStatus(alertId, status)
    }
}
