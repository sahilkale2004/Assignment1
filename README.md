📘 Secure User Profile & Access Control System
🔍 Project Overview

This project implements Assignment 1: Secure User Profile & Access Control System, focused on building a secure identity management microservice.

Problem Statement

To design a system that securely manages user identity and profile data, supports authentication using JWT, encrypts sensitive data (Aadhaar/ID number), and provides controlled access to user information.

Implementation Approach

Implemented a Node.js + Express backend with JWT-based authentication.

Used MongoDB (Mongoose) for storing user profiles.

Applied AES-256 encryption for Aadhaar/ID numbers at rest.

Built a React (Vite) frontend for login, registration, and profile viewing.

Added role-based access control (Admin/User).

Integrated AI-assisted validation logic to analyze Aadhaar numbers for risk detection.

⚙️ Setup & Run Instructions
🔧 Prerequisites

Node.js (v18+ recommended)

npm or yarn

MongoDB Atlas account (or local MongoDB)

🛠 Backend Setup
cd backend
npm install

Create .env file in /backend
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/identity_vault
JWT_SECRET=supersecretjwtkey
AES_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
AES_IV=abcdef9876543210abcdef9876543210

Run Backend Server
npm start


Backend will run at:

http://localhost:5000

🖥 Frontend Setup
cd frontend
npm install

Create .env file in /frontend
VITE_API_BASE_URL=http://localhost:5000/api

Run Frontend
npm run dev


Frontend will run at:

http://localhost:5173

🔗 API Documentation
🔐 Authentication APIs
Method	Endpoint	Description
POST	/api/register	Register new user
POST	/api/login	Login and receive JWT
GET	/api/profile	Fetch authenticated user profile
👑 Admin APIs
Method	Endpoint	Description
GET	/api/admin/users	View all users (Admin only)

🔒 Protected Routes

Require JWT in header:

Authorization: Bearer <token>

🗄 Database Schema (MongoDB)
🧾 User Collection
{
  fullName: String,
  email: String (unique),
  passwordHash: String,
  aadhaarEncrypted: String,
  role: "user" | "admin",
  aiRiskLevel: String,
  aiScore: Number,
  createdAt: Date,
  updatedAt: Date
}

🔐 Security Notes

Passwords are stored using bcrypt hashing

Aadhaar numbers are stored using AES-256 encryption

Decryption occurs only when returning authenticated profile data

🤖 AI Tool Usage Log (MANDATORY)
Task	AI Tool Usage
JWT token validation middleware	AI-assisted generation
AES-256 encryption/decryption utility	AI-assisted logic design
Aadhaar risk analysis logic	AI-assisted rule generation
MongoDB schema design	AI-assisted modeling
Role-based access control	AI-assisted design
Debugging authentication issues	AI-assisted troubleshooting
README structure & documentation	AI-assisted content generation
📊 Effectiveness Score

AI Effectiveness Score: 4 / 5 ⭐⭐⭐⭐☆

Justification:

AI tools significantly improved development speed for authentication, encryption, and validation logic.

Reduced debugging time during complex security integration.

Manual effort was still required for database permissions and deployment configuration.

✅ Assignment Coverage Checklist

✔ JWT Authentication

✔ Encrypted Aadhaar storage (AES-256)

✔ Secure profile retrieval

✔ Role-based access control

✔ Frontend dashboard

✔ Error handling

✔ AI-assisted validation & tooling

🏁 Conclusion

This project successfully demonstrates a secure identity management system with strong emphasis on data security, access control, and AI-assisted validation, fully satisfying Assignment 1 requirements.
