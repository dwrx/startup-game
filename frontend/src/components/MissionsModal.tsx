import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, Button, Switch, FormControlLabel } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import useProgram from "../hooks/useProgram";
import "./MissionsModal.css";

interface MissionsModalProps {
  open: boolean;
  onClose: () => void;
}

const quests = [
  {
    id: 0,
    title: "Build Laundry",
    description:
      "Laundry can be built on the ground floor. Legal businesses can launder illicit funds if you have any.",
  },
  {
    id: 1,
    title: "Build Unlicensed Bar",
    description: "Illegal businesses can be built in the basement. They generate dirty cash.",
  },
  {
    id: 2,
    title: "Launder $600 of cash",
    description: "Launder your dirty money through legal businesses. Clean money is safe money.",
  },
  {
    id: 3,
    title: "Build Fast Food Restaurant",
    description: "Expand your operations with a fast food restaurant. More businesses mean more cash.",
  },
  {
    id: 4,
    title: "Build Security Room",
    description: "Security room protects your operations and allows for the recruitment of enforcers and hitmen.",
  },
  {
    id: 5,
    title: "Recruit 10 Enforcers and 10 Hitmen",
    description: "Enforcers and hitmen protect and expand your empire.",
  },
  {
    id: 6,
    title: "Build Cannabis Farm",
    description: "Grow your empire with a Cannabis Farm in the basement. It generates dirty cash.",
  },
  {
    id: 7,
    title: "Build Saferoom",
    description: "Saferoom protects your dirty cash from police raids or theft.",
  },
  {
    id: 8,
    title: "Build Strip Club",
    description: "Another illegal business that can generate dirty cash.",
  },
  {
    id: 9,
    title: "Build Casino",
    description: "Casinos generate large amounts of dirty cash, making it a valuable asset to your operation.",
  },
  {
    id: 10,
    title: "Build Fitness Center",
    description: "Fitness center generates clean cash.",
  },
  {
    id: 11,
    title: "Attack Level 1 competitor base",
    description: "Coming soon.",
  },
  {
    id: 12,
    title: "Survive Big Police Raid",
    description: "Coming soon.",
  },
];

const MissionsModal: React.FC<MissionsModalProps> = ({ open, onClose }) => {
  const wallet = useWallet();
  const program = useProgram();
  const [completedQuests, setCompletedQuests] = useState<number[]>([]);
  const [claimedQuests, setClaimedQuests] = useState<number[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<number | null>(null);
  const [hideClaimed, setHideClaimed] = useState<boolean>(true);

  const fetchPlayerData = async () => {
    if (!wallet.publicKey || !program) return;

    const [playerPda] = await PublicKey.findProgramAddress(
      [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      // @ts-ignore
      const playerAccount = await program.account.player.fetch(playerPda);

      const questCompletionBitmask = playerAccount.questCompletionBitmask.toNumber();
      const questClaimBitmask = playerAccount.questClaimBitmask.toNumber();

      const completed = [];
      const claimed = [];
      for (let i = 0; i < quests.length; i++) {
        if (questCompletionBitmask & (1 << i)) {
          completed.push(i);
        }
        if (questClaimBitmask & (1 << i)) {
          claimed.push(i);
        }
      }
      setCompletedQuests(completed);
      setClaimedQuests(claimed);
    } catch (err) {
      console.error("Failed to fetch player data", err);
    }
  };

  const handleClaim = async (questId: number) => {
    if (!wallet.connected || !wallet.publicKey || !program) return;
    try {
      const [playerPda] = await PublicKey.findProgramAddress(
        [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .claimQuestReward(questId)
        .accounts({
          player: playerPda,
          owner: wallet.publicKey,
        })
        .rpc();

      setClaimedQuests([...claimedQuests, questId]);
    } catch (err) {
      console.error("Failed to claim quest reward", err);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPlayerData();
      setSelectedQuest(0);
    }
  }, [open]);

  const handleQuestClick = (questId: number) => {
    setSelectedQuest(selectedQuest === questId ? null : questId);
  };

  return (
    <Modal open={open} onClose={onClose} className="claim-modal missions-modal">
      <Box className="modal-content">
        <h2>Missions</h2>
        <Typography variant="body1" paragraph>
          Complete these missions to progress and earn rewards.
        </Typography>

        <FormControlLabel
          control={<Switch checked={hideClaimed} onChange={() => setHideClaimed(!hideClaimed)} color="primary" />}
          label="Hide claimed"
        />

        <ul className="mission-list">
          {quests
            .filter((quest) => !hideClaimed || !claimedQuests.includes(quest.id))
            .map((quest) => {
              const isCompleted = completedQuests.includes(quest.id);
              const isClaimed = claimedQuests.includes(quest.id);
              const isSelected = selectedQuest === quest.id;

              return (
                <li
                  key={quest.id}
                  className={`mission-item ${isClaimed ? "claimed" : ""}`}
                  onClick={() => handleQuestClick(quest.id)}
                >
                  <div className="mission-details">
                    <Typography variant="h6">{quest.title}</Typography>
                    {isSelected && (
                      <Typography variant="body2" className="mission-description">
                        {quest.description}
                      </Typography>
                    )}
                  </div>
                  <div className="mission-action">
                    {isCompleted && !isClaimed ? (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleClaim(quest.id)}
                        style={{ backgroundColor: "#ffcc00", color: "#000" }}
                      >
                        Claim
                      </Button>
                    ) : (
                      <div className={`status ${isCompleted ? "completed" : "not-completed"}`}>
                        {isCompleted ? (
                          <div className="checkmark">&#10004;</div>
                        ) : (
                          <div className="xmark">&#10008;</div>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
        </ul>
        <Box mt={2} textAlign="right">
          <Button variant="contained" color="primary" className="close" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default MissionsModal;
