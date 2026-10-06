import React from "react";
import "./style-royal-diamond-loader.css";

const RoyalDiamondLoader = () => {
  return (
    <div className="royalLoaderOverlay" role="status" aria-label="Loading Royal Jewelry">
      <div className="royalDiamondContainer">
        {/* Pulsing Outer Gold Aura */}
        <div className="royalAuraRing" />

        {/* Rotating Faceted Emerald Cut Diamond Frame SVG */}
        <svg
          className="royalDiamondSvg"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Octagonal Outer Ring */}
          <polygon
            points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30"
            stroke="#D4AF37"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Inner Facets */}
          <polygon
            points="36,15 64,15 85,36 85,64 64,85 36,85 15,64 15,36"
            stroke="url(#goldGradient)"
            strokeWidth="1"
            strokeDasharray="4 2"
            fill="none"
          />
          {/* Diamond Cut Lines */}
          <line x1="30" y1="5" x2="36" y2="15" stroke="#F3E5AB" strokeWidth="1" />
          <line x1="70" y1="5" x2="64" y2="15" stroke="#F3E5AB" strokeWidth="1" />
          <line x1="95" y1="30" x2="85" y2="36" stroke="#F3E5AB" strokeWidth="1" />
          <line x1="95" y1="70" x2="85" y2="64" stroke="#F3E5AB" strokeWidth="1" />
          <line x1="70" y1="95" x2="64" y2="85" stroke="#F3E5AB" strokeWidth="1" />
          <line x1="30" y1="95" x2="36" y2="85" stroke="#F3E5AB" strokeWidth="1" />
          <line x1="5" y1="70" x2="15" y2="64" stroke="#F3E5AB" strokeWidth="1" />
          <line x1="5" y1="30" x2="15" y2="36" stroke="#F3E5AB" strokeWidth="1" />

          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#F3E5AB" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
          </defs>
        </svg>

        {/* Central Monogram Emblem */}
        <div className="royalMonogramCenter">RJ</div>

        {/* Twinkling Diamond Star Flares */}
        <div className="sparkleStar starTopRight" />
        <div className="sparkleStar starBottomLeft" />
      </div>

      {/* Brand Identity */}
      <h2 className="royalBrandTitle">ROYAL JEWELRY</h2>
      <p className="royalSubtitle">HIGH JEWELRY & FINE TIMEPIECES</p>

      {/* Sweeping Gold Hairline Progress Bar */}
      <div className="royalProgressWrapper">
        <div className="royalProgressBar" />
      </div>
    </div>
  );
};

export default RoyalDiamondLoader;
