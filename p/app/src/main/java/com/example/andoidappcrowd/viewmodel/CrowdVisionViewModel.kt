package com.example.andoidappcrowd.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.andoidappcrowd.data.model.Alert
import com.example.andoidappcrowd.data.model.Analytics
import com.example.andoidappcrowd.data.model.Camera
import com.example.andoidappcrowd.data.repository.CrowdVisionRepository
import com.example.andoidappcrowd.data.websocket.ConnectionState
import com.example.andoidappcrowd.data.websocket.WebSocketManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CrowdVisionViewModel @Inject constructor(
    private val repository: CrowdVisionRepository,
    private val webSocketManager: WebSocketManager
) : ViewModel() {
    
    // UI States
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()
    
    // Alerts
    private val _alerts = MutableStateFlow<List<Alert>>(emptyList())
    val alerts: StateFlow<List<Alert>> = _alerts.asStateFlow()
    
    // Cameras
    private val _cameras = MutableStateFlow<List<Camera>>(emptyList())
    val cameras: StateFlow<List<Camera>> = _cameras.asStateFlow()
    
    // Analytics
    private val _analytics = MutableStateFlow<Analytics?>(null)
    val analytics: StateFlow<Analytics?> = _analytics.asStateFlow()
    
    // WebSocket Connection
    val connectionState = webSocketManager.connectionState
    val socketAlerts = webSocketManager.alerts
    val socketCameraUpdates = webSocketManager.cameraUpdates
    
    init {
        loadData()
        connectWebSocket()
        observeRealtimeData()
    }
    
    private fun loadData() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                // Load alerts
                repository.getAlerts()
                    .onSuccess { _alerts.value = it }
                    .onFailure { _errorMessage.value = "Failed to load alerts: ${it.message}" }
                
                // Load cameras
                repository.getCameras()
                    .onSuccess { _cameras.value = it }
                    .onFailure { _errorMessage.value = "Failed to load cameras: ${it.message}" }
                
                // Load analytics
                repository.getAnalytics()
                    .onSuccess { _analytics.value = it }
                    .onFailure { _errorMessage.value = "Failed to load analytics: ${it.message}" }
                
            } catch (e: Exception) {
                _errorMessage.value = "Error loading data: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    private fun connectWebSocket() {
        webSocketManager.connect("ws://localhost:5000")
    }
    
    private fun observeRealtimeData() {
        viewModelScope.launch {
            // Observe real-time alerts from Firestore
            repository.getAlertsFlow().collect { realtimeAlerts ->
                _alerts.value = realtimeAlerts
            }
        }
        
        viewModelScope.launch {
            // Observe real-time cameras from Firestore
            repository.getCamerasFlow().collect { realtimeCameras ->
                _cameras.value = realtimeCameras
            }
        }
    }
    
    fun acknowledgeAlert(alertId: String) {
        viewModelScope.launch {
            try {
                repository.acknowledgeAlert(alertId)
                    .onSuccess {
                        // Refresh alerts
                        repository.getAlerts()
                            .onSuccess { _alerts.value = it }
                    }
                    .onFailure { _errorMessage.value = "Failed to acknowledge alert: ${it.message}" }
            } catch (e: Exception) {
                _errorMessage.value = "Error acknowledging alert: ${e.message}"
            }
        }
    }
    
    fun refreshData() {
        loadData()
    }
    
    fun clearError() {
        _errorMessage.value = null
    }
    
    override fun onCleared() {
        super.onCleared()
        webSocketManager.disconnect()
    }
}