# Android App Generation Prompt for CrowdVision AI

Use this comprehensive prompt with AI assistants (like Claude, ChatGPT, or Cursor) to generate a complete Android application for the CrowdVision AI field officer mobile app.

---

## 📱 Complete Android App Generation Prompt

```
Create a professional Android application for CrowdVision AI - a real-time crowd monitoring system for field officers and security personnel. This mobile app complements the existing web dashboard and receives real-time alerts from the Firebase backend.

## PROJECT OVERVIEW

**App Name**: CrowdVision Field  
**Package**: com.crowdvision.fieldapp  
**Target SDK**: Android 14 (API 34)  
**Minimum SDK**: Android 7.0 (API 24)  
**Language**: Kotlin  
**Architecture**: MVVM with Repository Pattern  

## EXISTING BACKEND INFRASTRUCTURE

The app integrates with an existing system:
- **Firebase Project ID**: crowdvision-ai-7e13f
- **Firestore Database**: Real-time NoSQL database
- **Firebase Auth**: Email/password authentication
- **ML Server**: Python Flask server at http://YOUR_SERVER_IP:5000
- **Next.js Dashboard**: Web interface for operators

### Firestore Collections Structure:

```firestore
/alerts
  ├── alertId (auto-generated)
  │   ├── cameraId: string
  │   ├── location: string
  │   ├── count: number (people detected)
  │   ├── riskLevel: "low" | "medium" | "high"
  │   ├── timestamp: Timestamp
  │   ├── acknowledged: boolean
  │   ├── resolved: boolean
  │   ├── message: string
  │   ├── latitude: number
  │   └── longitude: number

/cameras
  ├── cameraId (auto-generated)
  │   ├── name: string
  │   ├── location: string
  │   ├── latitude: number
  │   ├── longitude: number
  │   ├── isActive: boolean
  │   ├── currentCount: number
  │   ├── riskLevel: "low" | "medium" | "high"
  │   ├── coverageRadius: number
  │   └── lastUpdated: Timestamp

/users
  ├── userId (auto-generated)
  │   ├── email: string
  │   ├── displayName: string
  │   ├── role: "admin" | "operator" | "field_officer"
  │   ├── deviceToken: string (FCM token)
  │   └── settings: Map<string, any>
```

## COMPLETE PROJECT STRUCTURE

```
CrowdVisionAndroid/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/crowdvision/fieldapp/
│   │   │   │   ├── MainActivity.kt
│   │   │   │   ├── CrowdVisionApp.kt (Application class)
│   │   │   │   │
│   │   │   │   ├── ui/
│   │   │   │   │   ├── auth/
│   │   │   │   │   │   ├── LoginActivity.kt
│   │   │   │   │   │   ├── RegisterActivity.kt
│   │   │   │   │   │   └── LoginViewModel.kt
│   │   │   │   │   │
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   │   ├── DashboardFragment.kt
│   │   │   │   │   │   └── DashboardViewModel.kt
│   │   │   │   │   │
│   │   │   │   │   ├── alerts/
│   │   │   │   │   │   ├── AlertsFragment.kt
│   │   │   │   │   │   ├── AlertDetailActivity.kt
│   │   │   │   │   │   ├── AlertsAdapter.kt
│   │   │   │   │   │   └── AlertsViewModel.kt
│   │   │   │   │   │
│   │   │   │   │   ├── map/
│   │   │   │   │   │   ├── MapFragment.kt
│   │   │   │   │   │   └── MapViewModel.kt
│   │   │   │   │   │
│   │   │   │   │   └── settings/
│   │   │   │   │       ├── SettingsFragment.kt
│   │   │   │   │       └── SettingsViewModel.kt
│   │   │   │   │
│   │   │   │   ├── data/
│   │   │   │   │   ├── model/
│   │   │   │   │   │   ├── Alert.kt
│   │   │   │   │   │   ├── Camera.kt
│   │   │   │   │   │   ├── User.kt
│   │   │   │   │   │   └── CrowdStats.kt
│   │   │   │   │   │
│   │   │   │   │   ├── repository/
│   │   │   │   │   │   ├── AlertRepository.kt
│   │   │   │   │   │   ├── CameraRepository.kt
│   │   │   │   │   │   └── UserRepository.kt
│   │   │   │   │   │
│   │   │   │   │   └── local/
│   │   │   │   │       ├── AppDatabase.kt
│   │   │   │   │       ├── AlertDao.kt
│   │   │   │   │       └── CameraDao.kt
│   │   │   │   │
│   │   │   │   ├── service/
│   │   │   │   │   ├── FCMService.kt
│   │   │   │   │   └── AlertNotificationService.kt
│   │   │   │   │
│   │   │   │   └── util/
│   │   │   │       ├── Constants.kt
│   │   │   │       ├── DateUtils.kt
│   │   │   │       ├── NetworkUtils.kt
│   │   │   │       └── NotificationHelper.kt
│   │   │   │
│   │   │   ├── res/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── activity_main.xml
│   │   │   │   │   ├── activity_login.xml
│   │   │   │   │   ├── fragment_dashboard.xml
│   │   │   │   │   ├── fragment_alerts.xml
│   │   │   │   │   ├── fragment_map.xml
│   │   │   │   │   ├── item_alert.xml
│   │   │   │   │   └── item_camera.xml
│   │   │   │   │
│   │   │   │   ├── values/
│   │   │   │   │   ├── strings.xml
│   │   │   │   │   ├── colors.xml
│   │   │   │   │   ├── themes.xml
│   │   │   │   │   └── dimens.xml
│   │   │   │   │
│   │   │   │   ├── drawable/
│   │   │   │   │   ├── ic_alert.xml
│   │   │   │   │   ├── ic_camera.xml
│   │   │   │   │   ├── ic_map.xml
│   │   │   │   │   └── bg_gradient.xml
│   │   │   │   │
│   │   │   │   ├── navigation/
│   │   │   │   │   └── nav_graph.xml
│   │   │   │   │
│   │   │   │   └── menu/
│   │   │   │       └── bottom_nav_menu.xml
│   │   │   │
│   │   │   └── AndroidManifest.xml
│   │   │
│   │   └── google-services.json (Firebase config)
│   │
│   └── build.gradle.kts
│
├── gradle/
├── build.gradle.kts
└── settings.gradle.kts
```

## DETAILED IMPLEMENTATION REQUIREMENTS

### 1. DATA MODELS

```kotlin
// Alert.kt
data class Alert(
    val id: String = "",
    val cameraId: String = "",
    val location: String = "",
    val count: Int = 0,
    val riskLevel: String = "low", // "low", "medium", "high"
    val timestamp: Long = 0L,
    val acknowledged: Boolean = false,
    val resolved: Boolean = false,
    val message: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val acknowledgedBy: String? = null,
    val resolvedBy: String? = null,
    val acknowledgedAt: Long? = null,
    val resolvedAt: Long? = null
) {
    fun getRiskColor(): Int = when (riskLevel) {
        "high" -> Color.parseColor("#EF4444")
        "medium" -> Color.parseColor("#F59E0B")
        else -> Color.parseColor("#10B981")
    }
    
    fun isActive(): Boolean = !acknowledged && !resolved
}

// Camera.kt
data class Camera(
    val id: String = "",
    val name: String = "",
    val location: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val isActive: Boolean = true,
    val currentCount: Int = 0,
    val riskLevel: String = "low",
    val coverageRadius: Int = 50,
    val lastUpdated: Long = 0L
)

// User.kt
data class User(
    val uid: String = "",
    val email: String = "",
    val displayName: String = "",
    val role: String = "field_officer",
    val deviceToken: String? = null,
    val notificationsEnabled: Boolean = true
)
```

### 2. GRADLE DEPENDENCIES (app/build.gradle.kts)

```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.gms.google-services")
    id("kotlin-kapt")
}

android {
    namespace = "com.crowdvision.fieldapp"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.crowdvision.fieldapp"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        viewBinding = true
        dataBinding = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    // Core Android
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    
    // Firebase
    implementation(platform("com.google.firebase:firebase-bom:32.7.0"))
    implementation("com.google.firebase:firebase-auth-ktx")
    implementation("com.google.firebase:firebase-firestore-ktx")
    implementation("com.google.firebase:firebase-messaging-ktx")
    implementation("com.google.firebase:firebase-analytics-ktx")
    
    // Navigation
    implementation("androidx.navigation:navigation-fragment-ktx:2.7.6")
    implementation("androidx.navigation:navigation-ui-ktx:2.7.6")
    
    // Lifecycle & ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0")
    implementation("androidx.lifecycle:lifecycle-livedata-ktx:2.7.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    
    // Room Database (Offline Support)
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")
    
    // Google Maps
    implementation("com.google.android.gms:play-services-maps:18.2.0")
    implementation("com.google.android.gms:play-services-location:21.0.1")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.7.3")
    
    // Retrofit (API Calls)
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    
    // Image Loading
    implementation("com.github.bumptech.glide:glide:4.16.0")
    
    // SwipeRefreshLayout
    implementation("androidx.swiperefreshlayout:swiperefreshlayout:1.1.0")
    
    // WorkManager (Background Tasks)
    implementation("androidx.work:work-runtime-ktx:2.9.0")
}
```

### 3. FIREBASE CLOUD MESSAGING SERVICE

```kotlin
// FCMService.kt
class FCMService : FirebaseMessagingService() {
    
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        
        Log.d(TAG, "Message received from: ${remoteMessage.from}")
        
        remoteMessage.data.let { data ->
            when (data["type"]) {
                "crowd_alert" -> handleCrowdAlert(data)
                "system_notification" -> handleSystemNotification(data)
                else -> Log.w(TAG, "Unknown message type")
            }
        }
    }
    
    private fun handleCrowdAlert(data: Map<String, String>) {
        val alertId = data["alertId"] ?: return
        val location = data["location"] ?: "Unknown Location"
        val count = data["count"]?.toIntOrNull() ?: 0
        val riskLevel = data["riskLevel"] ?: "medium"
        
        // Save to local database for offline access
        saveAlertToLocalDb(alertId, data)
        
        // Show notification
        showAlertNotification(
            alertId = alertId,
            title = "⚠️ High Risk Alert",
            message = "$count people detected at $location",
            riskLevel = riskLevel
        )
        
        // Play alert sound based on risk level
        if (riskLevel == "high") {
            playAlertSound()
            vibrateDevice()
        }
    }
    
    private fun showAlertNotification(
        alertId: String,
        title: String,
        message: String,
        riskLevel: String
    ) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        // Create notification channel (Android 8.0+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Crowd Alerts",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Real-time crowd detection alerts"
                enableVibration(true)
                enableLights(true)
                lightColor = Color.RED
            }
            notificationManager.createNotificationChannel(channel)
        }
        
        // Intent to open alert details
        val intent = Intent(this, AlertDetailActivity::class.java).apply {
            putExtra("alertId", alertId)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        
        // Build notification
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_alert)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setColor(getRiskColor(riskLevel))
            .addAction(R.drawable.ic_check, "Acknowledge", createAcknowledgeIntent(alertId))
            .addAction(R.drawable.ic_map, "View Location", createMapIntent(alertId))
            .build()
        
        notificationManager.notify(alertId.hashCode(), notification)
    }
    
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "New FCM token: $token")
        
        // Save token to Firebase user document
        saveTokenToFirestore(token)
    }
    
    private fun saveTokenToFirestore(token: String) {
        val userId = FirebaseAuth.getInstance().currentUser?.uid ?: return
        
        FirebaseFirestore.getInstance()
            .collection("users")
            .document(userId)
            .update("deviceToken", token)
            .addOnSuccessListener {
                Log.d(TAG, "FCM token saved successfully")
            }
            .addOnFailureListener { e ->
                Log.e(TAG, "Failed to save FCM token", e)
            }
    }
    
    companion object {
        private const val TAG = "FCMService"
        private const val CHANNEL_ID = "crowd_alerts_channel"
    }
}
```

### 4. MAIN DASHBOARD UI

```kotlin
// DashboardFragment.kt
class DashboardFragment : Fragment() {
    
    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!
    
    private val viewModel: DashboardViewModel by viewModels()
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupUI()
        observeData()
        
        // Refresh data
        binding.swipeRefresh.setOnRefreshListener {
            viewModel.refreshData()
        }
    }
    
    private fun setupUI() {
        // Current time
        binding.currentTime.text = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
        
        // Greeting
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        binding.greeting.text = when (hour) {
            in 0..11 -> "Good Morning"
            in 12..16 -> "Good Afternoon"
            else -> "Good Evening"
        }
    }
    
    private fun observeData() {
        // Total crowd count
        viewModel.totalPeopleCount.observe(viewLifecycleOwner) { count ->
            binding.totalPeopleCount.text = count.toString()
            animateCounter(binding.totalPeopleCount, count)
        }
        
        // Active cameras
        viewModel.activeCameras.observe(viewLifecycleOwner) { cameras ->
            binding.activeCamerasCount.text = "${cameras.filter { it.isActive }.size}/${cameras.size}"
        }
        
        // Overall risk level
        viewModel.overallRiskLevel.observe(viewLifecycleOwner) { riskLevel ->
            updateRiskIndicator(riskLevel)
        }
        
        // Active alerts
        viewModel.activeAlerts.observe(viewLifecycleOwner) { alerts ->
            binding.activeAlertsCount.text = alerts.size.toString()
            updateAlertsList(alerts)
        }
        
        // Loading state
        viewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            binding.swipeRefresh.isRefreshing = isLoading
        }
    }
    
    private fun updateRiskIndicator(riskLevel: String) {
        val (color, text, icon) = when (riskLevel) {
            "high" -> Triple(R.color.risk_high, "CRITICAL", R.drawable.ic_alert_high)
            "medium" -> Triple(R.color.risk_medium, "WARNING", R.drawable.ic_alert_medium)
            else -> Triple(R.color.risk_low, "SAFE", R.drawable.ic_check)
        }
        
        binding.riskLevelCard.setCardBackgroundColor(ContextCompat.getColor(requireContext(), color))
        binding.riskLevelText.text = text
        binding.riskLevelIcon.setImageResource(icon)
        
        // Pulse animation for high risk
        if (riskLevel == "high") {
            startPulseAnimation(binding.riskLevelCard)
        }
    }
    
    private fun animateCounter(textView: TextView, targetValue: Int) {
        val animator = ValueAnimator.ofInt(0, targetValue)
        animator.duration = 1000
        animator.addUpdateListener { animation ->
            textView.text = animation.animatedValue.toString()
        }
        animator.start()
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
```

### 5. ALERTS FRAGMENT WITH RECYCLERVIEW

```kotlin
// AlertsFragment.kt
class AlertsFragment : Fragment() {
    
    private var _binding: FragmentAlertsBinding? = null
    private val binding get() = _binding!!
    
    private val viewModel: AlertsViewModel by viewModels()
    private lateinit var alertsAdapter: AlertsAdapter
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAlertsBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupRecyclerView()
        setupFilters()
        observeAlerts()
    }
    
    private fun setupRecyclerView() {
        alertsAdapter = AlertsAdapter(
            onAlertClick = { alert ->
                navigateToAlertDetail(alert)
            },
            onAcknowledge = { alert ->
                viewModel.acknowledgeAlert(alert.id)
            },
            onResolve = { alert ->
                viewModel.resolveAlert(alert.id)
            }
        )
        
        binding.alertsRecyclerView.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = alertsAdapter
            addItemDecoration(DividerItemDecoration(requireContext(), LinearLayoutManager.VERTICAL))
        }
    }
    
    private fun setupFilters() {
        binding.chipGroup.setOnCheckedChangeListener { group, checkedId ->
            val filter = when (checkedId) {
                R.id.chipAll -> AlertFilter.ALL
                R.id.chipHigh -> AlertFilter.HIGH_RISK
                R.id.chipMedium -> AlertFilter.MEDIUM_RISK
                R.id.chipActive -> AlertFilter.ACTIVE
                else -> AlertFilter.ALL
            }
            viewModel.filterAlerts(filter)
        }
    }
    
    private fun observeAlerts() {
        viewModel.filteredAlerts.observe(viewLifecycleOwner) { alerts ->
            alertsAdapter.submitList(alerts)
            binding.emptyView.isVisible = alerts.isEmpty()
        }
    }
    
    private fun navigateToAlertDetail(alert: Alert) {
        val intent = Intent(requireContext(), AlertDetailActivity::class.java).apply {
            putExtra("alertId", alert.id)
        }
        startActivity(intent)
    }
}

// AlertsAdapter.kt
class AlertsAdapter(
    private val onAlertClick: (Alert) -> Unit,
    private val onAcknowledge: (Alert) -> Unit,
    private val onResolve: (Alert) -> Unit
) : ListAdapter<Alert, AlertsAdapter.AlertViewHolder>(AlertDiffCallback()) {
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AlertViewHolder {
        val binding = ItemAlertBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return AlertViewHolder(binding)
    }
    
    override fun onBindViewHolder(holder: AlertViewHolder, position: Int) {
        holder.bind(getItem(position))
    }
    
    inner class AlertViewHolder(
        private val binding: ItemAlertBinding
    ) : RecyclerView.ViewHolder(binding.root) {
        
        fun bind(alert: Alert) {
            binding.apply {
                // Alert details
                location.text = alert.location
                crowdCount.text = "${alert.count} people"
                timestamp.text = DateUtils.formatRelativeTime(alert.timestamp)
                message.text = alert.message
                
                // Risk level indicator
                riskIndicator.setCardBackgroundColor(alert.getRiskColor())
                riskLevel.text = alert.riskLevel.uppercase()
                
                // Status badges
                acknowledgedBadge.isVisible = alert.acknowledged
                resolvedBadge.isVisible = alert.resolved
                
                // Action buttons
                acknowledgeButton.isVisible = !alert.acknowledged && !alert.resolved
                resolveButton.isVisible = alert.acknowledged && !alert.resolved
                
                // Click listeners
                root.setOnClickListener { onAlertClick(alert) }
                acknowledgeButton.setOnClickListener { onAcknowledge(alert) }
                resolveButton.setOnClickListener { onResolve(alert) }
                
                // Pulsing animation for active high-risk alerts
                if (alert.isActive() && alert.riskLevel == "high") {
                    startPulseAnimation(root)
                }
            }
        }
    }
    
    class AlertDiffCallback : DiffUtil.ItemCallback<Alert>() {
        override fun areItemsTheSame(oldItem: Alert, newItem: Alert): Boolean {
            return oldItem.id == newItem.id
        }
        
        override fun areContentsTheSame(oldItem: Alert, newItem: Alert): Boolean {
            return oldItem == newItem
        }
    }
}
```

### 6. MAP FRAGMENT WITH GOOGLE MAPS

```kotlin
// MapFragment.kt
class MapFragment : Fragment(), OnMapReadyCallback {
    
    private var _binding: FragmentMapBinding? = null
    private val binding get() = _binding!!
    
    private val viewModel: MapViewModel by viewModels()
    private lateinit var googleMap: GoogleMap
    private val cameraMarkers = mutableMapOf<String, Marker>()
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMapBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        val mapFragment = childFragmentManager.findFragmentById(R.id.map) as SupportMapFragment
        mapFragment.getMapAsync(this)
        
        setupControls()
    }
    
    override fun onMapReady(map: GoogleMap) {
        googleMap = map
        
        // Configure map
        googleMap.apply {
            mapType = GoogleMap.MAP_TYPE_NORMAL
            uiSettings.isZoomControlsEnabled = true
            uiSettings.isCompassEnabled = true
            uiSettings.isMyLocationButtonEnabled = true
        }
        
        // Enable location if permission granted
        if (ContextCompat.checkSelfPermission(
                requireContext(),
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
        ) {
            googleMap.isMyLocationEnabled = true
        }
        
        observeCameras()
        observeAlerts()
    }
    
    private fun observeCameras() {
        viewModel.cameras.observe(viewLifecycleOwner) { cameras ->
            updateCameraMarkers(cameras)
            
            // Zoom to show all cameras
            if (cameras.isNotEmpty()) {
                val bounds = LatLngBounds.Builder()
                cameras.forEach { camera ->
                    bounds.include(LatLng(camera.latitude, camera.longitude))
                }
                googleMap.animateCamera(CameraUpdateFactory.newLatLngBounds(bounds.build(), 100))
            }
        }
    }
    
    private fun updateCameraMarkers(cameras: List<Camera>) {
        // Remove old markers
        cameraMarkers.values.forEach { it.remove() }
        cameraMarkers.clear()
        
        // Add new markers
        cameras.forEach { camera ->
            val markerOptions = MarkerOptions()
                .position(LatLng(camera.latitude, camera.longitude))
                .title(camera.name)
                .snippet("${camera.currentCount} people | Risk: ${camera.riskLevel}")
                .icon(getMarkerIcon(camera.riskLevel))
            
            val marker = googleMap.addMarker(markerOptions)
            marker?.let { cameraMarkers[camera.id] = it }
            
            // Add coverage radius circle
            addCoverageCircle(camera)
        }
    }
    
    private fun addCoverageCircle(camera: Camera) {
        val circleOptions = CircleOptions()
            .center(LatLng(camera.latitude, camera.longitude))
            .radius(camera.coverageRadius.toDouble())
            .strokeColor(getCoverageColor(camera.riskLevel))
            .fillColor(getCoverageFillColor(camera.riskLevel))
            .strokeWidth(2f)
        
        googleMap.addCircle(circleOptions)
    }
    
    private fun getMarkerIcon(riskLevel: String): BitmapDescriptor {
        val color = when (riskLevel) {
            "high" -> BitmapDescriptorFactory.HUE_RED
            "medium" -> BitmapDescriptorFactory.HUE_ORANGE
            else -> BitmapDescriptorFactory.HUE_GREEN
        }
        return BitmapDescriptorFactory.defaultMarker(color)
    }
}
```

### 7. REPOSITORY PATTERN WITH FIRESTORE

```kotlin
// AlertRepository.kt
class AlertRepository(
    private val firestore: FirebaseFirestore,
    private val alertDao: AlertDao
) {
    
    // Real-time listener for alerts
    fun getAlertsLiveData(): LiveData<List<Alert>> {
        val liveData = MutableLiveData<List<Alert>>()
        
        firestore.collection("alerts")
            .orderBy("timestamp", Query.Direction.DESCENDING)
            .limit(100)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.e(TAG, "Error listening to alerts", error)
                
