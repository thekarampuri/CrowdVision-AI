package com.example.andoidappcrowd.data.websocket

import com.google.gson.Gson
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import org.java_websocket.client.WebSocketClient
import org.java_websocket.handshake.ServerHandshake
import java.net.URI
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WebSocketManager @Inject constructor() {
    
    private var webSocketClient: WebSocketClient? = null
    private val gson = Gson()
    
    private val _connectionState = MutableStateFlow(ConnectionState.DISCONNECTED)
    val connectionState: StateFlow<ConnectionState> = _connectionState
    
    private val _alerts = MutableStateFlow<List<String>>(emptyList())
    val alerts: StateFlow<List<String>> = _alerts
    
    private val _cameraUpdates = MutableStateFlow<List<String>>(emptyList())
    val cameraUpdates: StateFlow<List<String>> = _cameraUpdates
    
    fun connect(serverUrl: String = "ws://localhost:5000") {
        if (webSocketClient?.isOpen == true) return
        
        try {
            val uri = URI(serverUrl)
            webSocketClient = object : WebSocketClient(uri) {
                
                override fun onOpen(handshake: ServerHandshake?) {
                    _connectionState.value = ConnectionState.CONNECTED
                }
                
                override fun onMessage(message: String?) {
                    message?.let {
                        try {
                            val socketMessage = gson.fromJson(it, SocketMessage::class.java)
                            handleSocketMessage(socketMessage)
                        } catch (e: Exception) {
                            // Handle raw message if parsing fails
                            handleRawMessage(it)
                        }
                    }
                }
                
                override fun onClose(code: Int, reason: String?, remote: Boolean) {
                    _connectionState.value = ConnectionState.DISCONNECTED
                }
                
                override fun onError(ex: Exception?) {
                    _connectionState.value = ConnectionState.ERROR
                }
            }
            
            webSocketClient?.connect()
        } catch (e: Exception) {
            _connectionState.value = ConnectionState.ERROR
        }
    }
    
    fun disconnect() {
        webSocketClient?.close()
        webSocketClient = null
        _connectionState.value = ConnectionState.DISCONNECTED
    }
    
    fun sendMessage(message: String) {
        webSocketClient?.send(message)
    }
    
    private fun handleSocketMessage(message: SocketMessage) {
        when (message.type) {
            SocketMessageType.ALERT -> {
                val currentAlerts = _alerts.value.toMutableList()
                currentAlerts.add(message.data)
                if (currentAlerts.size > 100) { // Keep only last 100 alerts
                    currentAlerts.removeAt(0)
                }
                _alerts.value = currentAlerts
            }
            
            SocketMessageType.CAMERA_UPDATE -> {
                val currentUpdates = _cameraUpdates.value.toMutableList()
                currentUpdates.add(message.data)
                if (currentUpdates.size > 100) { // Keep only last 100 updates
                    currentUpdates.removeAt(0)
                }
                _cameraUpdates.value = currentUpdates
            }
            
            SocketMessageType.ANALYTICS -> {
                // Handle analytics updates
            }
        }
    }
    
    private fun handleRawMessage(message: String) {
        // Handle raw JSON messages that don't conform to SocketMessage format
        if (message.contains("alert") || message.contains("Alert")) {
            val currentAlerts = _alerts.value.toMutableList()
            currentAlerts.add(message)
            if (currentAlerts.size > 100) {
                currentAlerts.removeAt(0)
            }
            _alerts.value = currentAlerts
        } else if (message.contains("camera") || message.contains("Camera")) {
            val currentUpdates = _cameraUpdates.value.toMutableList()
            currentUpdates.add(message)
            if (currentUpdates.size > 100) {
                currentUpdates.removeAt(0)
            }
            _cameraUpdates.value = currentUpdates
        }
    }
}

enum class ConnectionState {
    CONNECTED,
    CONNECTING,
    DISCONNECTED,
    ERROR
}

data class SocketMessage(
    val type: SocketMessageType,
    val data: String,
    val timestamp: Long = System.currentTimeMillis()
)

enum class SocketMessageType {
    ALERT,
    CAMERA_UPDATE,
    ANALYTICS,
    HEARTBEAT
}