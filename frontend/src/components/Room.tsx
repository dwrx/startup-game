import React, { useState } from 'react';
import '../index.css';

interface RoomProps {
    className: string;
}

const Room: React.FC<RoomProps> = ({ className }) => {
    const [purchased, setPurchased] = useState(false);

    const handlePurchase = () => {
        setPurchased(true);
    };

    function getRandomNumber(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    return (
        <div className={className} onClick={handlePurchase}>
            {purchased ? (
                <div className="room-content">
                    <img src={`/rooms/${getRandomNumber(1,9)}.png`} alt="Room" />
                </div>
            ) : (
                <div className="room-placeholder">
                    <p>Click to purchase</p>
                </div>
            )}
        </div>
    );
};

export default Room;
