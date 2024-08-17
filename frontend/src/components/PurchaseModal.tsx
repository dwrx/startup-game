import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, Button, Grid } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import useProgram from "../hooks/useProgram";
import "../styles.css";

interface RoomInfo {
  name: string;
  description: string;
  price: number;
  yield: number;
  capacity: number;
  image: string;
  levelRequirement: number;
  roomType: any;
}

interface PurchaseModalProps {
  open: boolean;
  onClose: () => void;
  rooms: RoomInfo[];
  onPurchase: (room: RoomInfo) => void;
  playerCash: number;
  playerLevel: number;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ open, onClose, rooms, onPurchase, playerCash, playerLevel }) => {
  const wallet = useWallet();
  const program = useProgram();
  const [playerData, setPlayerData] = useState<any>(null);

  const fetchPlayerData = async () => {
    if (!wallet.publicKey || !program) return;

    const [playerPda] = await PublicKey.findProgramAddress(
      [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      // @ts-ignore
      const playerAccount = await program.account.player.fetch(playerPda);
      setPlayerData(playerAccount);
      console.log(playerAccount.rooms);
    } catch (err) {
      console.error("Failed to fetch player data", err);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPlayerData();
    }
  }, [open]);

  const isRoomPurchased = (roomType: any) => {
    if (!playerData) return false;
    return playerData.rooms.some(
      (purchasedRoom: any) => JSON.stringify(purchasedRoom.roomType) === JSON.stringify(roomType)
    );
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box className="modal-box">
        <Grid container spacing={2}>
          {rooms.map((room) => (
            <Grid item xs={12} sm={6} md={4} key={room.name}>
              <Box className="room-option">
                <img src={room.image} alt={room.name} className="room-image" />
                <Typography variant="h6">{room.name}</Typography>
                {/* <Typography>{room.description}</Typography> */}
                <pre>
                  {/* <p>Price: ${room.price}</p> */}
                  <p>Yield: {room.yield}/min</p>
                  <p>Capacity: {room.capacity}</p>
                </pre>
                {playerData && !isRoomPurchased(room.roomType) ? (
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ marginTop: "0px" }}
                    onClick={() => onPurchase(room)}
                    disabled={
                      playerData.cleanCash.toNumber() < room.price ||
                      playerData.experience.toNumber() < room.levelRequirement
                    }
                  >
                    {playerData.experience.toNumber() < room.levelRequirement
                      ? "Not enough XP"
                      : playerData.cleanCash.toNumber() < room.price
                      ? `Buy for $${room.price}`
                      : `Buy for $${room.price}`}
                  </Button>
                ) : isRoomPurchased(room.roomType) ? (
                  "✅ Purchased"
                ) : (
                  ""
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Modal>
  );
};

export default PurchaseModal;
