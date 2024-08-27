import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SiteNavigation: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getNavLinkClass = (path: string) => {
    return location.pathname === path ? "nav-block active" : "nav-block";
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="top-navigation-bar">
      <div className="navigation-row">
        <div className="nav-left-block">
          <div className="hamburger-menu" onClick={toggleMenu}>
            ☰
          </div>
          <div className={`nav-links ${menuOpen ? "open" : ""}`}>
            <div className={getNavLinkClass("/")} onClick={() => navigate("/")}>
              <p className="block-title">Play</p>
            </div>
            <div className={getNavLinkClass("/inventory")} onClick={() => navigate("/inventory")}>
              <p className="block-title">Inventory</p>
            </div>
            <div className={getNavLinkClass("/leaderboard")} onClick={() => navigate("/leaderboard")}>
              <p className="block-title">Leaderboard</p>
            </div>
            <div className={getNavLinkClass("/guide")} onClick={() => navigate("/guide")}>
              <p className="block-title">How to play?</p>
            </div>
          </div>
        </div>

        <div className="nav-right-block">
          <a href="https://x.com/playstartupio" target="_blank" rel="noopener noreferrer" className="social-link">
            <img src="/icons/x.png" alt="Twitter" className="social-icon" style={{ width: "24px" }} />
          </a>
          <a href="https://discord.gg/fckhkP5p5Z" target="_blank" rel="noopener noreferrer" className="social-link">
            <img src="/icons/discord.png" alt="Discord" className="social-icon" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default SiteNavigation;
