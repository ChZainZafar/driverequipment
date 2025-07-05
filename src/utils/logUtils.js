import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

export const startTimer = async (driverId, startTime) => {
  try {
    localStorage.setItem(
      `timer_${driverId}`,
      JSON.stringify({ startTime: startTime.toISOString() })
    );
  } catch (error) {
    throw new Error("Failed to start timer: " + error.message);
  }
};

export const endTimer = async (driverId) => {
  try {
    localStorage.removeItem(`timer_${driverId}`);
  } catch (error) {
    throw new Error("Failed to end timer: " + error.message);
  }
};

export const getTimer = async (driverId) => {
  try {
    const timerData = localStorage.getItem(`timer_${driverId}`);
    return timerData ? JSON.parse(timerData) : null;
  } catch (error) {
    throw new Error("Failed to get timer: " + error.message);
  }
};

export const saveLog = async (logData) => {
  try {
    await addDoc(collection(db, "driverLogs"), logData);
  } catch (error) {
    throw new Error("Failed to save log: " + error.message);
  }
};

export const editLog = async (logId, logData) => {
  try {
    const logRef = doc(db, "driverLogs", logId);
    await updateDoc(logRef, logData);
  } catch (error) {
    throw new Error("Failed to update log: " + error.message);
  }
};

export const getLogs = async (driverId, date = null) => {
  try {
    let q = query(
      collection(db, "driverLogs"),
      where("driverId", "==", driverId)
    );
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      q = query(
        collection(db, "driverLogs"),
        where("driverId", "==", driverId),
        where("createdAt", ">=", startOfDay.toISOString()),
        where("createdAt", "<=", endOfDay.toISOString())
      );
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
};
