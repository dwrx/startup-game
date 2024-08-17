import React, { useState, useEffect } from "react";
import useProgram from "../hooks/useProgram";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import PurchaseModal from "./PurchaseModal";
import RoomDetailsModal from "./RoomDetailsModal";
import { legalRooms, illegalRooms } from "../rooms";
import "../styles.css";

interface RoomProps {
  className: string;
  isLegal: boolean;
  playerCash: number;
  playerLevel: number;
  roomData?: any;
  roomType?: any;
  onPurchase: (room: any, isLegal: boolean) => void;
}

const Room: React.FC<RoomProps> = ({ className, isLegal, playerCash, playerLevel, roomData, onPurchase }) => {
  const [purchased, setPurchased] = useState(!!roomData);
  const [openPurchaseModal, setOpenPurchaseModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(roomData || null);

  useEffect(() => {
    if (roomData) {
      setPurchased(true);
      setSelectedRoom(roomData);
    }
  }, [roomData]);
  const wallet = useWallet();
  const program = useProgram();

  useEffect(() => {
    if (roomData) {
      setPurchased(true);
      setSelectedRoom(roomData);
    }
  }, [roomData]);

  const rooms = isLegal ? legalRooms : illegalRooms;
  console.log(selectedRoom);

  const getRoomImage = (roomType: any) => {
    const allRooms = [...legalRooms, ...illegalRooms];
    const matchedRoom = allRooms.find((room) => JSON.stringify(room.roomType) === JSON.stringify(roomType));
    return matchedRoom ? matchedRoom.image : "";
  };

  const getRoomDetails = (roomType: any) => {
    const allRooms = [...legalRooms, ...illegalRooms];
    const matchedRoom = allRooms.find((room) => JSON.stringify(room.roomType) === JSON.stringify(roomType));
    return matchedRoom || null;
  };

  const handlePurchase = async (room: any) => {
    if (!wallet.publicKey || !program) return;

    const [playerPda] = await PublicKey.findProgramAddress(
      [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .purchaseRoom(room.roomType)
        .accounts({
          player: playerPda,
          owner: wallet.publicKey,
          systemProgram: PublicKey.default,
        })
        .rpc();

      setPurchased(true);
      setSelectedRoom(room);
      onPurchase(room, isLegal);
      setOpenPurchaseModal(false);
    } catch (err) {
      console.error("Failed to purchase room:", err);
    }
  };

  return (
    <>
      <div className={className} onClick={() => (purchased ? setOpenDetailsModal(true) : setOpenPurchaseModal(true))}>
        {purchased ? (
          <div className="room-content">
            <img src={getRoomImage(selectedRoom.roomType)} alt={selectedRoom.name} />
          </div>
        ) : (
          <div className="room-placeholder">
            <p>Click to purchase</p>
          </div>
        )}
      </div>
      <PurchaseModal
        open={openPurchaseModal}
        onClose={() => setOpenPurchaseModal(false)}
        rooms={rooms}
        onPurchase={handlePurchase}
        playerCash={playerCash}
        playerLevel={playerLevel}
      />
      {purchased && (
        <RoomDetailsModal
          open={openDetailsModal}
          onClose={() => setOpenDetailsModal(false)}
          room={getRoomDetails(selectedRoom.roomType)}
        />
      )}
    </>
  );
};

export default Room;
