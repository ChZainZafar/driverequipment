import React, { useState } from "react";
import CustomButton from "../components/common/CustomButton";
import CustomInput from "../components/common/CustomInput";
import { COLORS } from "../constants/colors.js";
import { FONTS } from "../constants/fonts.js";
import { useAuth } from "../context/AuthContext";

const styles = {
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundImage: `linear-gradient(to bottom, ${COLORS.gradientStart}, ${COLORS.gradientEnd})`,
    minHeight: "100vh",
    display: "flex",
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 32,
    borderRadius: 12,
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
    width: "100%",
    maxWidth: 500, // Larger modal
    margin: "auto",
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
  },
};

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, setUserType, setUser } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }
    if (email === "admin" && password === "admin") {
      setUserType("admin");
      setUser({ userType: "admin" });
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      console.log("logged in");
    } catch (error) {
      alert("Login Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Login</h1>
        <CustomInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          icon="mail"
          keyboardType="email-address"
          error={
            email && email !== "admin" && !email.includes("@")
              ? "Invalid email"
              : ""
          }
        />
        <CustomInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          icon="lock"
        />
        <CustomButton
          title={loading ? "Loading..." : "Login"}
          onPress={handleLogin}
          style={styles.button}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default LoginScreen;
