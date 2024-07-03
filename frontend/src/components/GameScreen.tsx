import React from "react";
import "../styles.css";
import Navbar from "./Navbar";
import Room from "./Room";

const GameScreen: React.FC = () => {
  return (
    <div className="game-screen">
      <Navbar />
      <div className="game-container">
        <div className="background">
          <Room className="room room-1" />
          <Room className="room room-2" />
          <Room className="room room-3" />
          <Room className="room room-4" />
          <Room className="room room-5" />
          <Room className="room room-6" />
          <Room className="room room-7" />
          <Room className="room room-8" />
          <Room className="room room-9" />
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
