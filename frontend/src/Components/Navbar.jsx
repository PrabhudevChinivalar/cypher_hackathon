import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import PendulumAnimation from "./PendulumAnimation";
import BeakerAnimation from "./BeakerAnimation";
import CalculusAnimation from "./CalculusAnimation";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    navigate("/");
    setTimeout(() => {
      logout();
    }, 100);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <div className="logo-content">
            <div className="logo-icon">
              <PendulumAnimation size="small" color="#00c6ff" />
            </div>
            <div className="logo-text-container">
              <span className="logo-text">SciLearnHub</span>
              <span className="logo-subtitle">Scientific Learning Platform</span>
            </div>
          </div>
        </div>

        <div
          className={`menu-toggle ${isOpen ? "active" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className={`nav-menu ${isOpen ? "open" : ""}`}>
          <div className="navbar-links">
            <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>
              <div className="nav-icon">
                <BeakerAnimation size="small" liquidColor="#4CAF50" />
              </div>
              <div className="nav-text">
                <span className="nav-label">Laboratory</span>
                <span className="nav-desc">Chemistry & Experiments</span>
              </div>
            </Link>
            <Link
              to="/opportunities"
              className="nav-link mathematics-link"
              onClick={() => setIsOpen(false)}
            >
              <div className="nav-icon mathematics-icon">
                <CalculusAnimation type="equation" size="small" />
              </div>
              <div className="nav-text mathematics-text">
                <span className="nav-label">Mathematics</span>
                <span className="nav-desc">Calculus & Analysis</span>
              </div>
            </Link>
            <Link
              to="/services"
              className="nav-link"
              onClick={() => setIsOpen(false)}
            >
              <div className="nav-icon">
                <PendulumAnimation size="small" color="#ff6b6b" />
              </div>
              <div className="nav-text">
                <span className="nav-label">Physics</span>
                <span className="nav-desc">Mechanics & Waves</span>
              </div>
            </Link>
          </div>

          <div className="navbar-search">
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
            />
            <button className="search-button">🔍</button>
          </div>

          {isAuthenticated ? (
            <button className="register-button" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link
              to="/auth"
              className="register-button"
              onClick={() => setIsOpen(false)}
            >
              Register
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
