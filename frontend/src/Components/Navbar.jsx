import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
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
        <div className="navbar-logo">EngJobHub</div>

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
              Home
            </Link>
            <Link
              to="/opportunities"
              className="nav-link"
              onClick={() => setIsOpen(false)}
            >
              Opportunities
            </Link>
            <Link
              to="/services"
              className="nav-link"
              onClick={() => setIsOpen(false)}
            >
              Services
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
