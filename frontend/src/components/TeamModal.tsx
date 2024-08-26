import React, { useEffect, useState } from "react";
import { Modal, Box, Button, Typography, Tooltip } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import useProgram from "../hooks/useProgram";
import "../styles.css";

interface TeamModalProps {
  open: boolean;
  onClose: () => void;
  playerXp: number;
  playerDirtyCash: number;
}

const TeamModal: React.FC<TeamModalProps> = ({ open, onClose, playerXp, playerDirtyCash }) => {
  const wallet = useWallet();
  const program = useProgram();
  const [inventoryPda, setInventoryPda] = useState<PublicKey | null>(null);
  const [hasThief, setHasThief] = useState<boolean>(false);
  const canRecruitAlbert = playerXp >= 9 && playerDirtyCash >= 5000;

  useEffect(() => {
    const fetchInventory = async () => {
      if (!wallet.publicKey || !program) return;

      const [inventoryPda] = await PublicKey.findProgramAddress(
        [Buffer.from("INVENTORY"), wallet.publicKey.toBuffer()],
        program.programId
      );
      setInventoryPda(inventoryPda);

      try {
        // @ts-ignore
        const inventoryAccount = await program.account.inventory.fetch(inventoryPda);

        if (inventoryAccount) {
          console.log(inventoryAccount);
          const thiefInInventory = inventoryAccount.items.some(
            (item: any) => JSON.stringify(item) === JSON.stringify({ thief: {} })
          );
          setHasThief(thiefInInventory);
        }
      } catch (err) {
        console.log("Inventory not initialized or Thief not found:", err);
      }
    };

    fetchInventory();
  }, [wallet.publicKey, program]);

  const recruitMember = async (memberName: string) => {
    if (!wallet.publicKey || !program || !inventoryPda) return;

    try {
      // @ts-ignore
      const inventoryAccount = await program.account.inventory.fetchNullable(inventoryPda);
      if (!inventoryAccount) {
        console.log("Initializing inventory...");
        await program.methods
          .initializeInventory()
          .accounts({
            inventory: inventoryPda,
            owner: wallet.publicKey,
          })
          .rpc();
      }

      // Recruit Thief (Albert)
      console.log(`Recruiting ${memberName}...`);
      const [playerPda] = await PublicKey.findProgramAddress(
        [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .recruitTeamMember({ thief: {} })
        .accounts({
          player: playerPda,
          inventory: inventoryPda,
          owner: wallet.publicKey,
        })
        .rpc();

      setHasThief(true);
    } catch (err) {
      console.error("Failed to recruit member:", err);
    }
  };

  return (
    <Modal open={open} onClose={onClose} className="team-modal">
      <Box
        className="team-modal-content"
        sx={{
          backgroundImage: "url('/team-background.png')",
          backgroundSize: "cover",
          padding: "20px",
          borderRadius: "10px",
          color: "#fff",
        }}
      >
        <div
          className="team-member"
          style={{ background: "linear-gradient(90deg, rgba(255, 165, 0, 0.15), rgba(128, 128, 128, 0.5))" }}
        >
          <img src="/albert.png" alt="Albert" className="team-member-image" />
          <div className="team-member-info">
            {/* <Typography variant="h6">Albert</Typography> */}
            <Typography variant="body1">
              <b>Albert</b> is a clever mastermind, skilled in planning and executing high-stakes heists.
            </Typography>
            {!hasThief ? (
              <Tooltip title="Albert unlocks Heists.">
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!canRecruitAlbert || hasThief}
                  onClick={() => recruitMember("Albert")}
                  style={{
                    marginTop: "10px",
                    color: "#000000",
                    backgroundColor: canRecruitAlbert ? "#d2ab2c" : "grey",
                  }}
                >
                  {playerXp < 9 ? `9 XP needed` : "Recruit for $5000"}
                </Button>
              </Tooltip>
            ) : (
              <Box
                sx={{
                  marginTop: "10px",
                  padding: "10px",
                  backgroundColor: "#fff6da",
                  color: "#000",
                  textAlign: "left",
                }}
              >
                Heists are coming soon.
              </Box>
            )}
          </div>
        </div>

        <div
          className="team-member"
          style={{ background: "linear-gradient(90deg, rgba(255, 0, 0, 0.15), rgba(128, 128, 128, 0.5))" }}
        >
          <img src="/easy.png" alt="Easy" className="team-member-image" />
          <div className="team-member-info">
            {/* <Typography variant="h6">Easy</Typography> */}
            <Typography variant="body1">
              <b>"Easy"</b> can solve problems with the police and keep the team out of trouble.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              disabled={true}
              style={{ marginTop: "10px", backgroundColor: "grey" }}
            >
              Not enough XP
            </Button>
          </div>
        </div>

        <div
          className="team-member"
          style={{ background: "linear-gradient(90deg, rgba(0, 0, 255, 0.15), rgba(128, 128, 128, 0.5))" }}
        >
          <img src="/becca.png" alt="Becca" className="team-member-image" />
          <div className="team-member-info">
            {/* <Typography variant="h6">Becca</Typography> */}
            <Typography variant="body1">
              <b>Becca</b>, the team's chief intelligence officer, excels in corporate espionage.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              disabled={true}
              style={{ marginTop: "10px", backgroundColor: "grey" }}
            >
              Not enough XP
            </Button>
          </div>
        </div>
        <Box mt={2} textAlign="right">
          <Button variant="contained" color="primary" className="close" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default TeamModal;
