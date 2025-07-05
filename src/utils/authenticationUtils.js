import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateEmail,
  signOut as firebaseSignOut,
} from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";

export const login = async (email, password) => {
  try {
    if (email === "admin" && password === "admin") {
      return {
        user: { email: "admin", uid: "admin" },
        userType: "admin",
      };
    }
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("Fetching user doc for UID:", userCredential.user.uid);
    const userDoc = await getDoc(
      doc(db, "users_driverequipment", userCredential.user.uid)
    );
    if (!userDoc.exists()) {
      throw new Error("User data not found");
    }
    const userData = userDoc.data();
    const userType =
      userData.userType || determineUserType(userData.roles || {});
    return {
      user: userCredential.user,
      userType,
    };
  } catch (error) {
    console.error("Login error:", error);
    throw new Error("Failed to login: " + error.message);
  }
};

export const createUser = async (email, password, roles, currentUserId) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const userType = determineUserType(roles);
    await setDoc(doc(db, "users_driverequipment", user.uid), {
      email,
      userType,
      roles: {
        isAdmin: roles.isAdmin || false,
        isDriver: roles.isDriver || false,
        isEquipmentMan: roles.isEquipmentMan || false,
      },
    });
    // Only sign out the newly created user if the current user is not the admin
    if (currentUserId !== "admin") {
      await firebaseSignOut(auth);
    }
    return { uid: user.uid, email, roles, userType };
  } catch (error) {
    throw new Error("Failed to create user: " + error.message);
  }
};

export const updateUser = async (id, email, roles) => {
  try {
    const userRef = doc(db, "users_driverequipment", id);
    const userType = determineUserType(roles);
    await updateDoc(userRef, {
      email,
      userType,
      roles: {
        isAdmin: roles.isAdmin || false,
        isDriver: roles.isDriver || false,
        isEquipmentMan: roles.isEquipmentMan || false,
      },
    });
    const user = auth.currentUser;
    if (user && user.uid === id && user.email !== email) {
      await updateEmail(user, email);
    }
  } catch (error) {
    throw new Error("Failed to update user: " + error.message);
  }
};

export const deleteUser = async (id) => {
  try {
    await deleteDoc(doc(db, "users_driverequipment", id));
  } catch (error) {
    throw new Error("Failed to delete user: " + error.message);
  }
};

export const getUsers = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "users_driverequipment")
    );
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error("Failed to fetch users: " + error.message);
  }
};

export { firebaseSignOut };

const determineUserType = (roles) => {
  if (roles.isAdmin) return "admin";
  if (roles.isDriver && roles.isEquipmentMan) return "both";
  if (roles.isDriver) return "driver";
  if (roles.isEquipmentMan) return "equipmentMan";
  return "driver";
};
