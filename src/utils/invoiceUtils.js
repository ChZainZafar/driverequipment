import { db } from "../firebase/config";
import { collection, addDoc } from "firebase/firestore";

export const createInvoice = async (invoiceData) => {
  try {
    const docRef = await addDoc(collection(db, "invoices"), invoiceData);
    return docRef.id;
  } catch (error) {
    throw new Error("Failed to create invoice: " + error.message);
  }
};
