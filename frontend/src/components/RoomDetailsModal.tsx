import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, Button, Slider } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import useProgram from "../hooks/useProgram";
import "../styles.css";
import "./RoomDetailsModal.css";

interface RoomDetailsModalProps {
  open: boolean;
  onClose: () => void;
  room: any;
}

const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({ open, onClose, room }) => {
  const [roomLevel, setRoomLevel] = useState<number>(0);
  const [enforcers, setEnforcers] = useState<number>(0);
  const [hitmen, setHitmen] = useState<number>(0);
  const [playerCash, setPlayerCash] = useState<{ cleanCash: number; dirtyCash: number }>({
    cleanCash: 0,
    dirtyCash: 0,
  });
  const [maxEnforcers, setMaxEnforcers] = useState<number>(0);
  const [maxHitmen, setMaxHitmen] = useState<number>(0);
  const [inventoryAccount, setInventoryAccount] = useState<any>(null);
  const [upgradeItem, setUpgradeItem] = useState<any>(null);

  const wallet = useWallet();
  const program = useProgram();

  const ENFORCER_COST = 50; // Clean cash
  const HITMAN_COST = 100; // Dirty cash

  const fetchPlayer = async () => {
    if (!wallet.connected || !wallet.publicKey || !program) return;

    const [playerPda] = await PublicKey.findProgramAddress(
      [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      // @ts-ignore
      const playerAccount = await program.account.player.fetch(playerPda);
      const activeRoom = playerAccount.rooms.find(
        (roomInAccount: any) => JSON.stringify(roomInAccount.roomType) === JSON.stringify(room.roomType)
      );
      if (activeRoom) {
        setRoomLevel(activeRoom.level.toNumber());
      }
      const cleanCash = playerAccount.cleanCash.toNumber();
      const dirtyCash = playerAccount.dirtyCash.toNumber();
      setPlayerCash({ cleanCash, dirtyCash });

      // Calculate max enforcers and hitmen based on available cash
      setMaxEnforcers(Math.floor(cleanCash / ENFORCER_COST));
      setMaxHitmen(Math.floor(dirtyCash / HITMAN_COST));

      try {
        const [inventoryPda] = await PublicKey.findProgramAddress(
          [Buffer.from("INVENTORY"), wallet.publicKey.toBuffer()],
          program.programId
        );
        // @ts-ignore
        const inventory = await program.account.inventory.fetch(inventoryPda);
        setInventoryAccount(inventory);
        if (inventory && inventory.items.length > 0 && room.upgradeItem) {
          // find if player has required item in inventory
          const playerHasItem = inventory.items.find((item: any) => item[room.upgradeItem.name]);
          if (playerHasItem) {
            setUpgradeItem(room.upgradeItem);
          }
        }
      } catch (err) {
        console.log("Inventory account not initialized");
        setInventoryAccount(null);
      }

      return playerAccount;
    } catch (err) {
      console.error("Failed to fetch balances", err);
    }
  };

  useEffect(() => {
    fetchPlayer();
  }, [open]);

  const handleUpgrade = async () => {
    if (!wallet.connected || !wallet.publicKey || !program) return;
  };

  const handleRecruit = async () => {
    if (!wallet.connected || !wallet.publicKey || !program) return;

    try {
      const [playerPda] = await PublicKey.findProgramAddress(
        [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
        program.programId
      );
      console.log(`Recruiting ${enforcers} enforcers and ${hitmen} hitmen...`);
      await program.methods
        .recruitUnits(new anchor.BN(enforcers), new anchor.BN(hitmen))
        .accounts({
          player: playerPda,
          owner: wallet.publicKey,
        })
        .rpc();

      setEnforcers(0);
      setHitmen(0);

      fetchPlayer();
    } catch (err) {
      console.error("Failed to recruit units", err);
    }
  };

  const handleSliderChange = (event: any, newValue: number | number[], unitType: string) => {
    if (typeof newValue === "number") {
      if (unitType === "enforcers") setEnforcers(newValue);
      else if (unitType === "hitmen") setHitmen(newValue);
    }
  };

  const nextLevel = roomLevel + 1;
  const nextYield = nextLevel * room.yield;
  const nextCapacity = nextLevel * room.capacity;
  const nextCost = nextLevel * 10000;

  return (
    <Modal open={open} onClose={onClose} className="room-details-modal">
      <Box className="modal-box">
        <Typography variant="h6">{room.name}</Typography>
        <Typography className="room-description">{room.description}</Typography>
        <hr />
        {room.name !== "Security Room" && (
          <>
            <Box display="flex" justifyContent="space-between">
              <Box width="48%">
                <pre>
                  <b>Current Level:</b> {roomLevel}
                </pre>
                <pre>Yield: ${room.yield}/min</pre>
                <pre>Max Capacity: ${room.capacity}</pre>
              </Box>

              {room.upgradeItem && (
                <Box width="48%">
                  <pre>
                    <b>Next Level:</b> {nextLevel}
                  </pre>
                  <pre>Yield: ${nextYield}/min</pre>
                  <pre>Max Capacity: ${nextCapacity}</pre>
                  <pre style={{ display: "flex", alignItems: "center" }}>
                    Upgrade item: <img src={room.upgradeItem.image} width="50" alt={room.upgradeItem.name} />
                  </pre>
                </Box>
              )}
            </Box>

            <hr />
          </>
        )}

        {/* Show recruitment interface only for Security Room */}
        {room.name === "Security Room" && (
          <>
            <Typography variant="h6">Recruit Units</Typography>
            <Box mt={2}>
              <Typography>
                <b>Enforcers</b> - ${ENFORCER_COST}{" "}
                <img src="/clean-money.png" width="24" alt="clean cash" style={{ verticalAlign: "middle" }} />
              </Typography>
              <Slider
                value={enforcers}
                min={0}
                max={maxEnforcers}
                onChange={(e, val) => handleSliderChange(e, val, "enforcers")}
                step={1}
                style={{ color: "#f2b24e" }}
              />
              <pre>
                Selected: {enforcers} | Cost: ${enforcers * ENFORCER_COST}
              </pre>

              <Box mt={2}>
                <Typography>
                  <b>Hitmen</b> - ${HITMAN_COST}{" "}
                  <img src="/dirty-money.png" width="24" alt="dirty cash" style={{ verticalAlign: "middle" }} />
                </Typography>
                <Slider
                  value={hitmen}
                  min={0}
                  max={maxHitmen}
                  onChange={(e, val) => handleSliderChange(e, val, "hitmen")}
                  step={1}
                  style={{ color: "#f2b24e" }}
                />
                <pre>
                  Selected: {hitmen} | Cost: ${hitmen * HITMAN_COST}
                </pre>
              </Box>
            </Box>
          </>
        )}

        <Box display="flex" justifyContent="space-between" mt={2}>
          {room.name === "Security Room" && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleRecruit}
              disabled={enforcers === 0 && hitmen === 0}
            >
              Recruit
            </Button>
          )}

          {room.upgradeItem && (
            <Button variant="contained" color="primary" onClick={handleUpgrade} disabled={!upgradeItem}>
              {upgradeItem ? "Upgrade" : "Missing required loot item"}
            </Button>
          )}

          <Button
            variant="contained"
            color="primary"
            style={{ backgroundColor: "transparent", color: "#ffffff" }}
            className="close"
            onClick={onClose}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default RoomDetailsModal;
