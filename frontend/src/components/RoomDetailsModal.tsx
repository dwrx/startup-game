import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, Button, TextField } from "@mui/material";
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
  const [enforcers, setEnforcers] = useState<number>(0);
  const [hitmen, setHitmen] = useState<number>(0);
  const [sufficientFunds, setSufficientFunds] = useState<{ enforcers: boolean; hitmen: boolean }>({
    enforcers: true,
    hitmen: true,
  });

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
      const hasEnoughCleanCash = playerAccount.cleanCash.toNumber() >= enforcers * ENFORCER_COST;
      const hasEnoughDirtyCash = playerAccount.dirtyCash.toNumber() >= hitmen * HITMAN_COST;
      setSufficientFunds({ enforcers: hasEnoughCleanCash, hitmen: hasEnoughDirtyCash });

      return playerAccount;
    } catch (err) {
      console.error("Failed to fetch balances", err);
    }
  };

  useEffect(() => {
    fetchPlayer();
  }, [enforcers, hitmen, wallet.publicKey]);

  const handleRecruit = async () => {
    if (!wallet.connected || !wallet.publicKey || !program) return;

    try {
      const [playerPda] = await PublicKey.findProgramAddress(
        [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
        program.programId
      );

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

  return (
    <Modal open={open} onClose={onClose} className="room-details-modal">
      <Box className="modal-box">
        <Typography variant="h6">{room.name}</Typography>
        <Typography className="room-description">{room.description}</Typography>
        <hr />
        {room.name !== "Security Room" && (
          <>
            <Typography>Yield: ${room.yield}/min</Typography>
            <Typography>Max capacity: ${room.capacity}</Typography>
            <Typography>Level: 1</Typography>
            <hr />
          </>
        )}

        {/* Show recruitment interface only for Security Room */}
        {room.name === "Security Room" && (
          <>
            <Typography variant="h6">Recruit Units</Typography>
            <Box mb={2}>
              <TextField
                className="recruitment-input"
                label="Enforcers"
                type="number"
                InputProps={{
                  inputProps: {
                    min: 0,
                  },
                }}
                value={enforcers}
                onChange={(e) => setEnforcers(parseInt(e.target.value))}
                fullWidth
                margin="normal"
                helperText={`Price: $${ENFORCER_COST} clean cash each`}
                error={!sufficientFunds.enforcers}
                //disabled={player.clean_cash < ENFORCER_COST}
              />
              <TextField
                className="recruitment-input"
                label="Hitmen"
                type="number"
                InputProps={{
                  inputProps: {
                    min: 0,
                  },
                }}
                value={hitmen}
                onChange={(e) => setHitmen(parseInt(e.target.value))}
                fullWidth
                margin="normal"
                helperText={`Price: $${HITMAN_COST} dirty cash each`}
                error={!sufficientFunds.hitmen}
                //disabled={player.dirty_cash < HITMAN_COST}
              />
            </Box>
          </>
        )}

        <Box display="flex" justifyContent="space-between" mt={2}>
          {room.name === "Security Room" && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleRecruit}
              disabled={!sufficientFunds.enforcers || !sufficientFunds.hitmen || (enforcers === 0 && hitmen === 0)}
            >
              Recruit
            </Button>
          )}

          <Button variant="contained" color="primary" className="close" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default RoomDetailsModal;
