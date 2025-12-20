import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/profile")
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
      <h2>Dashboard</h2>

      <p><b>Name:</b> {profile.fullName}</p>
      <p><b>Email:</b> {profile.email}</p>
      <p><b>Aadhaar:</b> {profile.aadhaar}</p>

      <hr />

      <p>
        <b>AI Security Status:</b>{" "}
        <span style={{ color: "green" }}>
          {profile.aiSecurityStatus}
        </span>
      </p>

      <p style={{ fontSize: "14px", color: "#475569" }}>
        {profile.aiMessage}
      </p>

      <button className="logout" onClick={handleLogout}>
        Logout
      </button>
      <button onClick={() => navigate("/admin")}>
       Go to Admin Dashboard
      </button>

    </motion.div>
  );
}
