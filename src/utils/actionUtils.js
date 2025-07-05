import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
} from "firebase/firestore";

export const addAction = async (actionData) => {
  try {
    const docRef = await addDoc(collection(db, "actions"), {
      ...actionData,
      createdAt: new Date().toISOString(),
    });
    return { id: docRef.id, ...actionData };
  } catch (error) {
    throw new Error("Failed to add action: " + error.message);
  }
};

export const updateAction = async (id, actionData) => {
  try {
    await updateDoc(doc(db, "actions", id), {
      ...actionData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    throw new Error("Failed to update action: " + error.message);
  }
};

export const deleteAction = async (id) => {
  try {
    await deleteDoc(doc(db, "actions", id));
  } catch (error) {
    throw new Error("Failed to delete action: " + error.message);
  }
};

export const getActions = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "actions"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error("Failed to fetch actions: " + error.message);
  }
};
