import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
} from "firebase/firestore";

export const addJob = async (jobData) => {
  try {
    const docRef = await addDoc(collection(db, "jobs"), jobData);
    return { id: docRef.id, ...jobData };
  } catch (error) {
    throw new Error("Failed to add job: " + error.message);
  }
};

export const updateJob = async (id, jobData) => {
  try {
    await updateDoc(doc(db, "jobs", id), jobData);
  } catch (error) {
    throw new Error("Failed to update job: " + error.message);
  }
};

export const deleteJob = async (id) => {
  try {
    await deleteDoc(doc(db, "jobs", id));
  } catch (error) {
    throw new Error("Failed to delete job: " + error.message);
  }
};

export const getJobs = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "jobs"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error("Failed to fetch jobs: " + error.message);
  }
};
