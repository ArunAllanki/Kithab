// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login.jsx";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          
          <Route path="/" element={<StudentDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/faculty" element={<FacultyDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
