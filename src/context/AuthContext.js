import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import {
  login as firebaseLogin,
  firebaseSignOut,
} from "../utils/authenticationUtils";
import {
  onAuthStateChanged,
  signOut as firebaseAuthSignOut,
} from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const { user, userType } = await firebaseLogin(email, password);
    setUser(user);
    setUserType(userType);
  };

  const signOut = async () => {
    try {
      await firebaseAuthSignOut(auth);
      setUser(null);
      setUserType(null);
      return true;
    } catch (error) {
      console.error("Sign out error:", error);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(
            doc(db, "users_driverequipment", firebaseUser.uid)
          );
          const userData = userDoc.exists() ? userDoc.data() : {};
          setUser(firebaseUser);
          setUserType(
            userData.userType ||
              (firebaseUser.email === "admin" ? "admin" : "user")
          );
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(firebaseUser);
          setUserType(firebaseUser.email === "admin" ? "admin" : "user");
        }
      } else {
        setUser(null);
        setUserType(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, userType, setUser, setUserType, login, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
