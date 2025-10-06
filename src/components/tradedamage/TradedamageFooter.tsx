'use client';

export default function TradedamageFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="tradedamage-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">⚔️</span>
              <span className="logo-text">TRADEdamage</span>
            </div>
            <p className="footer-description">
              The ultimate trading combat experience. Deal to Die.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Discord">
                <span>💬</span>
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <span>🐦</span>
              </a>
              <a href="#" className="social-link" aria-label="YouTube">
                <span>📺</span>
              </a>
              <a href="#" className="social-link" aria-label="GitHub">
                <span>🐙</span>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Game</h4>
            <ul className="footer-links">
              <li><a href="#gameplay">Gameplay</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#screenshots">Screenshots</a></li>
              <li><a href="#tech">Technology</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Community</h4>
            <ul className="footer-links">
              <li><a href="#">Discord Server</a></li>
              <li><a href="#">Forums</a></li>
              <li><a href="#">Tournaments</a></li>
              <li><a href="#">Leaderboards</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Support</h4>
            <ul className="footer-links">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Bug Reports</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} TRADEdamage. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <a href="#">Terms of Service</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
