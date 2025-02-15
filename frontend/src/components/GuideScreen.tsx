import React from "react";
import SiteNavigation from './SiteNavigation';
import "./GuideScreen.css";

const NETWORK = process.env.REACT_APP_NETWORK || "origin";
const { NETWORK_NAME, BACKPACK_GUIDE, NIGHTLY_GUIDE, OKX_GUIDE } = require("../config.json")[NETWORK];

const GuideScreen: React.FC = () => {
  return (
    <div className="guide-container-wrapper">
      <SiteNavigation />
      <div className="guide-container">
      <div className="toc">
          <h3>Contents</h3>
          <ul>
            <li><a href="#about">About the Game</a></li>
            <li><a href="#gameplay">Gameplay</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
          </ul>
        </div>

        <h1 id="about">About "Startup" Game</h1>
        <p>
          <b>Startup</b> is a fully on-chain business simulation game. Players purchase rooms to establish legal and
          illegal businesses, earn dirty and clean cash, convert illicit funds into legal money, recruit units to
          protect their businesses from police raids, or to attack NPC competitors in story mode. Players complete
          quests to earn <b>silver</b> tokens and experience points, which can be used to unlock new game features or
          spent on loot boxes and transferable assets after the Pre-season ends.
        </p>

        <h2 id="gameplay">Gameplay</h2>

        <h3>Resources</h3>
        <ul>
          <li>
            <b>Clean Cash:</b> Used to purchase or upgrade rooms (businesses) and recruit defensive enforcer units. Can
            only be collected through money laundering via legal businesses. There is a 30% loss when converting dirty
            cash to clean cash.
          </li>
          <li>
            <b>Dirty Cash:</b> Generated by illegal businesses. Used to recruit offensive hitmen units or laundered into
            clean cash.
          </li>
          <li>
            <b>Silver:</b> Earned through quests and used to upgrade loot boxes or unlock new game features.
          </li>
        </ul>

        <h3>Units</h3>
        <ul>
          <li>
            <b>Enforcer:</b> Defensive unit with 10 attack, 45 defense, and 25 carrying capacity (looted resources).
          </li>
          <li>
            <b>Hitman:</b> Offensive unit with 40 attack, 5 defense, and 5 carrying capacity.
          </li>
        </ul>

        <h3>Legal Businesses</h3>
        <p>
          Legal businesses generate clean cash by laundering dirty cash with a 30% loss. They can be upgraded to
          increase earnings:
        </p>
        <ul>
          <li>Laundry</li>
          <li>Fast Food Restaurant</li>
          <li>Fitness Center</li>
        </ul>

        <h3>Illegal Businesses</h3>
        <p>
          Illegal businesses generate dirty cash but must be laundered through legal businesses. They can also be
          upgraded:
        </p>
        <ul>
          <li>Unlicensed Bar</li>
          <li>Cannabis Farm</li>
          <li>Strip Club</li>
          <li>Casino</li>
        </ul>

        <h3>Supporting Rooms</h3>
        <ul>
          <li>
            <b>Saferoom:</b> Protects dirty cash from theft or police raids.
          </li>
          <li>
            <b>Security Room:</b> Allows you to recruit enforcers and hitmen for defense and offense.
          </li>
        </ul>

        <h2 id="how-it-works">How It Works</h2>

        <img src="/guide.png" alt="" />

        <h3>Purchasing Rooms</h3>
        <p>
          Players start with $500 of clean cash. This can be used to purchase both legal and illegal businesses. Each
          room type has a different cost and experience requirement.
        </p>

        <h3>Generating Cash</h3>
        <p>
          Each business generates cash every second based on its yield rate and storage capacity. You must manually
          collect cash. If the storage capacity is full, the business will stop generating cash until you collect it.
        </p>

        <h3>Laundering Money</h3>
        <p>
          Dirty cash generated from illegal businesses can be laundered through legal businesses. There is a 30% loss
          when converting dirty cash to clean cash.
        </p>
        <h2 id="pre-season-rewards">Pre-season Rewards</h2>
        <p>
          Players can earn valuable assets by being active in the game during Pre-Season.
        </p>
        <ul>
          <li>
            <b>Quests:</b> TBA
          </li>
          <li>
            <b>Leaderboard:</b> TBA
          </li>
          <li>
            <b>Loot boxes:</b> Players can upgrade their loot boxes by spending silver obtained via quests, raids, and game events. The higher the loot box level, the more valuable the rewards. Loot boxes open up to NFTs, WLs, silver, and other rewards after the pre-season concludes.
          </li>
        </ul>
        <div className="lootbox-images">
          <div className="lootbox common">
            <img src="/lootbox-1.png" alt="Common Lootbox" />
            <span>Common</span>
          </div>
          <div className="lootbox rare">
            <img src="/lootbox-2.png" alt="Rare Lootbox" />
            <span>Rare</span>
          </div>
          <div className="lootbox epic">
            <img src="/lootbox-3.png" alt="Epic Lootbox" />
            <span>Epic</span>
          </div>
          <div className="lootbox legendary">
            <img src="/lootbox-4.png" alt="Legendary Lootbox" />
            <span>Legendary</span>
          </div>
        </div>
        <p className="back-home">
          <a href="/">Back to the Home page</a>
        </p>
      </div>
    </div>
  );
};

export default GuideScreen;
