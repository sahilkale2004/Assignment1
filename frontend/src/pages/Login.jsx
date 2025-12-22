import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <motion.form
      className="auth-card"
      onSubmit={handleLogin}
      initial={{ opacity: 0, scale: 0.95, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h2>Secure Identity Vault</h2>
      <p style={{ textAlign: "center", color: "#64748b", marginBottom: "20px" }}>
        Login to access your encrypted profile
      </p>

      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit">Login</button>

      <p style={{ textAlign: "center", marginTop: "14px", fontSize: "14px" }}>
        New user? <Link to="/register">Create an account</Link>
      </p>

      {/* Admin hint box */}
      <div
        style={{
          marginTop: "18px",
          padding: "12px",
          background: "#f1f5f9",
          borderRadius: "8px",
          fontSize: "13px",
          color: "#334155",
        }}
      >
        <strong>Admin Demo:</strong>
        <br />
        Email: <code>secondcount18@outlook.com</code>
        <br />
        Password: <code>123456</code>
      </div>
    </motion.form>
  );
}
