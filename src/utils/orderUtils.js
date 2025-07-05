import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

export const createOrder = async (orderData) => {
  try {
    const ordersRef = collection(db, "orders");
    const docRef = await addDoc(ordersRef, orderData);
    return { id: docRef.id, ...orderData };
  } catch (error) {
    console.error("Error creating order:", error.message, error.stack);
    throw new Error(`Failed to create order: ${error.message}`);
  }
};

export const updateOrder = async (orderId, orderData) => {
  try {
    if (!orderId) {
      throw new Error("Order ID is missing");
    }
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, orderData);
    return { id: orderId, ...orderData };
  } catch (error) {
    console.error("Error updating order:", error.message, error.stack);
    throw new Error(`Failed to update order: ${error.message}`);
  }
};

export const getOrders = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is missing");
    }
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error.message, error.stack);
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }
};

export const deleteOrder = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error("Order ID is missing");
    }
    const orderRef = doc(db, "orders", orderId);
    await deleteDoc(orderRef);
  } catch (error) {
    console.error("Error deleting order:", error.message, error.stack);
    throw new Error(`Failed to delete order: ${error.message}`);
  }
};
