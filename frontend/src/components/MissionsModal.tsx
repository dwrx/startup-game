import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, Button, Switch, FormControlLabel, Tabs, Tab } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import useProgram from "../hooks/useProgram";
import "./MissionsModal.css";

interface MissionsModalProps {
  open: boolean;
  onClose: () => void;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const quests = [
  {
    id: 0,
    title: "Build Laundry",
    rewards: [
      { type: "silver", amount: 100 },
      { type: "xp", amount: 1 },
    ],
    description:
      "Laundry can be built on the ground floor. Legal businesses can launder illicit funds if you have any.",
  },
  {
    id: 1,
    title: "Build Unlicensed Bar",
    rewards: [
      { type: "silver", amount: 100 },
      { type: "xp", amount: 1 },
    ],
    description: "Illegal businesses can be built in the basement. They generate dirty cash.",
  },
  {
    id: 2,
    title: "Launder $600 of cash",
    rewards: [{ type: "silver", amount: 100 }],
    description: "Launder your dirty money through legal businesses. Clean money is safe money.",
  },
  {
    id: 3,
    title: "Build Fast Food Restaurant",
    rewards: [
      { type: "silver", amount: 100 },
      { type: "xp", amount: 1 },
    ],
    description: "Expand your operations with a fast food restaurant. More businesses mean more cash.",
  },
  {
    id: 4,
    title: "Build Security Room",
    rewards: [
      { type: "silver", amount: 100 },
      { type: "xp", amount: 1 },
    ],
    description: "Security room protects your operations and allows for the recruitment of enforcers and hitmen.",
  },
  {
    id: 5,
    title: "Recruit 10 Enforcers and 10 Hitmen",
    rewards: [{ type: "silver", amount: 100 }],
    description: "Enforcers and hitmen protect and expand your empire.",
  },
  {
    id: 6,
    title: "Build Cannabis Farm",
    rewards: [
      { type: "silver", amount: 100 },
      { type: "xp", amount: 1 },
    ],
    description: "Grow your empire with a Cannabis Farm in the basement. It generates dirty cash.",
  },
  {
    id: 7,
    title: "Build Saferoom",
    rewards: [
      { type: "silver", amount: 100 },
      { type: "xp", amount: 1 },
    ],
    description: "Saferoom protects your dirty cash from police raids or theft.",
  },
  {
    id: 8,
    title: "Build Strip Club",
    rewards: [
      { type: "silver", amount: 100 },
      { type: "xp", amount: 1 },
    ],
    description: "Another illegal business that can generate dirty cash.",
  },
  {
    id: 9,
    title: "Build Casino",
    rewards: [
      { type: "silver", amount: 100 },
      { type: "xp", amount: 1 },
    ],
    description: "Casinos generate large amounts of dirty cash, making it a valuable asset to your operation.",
  },
  {
    id: 10,
    title: "Build Fitness Center",
    rewards: [
      { type: "silver", amount: 100 },
      { type: "xp", amount: 1 },
    ],
    description: "Fitness center generates clean cash.",
  },
  {
    id: 11,
    title: "Recruit thief to your team",
    rewards: [
      { type: "silver", amount: 100 },
      { type: "xp", amount: 1 },
    ],
    description: "Albert is skilled in planning and executing high-stakes heists.",
  },
  {
    id: 12,
    title: "Complete the first heist",
    description: "Coming soon.",
  },
];

const odysseyQuests = [
  {
    id: 1000,
    title: "Earn 5 XP",
    xpRequired: 5,
    rewards: [{ type: "rings", amount: 2 }],
    description: "Earn 5 XP to claim 2 rings.",
  },
  {
    id: 1001,
    title: "Earn 10 XP",
    xpRequired: 10,
    rewards: [{ type: "rings", amount: 3 }],
    description: "Earn 10 XP to claim 3 rings.",
  },
  {
    id: 1002,
    title: "Earn 15 XP",
    xpRequired: 15,
    rewards: [{ type: "rings", amount: 5 }],
    description: "Earn 15 XP to claim 5 rings.",
  },
];

const MissionsModal: React.FC<MissionsModalProps> = ({ open, onClose }) => {
  const wallet = useWallet();
  const program = useProgram();
  const [completedQuests, setCompletedQuests] = useState<number[]>([]);
  const [claimedQuests, setClaimedQuests] = useState<number[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<number | null>(null);
  const [hideClaimed, setHideClaimed] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState(0);
  const [xp, setXp] = useState(0);
  const [transactions, setTransactions] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

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
      const claimed: number[] = [];
      for (let i = 0; i < quests.length; i++) {
        if (questCompletionBitmask & (1 << i)) {
          completed.push(i);
        }
        if (questClaimBitmask & (1 << i)) {
          claimed.push(i);
        }
      }
      setCompletedQuests(completed);
      setClaimedQuests((prevClaimedQuests) => [...prevClaimedQuests, ...claimed]);
      setXp(playerAccount.experience.toNumber());
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

  const handleOdysseyClaim = async (questId: number, type: string) => {
    console.log(claimedQuests);
    if (!wallet.connected || !wallet.publicKey || !program) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/claim-odyssey-reward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questId, type, address: wallet.publicKey.toBase58() }),
      });

      const result = await response.json();
      if (result.success) {
        setClaimedQuests([...claimedQuests, questId]);
        setError(null);
      } else {
        setError(result.message);
      }
      fetchOdysseyData();
    } catch (err) {
      console.error("Failed to claim quest reward", err);
    }
  };

  const fetchOdysseyData = async () => {
    if (!wallet.publicKey || !program) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/claimed-quests?address=${wallet.publicKey.toBase58()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      console.log(result);
      if (result.success) {
        setClaimedQuests((prevClaimedQuests) => [...prevClaimedQuests, ...result.claimedQuests]);
        setTransactions((prevTransactions) => ({ ...prevTransactions, ...result.transactions }));
      }
    } catch (err) {
      console.error("Failed to fetch odyssey data", err);
    }
  };

  useEffect(() => {
    if (open) {
      setActiveTab(0);
      fetchPlayerData();
      setSelectedQuest(0);
      setError(null);
      fetchOdysseyData();
    }
  }, [open]);

  const handleQuestClick = (questId: number) => {
    setSelectedQuest(selectedQuest === questId ? null : questId);
  };

  return (
    <Modal open={open} onClose={onClose} className="claim-modal missions-modal">
      <Box className="modal-content">
        <Tabs
          className="missions-tabs"
          TabIndicatorProps={{ style: { backgroundColor: "#ffcc00" } }}
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
        >
          <Tab className="missions-tab-button" label="Missions" />
          <Tab className="missions-tab-button" label="Odyssey Rings" />
          <FormControlLabel
            control={<Switch checked={hideClaimed} onChange={() => setHideClaimed(!hideClaimed)} color="primary" />}
            label="Hide claimed"
          />
        </Tabs>
        {activeTab === 0 && (
          <>
            {/* <Typography variant="body1" paragraph>
              Complete these missions to progress and earn rewards.
            </Typography> */}

            {/* <FormControlLabel
              control={<Switch checked={hideClaimed} onChange={() => setHideClaimed(!hideClaimed)} color="primary" />}
              label="Hide claimed"
            /> */}

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
                        <div className="mission-rewards">
                          {quest.rewards &&
                            quest.rewards.map((reward, index) => (
                              <div key={index} className="reward-item">
                                {reward.type === "silver" ? (
                                  <img
                                    src="/silver.png"
                                    alt="Silver"
                                    width="24"
                                    style={{ verticalAlign: "middle", marginRight: "4px" }}
                                  />
                                ) : (
                                  ""
                                )}
                                {reward.type === "silver" ? (
                                  <span>{reward.amount} Silver</span>
                                ) : (
                                  <span>{reward.amount} XP</span>
                                )}
                              </div>
                            ))}
                        </div>
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
          </>
        )}
        {activeTab === 1 && (
          <>
            {/* <Typography variant="body1" paragraph>
              Progress in the game to earn Odyssey Rings.
            </Typography> */}
            {error && (
              <Typography color="error" className="quest-claim-error" variant="body2">
                {error}{" "}
                <a href="/" style={{ color: "#ffcc00" }}>
                  Home Page
                </a>
              </Typography>
            )}
            <ul className="mission-list">
              {odysseyQuests.map((quest) => {
                const canClaim = xp >= quest.xpRequired;
                const isClaimed = claimedQuests.includes(quest.id);
                return (
                  <li key={quest.id} className={`mission-item`}>
                    <div className="mission-details">
                      <Typography variant="h6">{quest.title}</Typography>
                      <div className="mission-rewards">
                        <div className="reward-item">
                          <img
                            src="/rings.png"
                            alt="Rings"
                            width="24"
                            style={{ verticalAlign: "middle", marginRight: "4px" }}
                          />
                          {quest.rewards[0].amount} Rings
                        </div>
                      </div>
                      {/* <Typography variant="body2" className="mission-description">
                        {quest.description}
                      </Typography> */}
                    </div>
                    <div className="mission-action">
                      {!isClaimed ? (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleOdysseyClaim(quest.id, "odyssey")}
                          disabled={!canClaim}
                          style={{ backgroundColor: canClaim ? "#ffcc00" : "gray", color: canClaim ? "#000" : "#fff" }}
                        >
                          {canClaim ? "Claim" : "Not Enough XP"}
                        </Button>
                      ) : (
                        <div>
                          <a
                            style={{ color: "#ffcc00", fontSize: "14px" }}
                            href={`https://explorer.sonic.game/tx/${transactions[quest.id]}?cluster=devnet`}
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            Transaction
                          </a>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
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
