import React, { useState, useEffect } from "react";
import useProgram from "../hooks/useProgram";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import PurchaseModal from "./PurchaseModal";
import RoomDetailsModal from "./RoomDetailsModal";
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

  const legalRooms = [
    {
      name: "Laundry",
      roomType: { laundry: {} },
      description: "Clean your dirty clothes.",
      price: 100,
      yield: 10,
      capacity: 100,
      image: "/rooms/laundry.gif",
      levelRequirement: 0,
    },
    {
      name: "Fastfood",
      roomType: { fastFoodRestaurant: {} },
      description: "Serve delicious fast food.",
      price: 600,
      yield: 25,
      capacity: 200,
      image: "/rooms/fastFoodRestaurant.gif",
      levelRequirement: 100,
    },
    {
      name: "Fitness Center",
      roomType: { fitnessCenter: {} },
      description: "Keep fit and healthy.",
      price: 800,
      yield: 35,
      capacity: 300,
      image: "/rooms/fitnessCenter.png",
      levelRequirement: 200,
    },
  ];

  const illegalRooms = [
    {
      name: "Unlicensed Bar",
      roomType: { unlicensedBar: {} },
      description: "Run an unlicensed bar.",
      price: 400,
      yield: 60,
      capacity: 600,
      image: "/rooms/unlicensedBar.gif",
      levelRequirement: 0,
    },
    {
      name: "Cannabis Farm",
      roomType: { cannabisFarm: {} },
      description: "Grow cannabis.",
      price: 500,
      yield: 40,
      capacity: 400,
      image: "/rooms/cannabisFarm.gif",
      levelRequirement: 1,
    },
    {
      name: "Strip Club",
      roomType: { stripClub: {} },
      description: "Run a strip club.",
      price: 1500,
      yield: 70,
      capacity: 900,
      image: "/rooms/stripClub.png",
      levelRequirement: 6,
    },
    {
      name: "Casino",
      roomType: { casino: {} },
      description: "Run a casino.",
      price: 2000,
      yield: 50,
      capacity: 500,
      image: "/rooms/casino.gif",
      levelRequirement: 2,
    },
    {
      name: "Saferoom",
      roomType: { saferoom: {} },
      description: "Hide your illegal earnings.",
      price: 800,
      yield: 0,
      capacity: 700,
      image: "/rooms/saferoom.png",
      levelRequirement: 4,
    },
    {
      name: "Security Room",
      roomType: { securityRoom: {} },
      description: "Hire enforcers and hitmen.",
      price: 600,
      yield: 0,
      capacity: 800,
      image: "/rooms/securityRoom.gif",
      levelRequirement: 5,
    },
  ];

  const rooms = isLegal ? legalRooms : illegalRooms;
  console.log(selectedRoom);

  const getRoomImage = (roomType: any) => {
    const allRooms = [...legalRooms, ...illegalRooms];
    const matchedRoom = allRooms.find((room) => JSON.stringify(room.roomType) === JSON.stringify(roomType));
    return matchedRoom ? matchedRoom.image : "";
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
      {/* <RoomDetailsModal
            open={openDetailsModal}
            onClose={() => setOpenDetailsModal(false)}
            room={selectedRoom}
        /> */}
    </>
  );
};

export default Room;
