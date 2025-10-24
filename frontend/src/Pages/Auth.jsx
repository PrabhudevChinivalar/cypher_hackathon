import React, { useState } from "react";
import TermsModel from "../Components/TermsModel";
import "./Auth.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Auth() {
  const [role, setRole] = useState("Student");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [isLogin, setIsLogin] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModel, setShowTermsModel] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleRoleToggle = (roleType) => setRole(roleType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && !termsAccepted) {
      alert("You must accept the Terms & Conditions to register.");
      return;
    }

    if (isLogin) {
      const response = await axios.post("http://localhost:5000/api/auth/login", formData);
      if (response?.data?.token) {
        login(response.data.user, response.data.token);
        navigate(response?.data?.user?.role === "educator" ? "/educator" : "/student");
      }
    } else {
      const payload = { ...formData, role: role.toLowerCase() };
      const response = await axios.post("http://localhost:5000/api/auth/register", payload);
      if (response?.data) setIsLogin(true);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">{isLogin ? "Login" : `Register as ${role}`}</h2>

        {!isLogin && (
          <div className="role-toggle">
            <button type="button" className={role === "Student" ? "active" : ""} onClick={() => handleRoleToggle("Student")}>Student</button>
            <button type="button" className={role === "Educator" ? "active" : ""} onClick={() => handleRoleToggle("Educator")}>Educator</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
            </div>
          )}

          <div className="form-group">
            <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          </div>

          {!isLogin && (
            <div className="form-group">
              <button type="button" className="terms-btn" onClick={() => setShowTermsModel(true)}>
                Read & Accept Terms & Conditions
              </button>
              {termsAccepted && <span style={{ marginLeft: "10px", color: "green" }}>✔ Accepted</span>}
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={!isLogin && !termsAccepted}>
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="switch-auth">
          {isLogin ? (
            <>Don’t have an account? <span onClick={() => setIsLogin(false)}>Register</span></>
          ) : (
            <>Already have an account? <span onClick={() => setIsLogin(true)}>Login</span></>
          )}
        </p>
      </div>

      <TermsModel isOpen={showTermsModel} onClose={() => { setShowTermsModel(false); setTermsAccepted(true); }} />
    </div>
  );
}

export default Auth;
