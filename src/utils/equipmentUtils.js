import { db, storage } from "../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const uploadImage = async (file, path) => {
  try {
    if (
      typeof file === "string" &&
      file.startsWith("https://firebasestorage.googleapis.com")
    ) {
      return file;
    }

    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Image upload error:", error);
    throw new Error("Failed to upload image");
  }
};

export const addEquipment = async (equipmentData) => {
  try {
    const { newImages, images, ...rest } = equipmentData;
    const imageUrls = [...(images || [])];

    if (newImages && newImages.length > 0) {
      for (let i = 0; i < newImages.length; i++) {
        const file = newImages[i];
        if (file) {
          const path = `equipment/global/${Date.now()}_${i}`;
          const downloadURL = await uploadImage(file, path);
          imageUrls.push(downloadURL);
        }
      }
    }

    const docRef = await addDoc(collection(db, "equipment"), {
      ...rest,
      images: imageUrls,
    });
    return { id: docRef.id, ...equipmentData, images: imageUrls };
  } catch (error) {
    console.error("Add equipment error:", error);
    throw new Error("Failed to add equipment");
  }
};

export const updateEquipment = async (id, equipmentData) => {
  try {
    const { newImages, images, ...rest } = equipmentData;
    const imageUrls = [...(images || [])];

    if (newImages && newImages.length > 0) {
      for (let i = 0; i < newImages.length; i++) {
        const file = newImages[i];
        if (file) {
          const path = `equipment/global/${Date.now()}_${i}`;
          const downloadURL = await uploadImage(file, path);
          imageUrls.push(downloadURL);
        }
      }
    }

    const equipmentRef = doc(db, "equipment", id);
    await updateDoc(equipmentRef, {
      ...rest,
      images: imageUrls,
    });
    return { id, ...equipmentData, images: imageUrls };
  } catch (error) {
    console.error("Update equipment error:", error);
    throw new Error("Failed to update equipment");
  }
};

export const getEquipment = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "equipment"));
    const equipmentList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return equipmentList;
  } catch (error) {
    console.error("Get equipment error:", error);
    throw new Error("Failed to fetch equipment");
  }
};

export const deleteEquipment = async (id) => {
  try {
    const equipmentRef = doc(db, "equipment", id);
    await deleteDoc(equipmentRef);
  } catch (error) {
    console.error("Delete equipment error:", error);
    throw new Error("Failed to delete equipment");
  }
};
