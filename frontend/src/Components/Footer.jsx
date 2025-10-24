import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>EngJobHub</h3>
          <p>Your platform to learn and grow your skills online.</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/auth">Login/Register</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="#" target="_blank" rel="Instagram"><i class="fa-brands fa-square-instagram"></i></a>
            <a href="#" target="_blank" rel="Linkedin"><i class="fa-brands fa-linkedin"></i></a>
            <a href="#" target="_blank" rel="Facebook"><i class="fa-brands fa-square-facebook"></i></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} EngJobHub. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
