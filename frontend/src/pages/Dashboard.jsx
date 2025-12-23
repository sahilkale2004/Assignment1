import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/auth/profile")
      .then((res) => setProfile(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/");
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!profile) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <motion.div
      className="dashboard"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2>User Dashboard</h2>

      <p><b>Name:</b> {profile.fullName}</p>
      <p><b>Email:</b> {profile.email}</p>
      <p><b>Role:</b> {profile.role}</p>

      <hr />

      <p>
        <b>AI Risk Level:</b>{" "}
        <span
          style={{
            color:
              profile.aiRiskLevel === "LOW"
                ? "green"
                : profile.aiRiskLevel === "MEDIUM"
                ? "orange"
                : "red",
          }}
        >
          {profile.aiRiskLevel}
        </span>
      </p>

      <p><b>AI Risk Score:</b> {profile.aiScore}</p>

      {profile.role === "admin" && (
        <button onClick={() => navigate("/admin")}>
          👑 Go to Admin Dashboard
        </button>
      )}

      <button onClick={handleLogout}>Logout</button>
    </motion.div>
  );
}
