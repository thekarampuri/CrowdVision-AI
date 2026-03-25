# 🛠️ AI Based Crowd Watcher for Public Safety - Technical Stack Report

This document provides a comprehensive breakdown of the technologies, libraries, and tools used to build the **AI Based Crowd Watcher for Public Safety** ecosystem.

## 🌐 Frontend: Web Command Dashboard
The central command dashboard is a modern, responsive web application built for real-time monitoring and analytics.

### Core Framework
- **[Next.js 16.0.10](https://nextjs.org/)**: The React framework for production. Used for its robust App Router, server-side rendering (SSR), and API routes.
- **[React 19.2.0](https://react.dev/)**: The library for web and native user interfaces.
- **TypeScript**: Statically typed JavaScript for type safety and better developer experience.

### Styling & UI Components
- **[Tailwind CSS 4.x](https://tailwindcss.com/)**: Utility-first CSS framework for rapid UI development.
- **[Shadcn UI](https://ui.shadcn.com/)**: A collection of re-usable components built using **Radix UI** primitives and Tailwind CSS.
- **[Lucide React](https://lucide.dev/)**: Beautiful & consistent icon set.
- **Framer Motion / Tailwind Animate**: utilized for smooth UI transitions and micro-interactions.

### Maps & Visualization
- **[Leaflet](https://leafletjs.com/)** & **[React-Leaflet](https://react-leaflet.js.org/)**: Open-source JavaScript library for mobile-friendly interactive maps. Used to display camera locations and crowd heatmaps.
- **[Recharts](https://recharts.org/)**: Composable charting library built on React components. Used for analytics graphs (peak hours, historical data).

### State & Data Management
- **React Hooks**: Built-in state management.
- **Firebase SDK**: Client-side SDK for real-time authentication and database listeners.
- **Zod**: TypeScript-first schema declaration and validation library.

---

## 🧠 Backend: ML Inference Server
The intelligence core responsible for processing video feeds and detecting crowd density in real-time.

### Server Runtime
- **[Python 3.8+](https://www.python.org/)**: The programming language used for all ML operations.
- **[Flask 3.0.0](https://flask.palletsprojects.com/)**: Lightweight WSGI web application framework. Serves the REST API for processing images and configuration.
- **Flask-CORS**: Handles Cross-Origin Resource Sharing (CORS), allowing the frontend to communicate with the ML server locally.

### Artificial Intelligence & Computer Vision
- **[Ultralytics YOLOv8 (8.3.0)](https://github.com/ultralytics/ultralytics)**: The core object detection model.
    - Model: `yolov8n.pt` (Nano) - chosen for real-time inference speed on standard CPU hardware.
    - Task: Person Detection (Class ID: 0).
- **[OpenCV (cv2) 4.10.0](https://opencv.org/)**: Open Source Computer Vision Library. Used for:
    - Image decoding (Base64 to NumPy array).
    - Image preprocessing.

### Image Processing
- **NumPy**: The fundamental package for scientific computing with Python. Handles matrix operations for image data.
- **Pillow (PIL)**: Python Imaging Library, used as a fallback/utility for image manipulation.

---

## 📱 Mobile: Field Officer App
A native Android application designed for security personnel on the ground.

### Development Platform
- **Language**: [Kotlin](https://kotlinlang.org/)
- **Minimum SDK**: 24 (Android 7.0 Nougat)
- **Target SDK**: 36 (Android 15)

### UI Toolkit
- **[Jetpack Compose](https://developer.android.com/jetpack/compose)**: Android’s modern toolkit for building native UI. Ditch XML layouts for a fully declarative UI approach.
- **Material Design 3**: The latest design system from Google, implemented via Compose Material3 library.

### Architecture & Libraries
- **Firebase BOM**: Bill of Materials for managing Firebase versions.
    - **Firestore KTX**: Kotlin extensions for Cloud Firestore.
    - **Messaging KTX**: Firebase Cloud Messaging (FCM) for push notifications.
- **Gson**: A Java serialization/deserialization library to convert Java Objects into JSON and back.
- **AndroidX Core KTX**: Kotlin extensions for Android API.
- **Navigation Compose**: declarative navigation for Jetpack Compose.

---

## ☁️ Infrastructure & Services

### Backend-as-a-Service (BaaS)
- **[Google Firebase](https://firebase.google.com/)**:
    - **Authentication**: Secure email/password and social login handling.
    - **Cloud Firestore**: NoSQL cloud database for storing:
        - Camera configurations.
        - Active/History alerts.
        - User profiles (Admin/Field Officer).
    - **Cloud Storage**: Storage for alert snapshots and assets.

### Networking
- **Local Network**: The ML Server typically runs within the same local network as the cameras/sources to minimize latency, exposing endpoints via `localhost` or local IP.
