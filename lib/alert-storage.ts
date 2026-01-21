"use client";

import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  Timestamp,
} from "firebase/firestore";

export interface Alert {
  id?: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  location: string;
  cameraId: string;
  peopleCount: number;
  timestamp: Date;
  status: "active" | "acknowledged" | "resolved";
  latitude: number;
  longitude: number;
  cameraName?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

const ALERTS_COLLECTION = "alerts";

export class AlertStorage {
  /**
   * Create a new alert in Firebase
   */
  static async createAlert(alertData: Omit<Alert, "id">): Promise<string> {
    try {
      const alertWithTimestamp = {
        ...alertData,
        timestamp: Timestamp.fromDate(alertData.timestamp),
        acknowledgedAt: alertData.acknowledgedAt
          ? Timestamp.fromDate(alertData.acknowledgedAt)
          : null,
        resolvedAt: alertData.resolvedAt
          ? Timestamp.fromDate(alertData.resolvedAt)
          : null,
      };

      const docRef = await addDoc(
        collection(db, ALERTS_COLLECTION),
        alertWithTimestamp,
      );
      console.log("Alert created with ID:", docRef.id);

      // Dispatch event for real-time updates
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("alerts-updated"));
      }

      return docRef.id;
    } catch (error) {
      console.error("Error creating alert:", error);
      throw error;
    }
  }

  /**
   * Get all alerts from Firebase
   */
  static async getAllAlerts(): Promise<Alert[]> {
    try {
      const q = query(
        collection(db, ALERTS_COLLECTION),
        orderBy("timestamp", "desc"),
        limit(100),
      );

      const querySnapshot = await getDocs(q);
      const alerts: Alert[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        alerts.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          severity: data.severity,
          location: data.location,
          cameraId: data.cameraId,
          peopleCount: data.peopleCount,
          timestamp: data.timestamp?.toDate() || new Date(),
          status: data.status,
          latitude: data.latitude,
          longitude: data.longitude,
          cameraName: data.cameraName,
          acknowledgedAt: data.acknowledgedAt?.toDate(),
          resolvedAt: data.resolvedAt?.toDate(),
        });
      });

      return alerts;
    } catch (error) {
      console.error("Error fetching alerts:", error);
      return [];
    }
  }

  /**
   * Get active alerts (not resolved)
   */
  static async getActiveAlerts(): Promise<Alert[]> {
    try {
      const q = query(
        collection(db, ALERTS_COLLECTION),
        where("status", "in", ["active", "acknowledged"]),
        orderBy("timestamp", "desc"),
        limit(50),
      );

      const querySnapshot = await getDocs(q);
      const alerts: Alert[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        alerts.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          severity: data.severity,
          location: data.location,
          cameraId: data.cameraId,
          peopleCount: data.peopleCount,
          timestamp: data.timestamp?.toDate() || new Date(),
          status: data.status,
          latitude: data.latitude,
          longitude: data.longitude,
          cameraName: data.cameraName,
          acknowledgedAt: data.acknowledgedAt?.toDate(),
          resolvedAt: data.resolvedAt?.toDate(),
        });
      });

      return alerts;
    } catch (error) {
      console.error("Error fetching active alerts:", error);
      return [];
    }
  }

  /**
   * Acknowledge an alert
   */
  static async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      const alertRef = doc(db, ALERTS_COLLECTION, alertId);
      await updateDoc(alertRef, {
        status: "acknowledged",
        acknowledgedAt: Timestamp.now(),
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("alerts-updated"));
      }

      console.log("Alert acknowledged:", alertId);
    } catch (error) {
      console.error("Error acknowledging alert:", error);
      throw error;
    }
  }

  /**
   * Resolve an alert
   */
  static async resolveAlert(alertId: string): Promise<void> {
    try {
      const alertRef = doc(db, ALERTS_COLLECTION, alertId);
      await updateDoc(alertRef, {
        status: "resolved",
        resolvedAt: Timestamp.now(),
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("alerts-updated"));
      }

      console.log("Alert resolved:", alertId);
    } catch (error) {
      console.error("Error resolving alert:", error);
      throw error;
    }
  }

  /**
   * Delete an alert
   */
  static async deleteAlert(alertId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, ALERTS_COLLECTION, alertId));

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("alerts-updated"));
      }

      console.log("Alert deleted:", alertId);
    } catch (error) {
      console.error("Error deleting alert:", error);
      throw error;
    }
  }

  /**
   * Check if an alert already exists for a camera (within last 5 minutes)
   */
  static async hasRecentAlert(
    cameraId: string,
    minutesAgo: number = 5,
  ): Promise<boolean> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - minutesAgo * 60 * 1000);

      // Simplified query to avoid compound index requirement
      const q = query(
        collection(db, ALERTS_COLLECTION),
        where("cameraId", "==", cameraId),
        where("status", "==", "active"),
      );

      const querySnapshot = await getDocs(q);

      // Filter results in memory
      let hasRecent = false;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const alertTime = data.timestamp?.toDate() || new Date(0);
        if (alertTime >= fiveMinutesAgo) {
          hasRecent = true;
        }
      });

      return hasRecent;
    } catch (error) {
      console.error("Error checking recent alerts:", error);
      return false;
    }
  }

  /**
   * Get alerts by severity
   */
  static async getAlertsBySeverity(
    severity: "critical" | "warning" | "info",
  ): Promise<Alert[]> {
    try {
      const q = query(
        collection(db, ALERTS_COLLECTION),
        where("severity", "==", severity),
        orderBy("timestamp", "desc"),
        limit(50),
      );

      const querySnapshot = await getDocs(q);
      const alerts: Alert[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        alerts.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          severity: data.severity,
          location: data.location,
          cameraId: data.cameraId,
          peopleCount: data.peopleCount,
          timestamp: data.timestamp?.toDate() || new Date(),
          status: data.status,
          latitude: data.latitude,
          longitude: data.longitude,
          cameraName: data.cameraName,
          acknowledgedAt: data.acknowledgedAt?.toDate(),
          resolvedAt: data.resolvedAt?.toDate(),
        });
      });

      return alerts;
    } catch (error) {
      console.error("Error fetching alerts by severity:", error);
      return [];
    }
  }

  /**
   * Get alerts count by status
   */
  static async getAlertsCount(): Promise<{
    active: number;
    acknowledged: number;
    resolved: number;
    critical: number;
  }> {
    try {
      const allAlerts = await this.getAllAlerts();

      return {
        active: allAlerts.filter((a) => a.status === "active").length,
        acknowledged: allAlerts.filter((a) => a.status === "acknowledged")
          .length,
        resolved: allAlerts.filter((a) => a.status === "resolved").length,
        critical: allAlerts.filter((a) => a.severity === "critical").length,
      };
    } catch (error) {
      console.error("Error counting alerts:", error);
      return {
        active: 0,
        acknowledged: 0,
        resolved: 0,
        critical: 0,
      };
    }
  }
}
