import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/admin/users")
      .then((res) => setUsers(res.data))
      .catch(() => {
        alert("Admin access only");
        navigate("/dashboard");
      });
  }, [navigate]);

  return (
    <div className="dashboard">
      <h2>👑 Admin Dashboard</h2>

      {users.map((user) => (
        <div key={user._id} className="card">
          <p><b>Name:</b> {user.fullName}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Role:</b> {user.role}</p>
          <p>
            <b>Joined:</b>{" "}
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
