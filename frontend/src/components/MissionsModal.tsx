import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import useProgram from "../hooks/useProgram";
import "../styles.css";

interface MissionsModalProps {
  open: boolean;
  onClose: () => void;
}

const missions: { [key: number]: string } = {
  0: "1/5 ⭐ Yo, you just hit the jackpot with a rundown house and $500. Time to turn this dump into a goldmine. Start by setting up a Laundry on the ground floor. \nTip: Legal businesses can launder illicit funds, if you got any.",
  1: "2/5 ⭐ The laundry ain't bringing any cash. Time to spice things up. Open an illegal bar in the basement and start raking in that dirty cash. \nTip: Illegal businesses can be built in the basement. They generate dirty cash.",
  2: "3/5 ⭐ The cash flow getting real. Keep collecting that dirty money and laundering it clean. Save up $600 and open a Fastfood restaurant on the ground floor. More business, more cash.",
  3: "4/5 ⭐ Diversification is the name of the game. Set up a Cannabis farm in the basement. More cash, more power. You got this!",
  4: "5/5 ⭐ You're on your way to building an empire. Buy up all the rooms and businesses. \nTip: Some rooms don't generate cash, but the Security Room lets you recruit enforcers and hitmen to take care of business, and the Saferoom protects your stash from getting stolen.",
};

const MissionsModal: React.FC<MissionsModalProps> = ({ open, onClose }) => {
  const wallet = useWallet();
  const program = useProgram();
  const [experience, setExperience] = useState<number>(0);

  const fetchPlayerData = async () => {
    if (!wallet.publicKey || !program) return;

    const [playerPda] = await PublicKey.findProgramAddress(
      [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      // @ts-ignore
      const playerAccount = await program.account.player.fetch(playerPda);
      setExperience(playerAccount.experience.toNumber());
    } catch (err) {
      console.error("Failed to fetch player data", err);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPlayerData();
    }
  }, [open]);

  const missionDescription = missions[Math.min(experience, 4)];

  return (
    <Modal open={open} onClose={onClose}>
      <Box className="modal-box">
        <Typography variant="body1" paragraph>
          {missionDescription}
        </Typography>
        <Box mt={2} textAlign="right">
          <Button variant="contained" color="primary" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default MissionsModal;
