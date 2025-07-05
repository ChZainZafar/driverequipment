import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
} from "firebase/firestore";

export const addContact = async (contactData) => {
  try {
    const docRef = await addDoc(collection(db, "contacts"), contactData);
    return { id: docRef.id, ...contactData };
  } catch (error) {
    throw new Error("Failed to add contact: " + error.message);
  }
};

export const updateContact = async (id, contactData) => {
  try {
    await updateDoc(doc(db, "contacts", id), contactData);
  } catch (error) {
    throw new Error("Failed to update contact: " + error.message);
  }
};

export const deleteContact = async (id) => {
  try {
    await deleteDoc(doc(db, "contacts", id));
  } catch (error) {
    throw new Error("Failed to delete contact: " + error.message);
  }
};

export const getContacts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "contacts"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error("Failed to fetch contacts: " + error.message);
  }
};
