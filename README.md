CrowdVision AI

AI-Powered Crowd Detection & Surveillance System

CrowdVision AI is a real-time crowd monitoring and public safety system built to help authorities understand, manage, and respond to crowd situations during large public gatherings. The platform combines computer vision, geospatial visualization, and alerting to turn raw camera feeds into actionable insights.

The focus of this project is practical deployment — not just detection, but decision-making support through dashboards, heatmaps, and alerts.

Why CrowdVision AI?

Large gatherings like festivals, rallies, and transport hubs often rely on manual monitoring or passive CCTV systems. These approaches react after a problem occurs.

CrowdVision AI is designed to:

Detect crowd buildup early

Visualize risk spatially using maps

Alert authorities before situations escalate

Work with prebuilt models and real-world camera setups

Key Capabilities
🔐 Authentication

Firebase-based email/password authentication

Protected dashboard routes

Optional guest access for demos and testing

Clean glassmorphism-inspired UI for the auth flow

📊 Dashboard Overview

Live total people count across all cameras

Active camera count

Overall crowd risk status (Safe / Warning / Critical)

Active alert count by severity

Recent activity feed with timestamps

System health indicators

This is the primary situational awareness screen for operators.

🎥 Live Camera Monitoring

Real-time webcam or camera feed support

Bounding boxes drawn around detected people

Per-camera crowd count

Risk level visualization using color codes

Grid and list view modes

Fullscreen and pause controls

FPS and camera health indicators

🗺️ Geo-Based Crowd Heatmap

Interactive map-based visualization

Camera markers with precise geo-coordinates

Coverage radius visualization per camera

Animated heatmap layer based on crowd density

Risk-level filtering (low / medium / high)

Layer toggles for heatmap, markers, and coverage zones

Real-time updates

This module is the core of spatial crowd understanding.

📈 Crowd Analytics

Time-series crowd count trends

Camera-wise density comparison

Peak hour detection

Density distribution (low / medium / high)

Hour-by-hour crowd variation

Configurable time ranges (24h, 7d, 30d)

🚨 Alert & Warning System

Real-time alerts with severity levels

Active, acknowledged, and resolved states

Alert acknowledgment and resolution tracking

Automatic map highlighting for affected zones

Alert statistics and response time metrics

Visual emphasis for critical alerts

🎛️ Camera Management

Add, edit, and remove camera configurations

Set camera name, location, and geo-coordinates

Define coverage radius and alert thresholds

Inline editing and form validation

Camera health and metadata tracking

🧾 Alert History & Logs

Complete alert history with pagination

Advanced filtering (date, severity, camera)

Search across alert records

Export logs as CSV

Resolution and response-time statistics

📱 Android Mobile App

Built for field officers and on-ground teams

Real-time push notifications using Firebase Cloud Messaging

Mobile heatmap view

Alert list and detailed alert view

Offline access to recent alerts

Lightweight, alert-focused UI

ML Model Integration

CrowdVision AI is model-agnostic and ready for integration with prebuilt crowd detection models.

Supports YOLOv8 (.pt), ONNX, and TensorFlow.js models

ML inference runs locally (no cloud dependency)

Clean API boundary between ML service and frontend

Adjustable confidence thresholds

Automatic alert triggering based on detection output

The ML layer is intentionally kept separate from the UI for scalability and flexibility.

Tech Stack

Frontend

Next.js (App Router)

React + TypeScript

Tailwind CSS

Google Maps JavaScript API

Backend

API layer for detection results, alerts, and analytics

WebSocket support for real-time updates

Mobile

React Native (Android-focused)

Firebase Cloud Messaging

ML / Vision

YOLOv8 (local inference)

OpenCV

Python-based detection service

Project Status

✅ UI/UX fully implemented
✅ Authentication, dashboards, analytics, alerts complete
🧠 ML model integration in progress
📡 Real camera feeds and deployment testing pending

The system is production-ready from a frontend and architecture standpoint, with only the final ML wiring and deployment configuration remaining.

Future Enhancements

Crowd spike (rate-of-change) detection

Crowd flow direction analysis

Multi-camera correlation and prediction

Automatic face blurring for privacy

Heatmap playback over time

Event-based dynamic alert thresholds

Edge-device deployment support

Final Note

CrowdVision AI is built with a focus on real-world usability, not just demo performance.
Every feature exists to reduce response time, improve visibility, and support safer public spaces.
