import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../Assets/kithabImg.png";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      logout(); // clears token and user in context
      navigate("/"); // navigate after logout
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="Logo" className="navbar-logo" />
      </div>
      <div className="navbar-right">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
