// src/pages/Home/Homepage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";

// Import your video
import heroVideo from "../../assets/videos/Intrance Video.mp4";
import mustLogo from "../../assets/react.svg";
function Homepage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState("");

  // Smooth scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animated counter for stats
  const AnimatedCounter = ({ end, duration, suffix = "" }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }, [end, duration]);

    return (
      <span>
        {count.toLocaleString()}
        {suffix}
      </span>
    );
  };

  return (
    <div className="homepage">
      {/* NAVIGATION BAR */}
      <nav className="navbar">
       <div className="nav-container">
        <div className="nav-logo" onClick={() => navigate("/")}>
          <img  
            src={mustLogo} 
            alt="MUST Logo" 
            className="nav-logo-img" 
          />
          <span className="logo-text">MUST-Gate</span>
        </div>

          <ul className="nav-menu">
            <li>
              <a href="#home">Home</a>
            </li>
            <li>
              <a href="#how-it-works">How It Works</a>
            </li>
            <li>
              <a href="#benefits">Benefits</a>
            </li>
            <li>
              <a href="#coverage">Coverage</a>
            </li>
            <li>
              <a href="#faq">FAQ</a>
            </li>
          </ul>

          <div className="nav-actions">
            <button
              className="nav-btn btn-login"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className="nav-btn btn-signup"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION WITH VIDEO BACKGROUND */}
      <section className="hero" id="home">
        {/* Video Background */}
        <video className="hero-video" autoPlay loop muted playsInline>
          <source src={heroVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="hero-overlay"></div>
          <div className="hero-logo-container" style={{ textAlign: 'center', marginBottom: '15px' }}>
          
          </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span>🇪🇬 Official Government Initiative</span>
          </div>

          <h1 className="hero-title">
            Where Innovation is a MUST <br />
            Effortless Gate Payments —<br />
            Drive In, We'll Handle the Rest
          </h1>

          <p className="hero-subtitle">
            The MUST-Have Solution for Smart Traffic — no cash, no delays.
            <br />
            Register once and your vehicle's entry fees are charged
            automatically as you pass through.
          </p>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">
                <AnimatedCounter end={50000} duration={2000} suffix="+" />
              </div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                <AnimatedCounter end={150} duration={2000} suffix="+" />
              </div>
              <div className="stat-label">Participating Gates</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                <AnimatedCounter end={99} duration={2000} suffix=".9%" />
              </div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>

          <div className="hero-cta">
            <button
              className="btn-primary btn-large"
              onClick={() => navigate("/signup")}
            >
              Create Your Account
              <span className="btn-arrow">→</span>
            </button>
            <button
              className="btn-secondary btn-large"
              onClick={() =>
                document
                  .getElementById("how-it-works")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              Learn More
              <span className="btn-arrow">→</span>
            </button>
          </div>

          <div className="hero-trust-badges">
            <div className="trust-badge">🔒 Bank-Level Security</div>
            <div className="trust-badge">✓ Government Certified</div>
            <div className="trust-badge">⚡ Instant Processing</div>
          </div>
        </div>

        <div className="scroll-indicator">
          <span>Scroll to explore</span>
          <div className="scroll-arrow">↓</div>
        </div>
      </section>


      {/* FAQ SECTION */}
      <section className="faq-section" id="faq">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Everything you need to know about GatePass
            </p>
          </div>

          <div className="faq-grid">
            <div className="faq-item">
              <h3 className="faq-question">How do I register for GatePass?</h3>
              <p className="faq-answer">
                Simply click "Create Account", provide your vehicle information
                and link a payment method. The entire process takes less than 5
                minutes.
              </p>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">
                Is my payment information secure?
              </h3>
              <p className="faq-answer">
                Absolutely. We use bank-level encryption and never store your
                raw card details. All transactions are processed through
                PCI-compliant payment partners.
              </p>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">
                What happens if I'm charged incorrectly?
              </h3>
              <p className="faq-answer">
                You can dispute any charge through your dashboard. We review all
                disputes within 48 hours and issue refunds for any errors
                immediately.
              </p>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">Which gates support GatePass?</h3>
              <p className="faq-answer">
                We're active at 150+ gates across 27 governorates and expanding.
                Check the coverage map above or your dashboard for the most
                current list.
              </p>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">
                Can I use GatePass with multiple vehicles?
              </h3>
              <p className="faq-answer">
                Yes! You can register multiple vehicles under one account and
                manage all payments from a single dashboard.
              </p>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">Are there any monthly fees?</h3>
              <p className="faq-answer">
                No monthly fees. You only pay the standard gate entry fees. We
                don't add any additional charges or transaction fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">
              Ready to Experience Seamless Gate Payments?
            </h2>
            <p className="cta-description">
              Join thousands of drivers who have already made the switch to
              automated gate payments.
            </p>
            <div className="cta-buttons">
              <button
                className="btn-primary btn-large"
                onClick={() => navigate("/signup")}
              >
                Create Your Account Now
                <span className="btn-arrow">→</span>
              </button>
              <button
                className="btn-secondary btn-large"
                onClick={() => navigate("/contact")}
              >
                Contact Support
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-main">
            <div className="footer-section">
              <div className="footer-logo">
                <span className="logo-text">GatePass</span>
              </div>
              <p className="footer-description">
                Automating vehicle entry payments across Egypt. Drive
                seamlessly, pay automatically.
              </p>
              <div className="footer-social">
                <a href="#" className="social-link">
                  Facebook
                </a>
                <a href="#" className="social-link">
                  Twitter
                </a>
                <a href="#" className="social-link">
                  LinkedIn
                </a>
              </div>
            </div>

            <div className="footer-section">
              <h4 className="footer-title">Quick Links</h4>
              <ul className="footer-links">
                <li>
                  <a href="/about">About Us</a>
                </li>
                <li>
                  <a href="/how-it-works">How It Works</a>
                </li>
                <li>
                  <a href="/coverage">Coverage Map</a>
                </li>
                <li>
                  <a href="/faq">FAQ</a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-title">Support</h4>
              <ul className="footer-links">
                <li>
                  <a href="/support">Help Center</a>
                </li>
                <li>
                  <a href="/contact">Contact Us</a>
                </li>
                <li>
                  <a href="/refund">Refund Policy</a>
                </li>
                <li>
                  <a href="/dispute">Dispute Resolution</a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-title">Legal</h4>
              <ul className="footer-links">
                <li>
                  <a href="/terms">Terms of Service</a>
                </li>
                <li>
                  <a href="/privacy">Privacy Policy</a>
                </li>
                <li>
                  <a href="/cookies">Cookie Policy</a>
                </li>
                <li>
                  <a href="/compliance">Compliance</a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-title">Contact</h4>
              <div className="footer-contact">
                <p>📧 support@gatepass.eg</p>
                <p>📞 +20 123 456 7890</p>
                <p>🕐 Available 24/7</p>
                <p>📍 Cairo, Egypt</p>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>
              &copy; 2025 GatePass. All rights reserved. A Ministry of Transport
              Initiative.
            </p>
            <div className="footer-badges">
              <span className="footer-badge">🇪🇬 Made in Egypt</span>
              <span className="footer-badge">🔒 Secure</span>
              <span className="footer-badge">✓ Certified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;
