import React, { useState, useEffect, useRef } from "react";
import { Box, Button, CircularProgress, Typography, Tooltip, Slider, TextField } from "@mui/material";
import Modal from "@mui/material/Modal";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import useProgram from "../hooks/useProgram";
import { useWallet } from "@solana/wallet-adapter-react";
import "./HeistsModal.css";

interface HeistsModalProps {
  open: boolean;
  onClose: () => void;
  enforcers: number;
  hitmen: number;
}

const HeistsModal: React.FC<HeistsModalProps> = ({ open, onClose, enforcers, hitmen }) => {
  const [selectedEnforcers, setSelectedEnforcers] = useState(0);
  const [selectedHitmen, setSelectedHitmen] = useState(0);
  const [heistsInitialized, setHeistsInitialized] = useState(false);
  const [hasThief, setHasThief] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeHeist, setActiveHeist] = useState(false);
  const [heistStartTime, setHeistStartTime] = useState(0);
  const [heistLevel, setHeistLevel] = useState(0);
  const [enforcersSent, setEnforcersSent] = useState(0);
  const [hitmenSent, setHitmenSent] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [heistResult, setHeistResult] = useState<any>(null);
  const [isSubmittingStart, setIsSubmittingStart] = useState(false);
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false);

  const program = useProgram();
  const wallet = useWallet();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const HEIST_DURATION = 10 * 60;

  const clearExistingInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const fetchAccounts = async () => {
    if (!wallet.publicKey || !program) {
      setLoading(false);
      return;
    }

    try {
      const [heistsPda] = await PublicKey.findProgramAddress(
        [Buffer.from("HEISTS"), wallet.publicKey.toBuffer()],
        program.programId
      );

      // @ts-ignore
      const heists = await program.account.heists.fetchNullable(heistsPda);
      setHeistsInitialized(!!heists);
      console.log(heists);
      if (heists) {
        setHeistLevel(Number(heists.heistLevel));
        setEnforcersSent(heists.enforcersOnHeist.toNumber());
        setHitmenSent(heists.hitmenOnHeist.toNumber());

        if (heists.heistTimestamp.toNumber() > 0) {
          setActiveHeist(true);
          setHeistStartTime(heists.heistTimestamp.toNumber());

          const slot = await program.provider.connection.getSlot();
          const currentTime = await program.provider.connection.getBlockTime(slot);
          const elapsed = Number(currentTime) - heists.heistTimestamp.toNumber();
          const remaining = HEIST_DURATION - elapsed;
          console.log("Heist time remaining:", remaining);
          if (remaining > 0) {
            setTimeLeft(remaining);
            clearExistingInterval();
            intervalRef.current = setInterval(() => {
              setTimeLeft((prevTimeLeft) => (prevTimeLeft ? prevTimeLeft - 1 : 0));
            }, 1000);
          } else {
            // Heist can be completed
            setTimeLeft(0);
          }
        } else {
          setActiveHeist(false);
        }
      }

      const [inventoryPda] = await PublicKey.findProgramAddress(
        [Buffer.from("INVENTORY"), wallet.publicKey.toBuffer()],
        program.programId
      );
      // @ts-ignore
      const inventory = await program.account.inventory.fetch(inventoryPda);

      const thiefInInventory = inventory.items.some(
        (item: any) => JSON.stringify(item) === JSON.stringify({ thief: {} })
      );
      setHasThief(thiefInInventory);
    } catch (err) {
      console.error("Error fetching accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setError(null);
    setHeistResult(null);
    if (open) {
      fetchAccounts();
    } else {
      clearExistingInterval();
    }

    return () => {
      clearExistingInterval();
    };
  }, [open, wallet.publicKey, program]);

  useEffect(() => {
    setError(null);
    setHeistResult(null);
    setIsSubmittingStart(false);
    setIsSubmittingComplete(false);
    setSelectedHitmen(0);
    setSelectedEnforcers(0);
  }, [open]);

  useEffect(() => {
    fetchAccounts();
  }, [wallet.publicKey, program]);

  const initializeHeists = async () => {
    if (!wallet.publicKey || !program) return;

    const [heistsPda] = await PublicKey.findProgramAddress(
      [Buffer.from("HEISTS"), wallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.rpc.initializeHeists({
        accounts: {
          heists: heistsPda,
          owner: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      setHeistsInitialized(true);
    } catch (err) {
      console.error("Failed to initialize heists:", err);
      setError("Failed to initialize. Do you have enough SOL?");
    }
  };

  const startHeist = async () => {
    if (!wallet.publicKey || !program || isSubmittingStart) return;

    setIsSubmittingStart(true);

    const [playerPda] = await PublicKey.findProgramAddress(
      [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
      program.programId
    );

    const [heistsPda] = await PublicKey.findProgramAddress(
      [Buffer.from("HEISTS"), wallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.rpc.startHeist(new anchor.BN(selectedEnforcers), new anchor.BN(selectedHitmen), {
        accounts: {
          player: playerPda,
          heists: heistsPda,
          owner: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      setActiveHeist(true);
      setTimeLeft(HEIST_DURATION);
      clearExistingInterval();
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTimeLeft) => (prevTimeLeft ? prevTimeLeft - 1 : 0));
      }, 1000);
      fetchAccounts();
      console.log("Heist started");
    } catch (err) {
      console.error("Failed to start heist:", err);
    } finally {
      setIsSubmittingStart(false);
    }
  };

  const completeHeist = async () => {
    if (!wallet.publicKey || !program || isSubmittingComplete) return;

    setIsSubmittingComplete(true);

    const [playerPda] = await PublicKey.findProgramAddress(
      [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
      program.programId
    );

    const [heistsPda] = await PublicKey.findProgramAddress(
      [Buffer.from("HEISTS"), wallet.publicKey.toBuffer()],
      program.programId
    );

    const [inventoryPda] = await PublicKey.findProgramAddress(
      [Buffer.from("INVENTORY"), wallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.rpc.completeHeist({
        accounts: {
          player: playerPda,
          heists: heistsPda,
          inventory: inventoryPda,
          owner: wallet.publicKey,
        },
      });
      console.log("Heist completed");
      // @ts-ignore
      const heists = await program.account.heists.fetch(heistsPda);
      const lastCompletedHeist = heists.completedHeists[heists.completedHeists.length - 1];
      setHeistResult(lastCompletedHeist);
      setActiveHeist(false);
      clearExistingInterval();
    } catch (err) {
      //   if (err.error.errorMessage === "No active heist.") {
      //     setError("No active heist.");
      //     return;
      //   }

      console.error("Failed to complete heist:", err);
    } finally {
      setIsSubmittingComplete(false);
    }
  };

  const handleSliderChange = (event: any, newValue: number | number[], unitType: string) => {
    if (typeof newValue === "number") {
      if (unitType === "enforcers") setSelectedEnforcers(newValue);
      else if (unitType === "hitmen") setSelectedHitmen(newValue);
    }
  };

  const calculateTotalStrength = () => {
    return selectedEnforcers * 10 + selectedHitmen * 40;
  };

  const calculateCarryingCapacity = () => {
    return selectedEnforcers * 25 + selectedHitmen * 10;
  };

  const renderTimeLeft = () => {
    if (timeLeft && timeLeft > 0) {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      return `Complete in ${minutes} minutes ${seconds} seconds`;
    }
    return "Complete Heist";
  };

  const renderHeistResult = () => {
    if (!heistResult) return null;

    if (!heistResult.win) {
      return (
        <Box sx={{ textAlign: "center", padding: 2 }}>
          <Typography variant="h6" style={{ color: "red" }}>
            Heist failed
          </Typography>
          <Typography style={{ color: "red" }}>
            Losses: {heistResult.enforcersLost.toNumber()} enforcers, {heistResult.hitmenLost.toNumber()} hitmen
          </Typography>
        </Box>
      );
    }

    let image = "";
    if (heistResult.lootReward) {
      if (heistResult.lootReward.washingMachine) {
        image = "washing-machine.png";
      } else if (heistResult.lootReward.microwaveOven) {
        image = "microwave-oven.png";
      } else if (heistResult.lootReward.whiskey) {
        image = "whiskey.png";
      } else if (heistResult.lootReward.slotMachine) {
        image = "slot-machine.png";
      } else if (heistResult.lootReward.cannabisSeeds) {
        image = "cannabis-seeds.png";
      } else if (heistResult.lootReward.vipLoungeFurniture) {
        image = "vip-lounge-furniture.png";
      } else if (heistResult.lootReward.boxingSandbag) {
        image = "boxing-sandbag.png";
      }
    }

    return (
      <Box sx={{ textAlign: "center", padding: 2 }}>
        <Typography variant="h6" style={{ color: "#f2b24e" }}>
          Heist was successful!
        </Typography>
        <Typography>
          Losses: {heistResult.enforcersLost.toNumber()} enforcers, {heistResult.hitmenLost.toNumber()} hitmen
        </Typography>
        <Typography>
          Rewards: {heistResult.xpReward.toNumber()} XP, {heistResult.silverReward.toNumber()} Silver
        </Typography>

        {heistResult.lootReward && (
          <img
            src={`/loot/${image}`}
            alt="Loot"
            style={{ maxWidth: "80px", border: "3px solid gray", borderRadius: "8px", marginTop: "10px" }}
          />
        )}
      </Box>
    );
  };

  const renderHeistAlerts = () => {
    const minEnemyStrength = heistLevel * 500;
    const maxEnemyStrength = minEnemyStrength + 500;

    const totalPlayerStrength = selectedEnforcers * 10 + selectedHitmen * 40;
    if (totalPlayerStrength < minEnemyStrength) {
      return (
        <Typography sx={{ color: "red", fontWeight: "bold" }}>
          You are guaranteed to fail this heist. Your total strength <b>{totalPlayerStrength}</b> is less than enemy
          guards' strength <b>{minEnemyStrength}</b>.
        </Typography>
      );
    } else if (totalPlayerStrength < maxEnemyStrength) {
      return (
        <Typography sx={{ color: "#f2b24e", fontWeight: "bold" }}>
          There is a chance for failure. Your total strength <b>{totalPlayerStrength}</b> is less than the maximum enemy
          guards' strength <b>{maxEnemyStrength}</b>.
        </Typography>
      );
    }
    return null;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          padding: "20px",
        }}
      >
        <Box
          sx={{
            background: `url('/heists-warehouse-background.png') no-repeat center`,
            backgroundSize: "cover",
            maxWidth: "800px",
            width: "100%",
            padding: "20px",
            maxHeight: "90vh",
            borderRadius: "10px",
            color: "#fff",
            boxShadow: 24,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            position: "relative",
            overflowY: "auto",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{
                color: "#fff",
                borderColor: "#fff",
                marginLeft: "auto",
                padding: "5px 20px",
              }}
            >
              Close
            </Button>
          </Box>

          {error && (
            <Box sx={{ textAlign: "center", padding: 2 }}>
              <Typography variant="h6" style={{ color: "#f2b24e" }}>
                {error}
              </Typography>
            </Box>
          )}

          {heistResult ? (
            renderHeistResult()
          ) : !heistsInitialized ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
              <Button variant="contained" sx={{ backgroundColor: "#f2b24e", color: "#000" }} onClick={initializeHeists}>
                Start planning heists
              </Button>
            </Box>
          ) : activeHeist ? (
            <Box sx={{ textAlign: "center", padding: 2 }}>
              <Typography variant="h6" style={{ color: "#f2b24e" }}>
                Heist is in progress...
              </Typography>
              <pre>Heist level: {heistLevel}</pre>
              <pre>Duration: {HEIST_DURATION / 60} minutes</pre>
              <pre>Enforcers sent: {enforcersSent}</pre>
              <pre>Hitmen sent: {hitmenSent}</pre>

              <Button
                variant="contained"
                className="heist-button"
                disabled={(timeLeft && timeLeft > 0) || isSubmittingComplete}
                sx={{
                  mt: 2,
                  width: "100%",
                  backgroundColor: timeLeft && timeLeft > 0 ? "#888" : "#f2b24e",
                  color: "#fff",
                }}
                onClick={timeLeft && timeLeft > 0 ? undefined : completeHeist}
              >
                {isSubmittingComplete ? <CircularProgress size={24} /> : renderTimeLeft()}
              </Button>
            </Box>
          ) : (
            <Box className="heists" p={2} style={{ background: "rgba(0,0,0,0.5)" }}>
              <Typography>
                In easy heists, you can earn up to <span style={{ color: "#ffcc00" }}>100 silver</span>,
                <span style={{ color: "#ffcc00" }}> 1-5 XP</span> and you have a
                <span style={{ color: "#ffcc00" }}> 35% chance</span> to steal a{" "}
                <span style={{ color: "#ffcc00" }}>common loot</span> that can be used to upgrade your businesses or
                traded with other players (TBA).
              </Typography>

              <Box mt={2}>
                <Typography variant="h6">Heist Level: {heistLevel}</Typography>
                <Typography>
                  Enemy guards strength: {500 * heistLevel}-{500 * heistLevel + 500}
                </Typography>
                <Typography>Loot probability: 35%</Typography>
                <Typography>Possible loot rewards:</Typography>
                <Box
                  display="flex"
                  gap={1}
                  mt={1}
                  flexWrap="wrap"
                  justifyContent="left"
                  sx={{ maxWidth: "100%", overflow: "hidden" }}
                >
                  <Tooltip title="Washing Machine. 5% chance to drop.">
                    <img
                      src="/loot/washing-machine.png"
                      alt="loot-1"
                      style={{ maxWidth: "80px", border: "3px solid gray", borderRadius: "8px" }}
                    />
                  </Tooltip>
                  <Tooltip title="Microwave Oven. 5% chance to drop.">
                    <img
                      src="/loot/microwave-oven.png"
                      alt="loot-1"
                      style={{ maxWidth: "80px", border: "3px solid gray", borderRadius: "8px" }}
                    />
                  </Tooltip>
                  <Tooltip title="Whiskey. 5% chance to drop.">
                    <img
                      src="/loot/whiskey.png"
                      alt="loot-1"
                      style={{ maxWidth: "80px", border: "3px solid gray", borderRadius: "8px" }}
                    />
                  </Tooltip>
                  <Tooltip title="Slot Machine. 5% chance to drop.">
                    <img
                      src="/loot/slot-machine.png"
                      alt="loot-1"
                      style={{ maxWidth: "80px", border: "3px solid gray", borderRadius: "8px" }}
                    />
                  </Tooltip>
                  <Tooltip title="Cannabis Seeds. 5% chance to drop.">
                    <img
                      src="/loot/cannabis-seeds.png"
                      alt="loot-1"
                      style={{ maxWidth: "80px", border: "3px solid gray", borderRadius: "8px" }}
                    />
                  </Tooltip>
                  <Tooltip title="Vip Lounge Furniture. 5% chance to drop.">
                    <img
                      src="/loot/vip-lounge-furniture.png"
                      alt="loot-1"
                      style={{ maxWidth: "80px", border: "3px solid gray", borderRadius: "8px" }}
                    />
                  </Tooltip>
                  <Tooltip title="Boxing Sandbag. 5% chance to drop.">
                    <img
                      src="/loot/boxing-sandbag.png"
                      alt="loot-1"
                      style={{ maxWidth: "80px", border: "3px solid gray", borderRadius: "8px" }}
                    />
                  </Tooltip>
                </Box>
              </Box>
              <Box mt={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography>Enforcers</Typography>
                  <TextField
                    type="number"
                    value={selectedEnforcers}
                    onChange={(e) => handleSliderChange(e, parseInt(e.target.value), "enforcers")}
                    inputProps={{ min: 0, max: enforcers }}
                    style={{ width: "100px" }}
                  />
                </Box>
                <Slider
                  style={{ color: "#f2b24e" }}
                  value={selectedEnforcers}
                  min={0}
                  max={enforcers}
                  onChange={(e, val) => handleSliderChange(e, val, "enforcers")}
                />

                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                  <Typography>Hitmen</Typography>
                  <TextField
                    type="number"
                    value={selectedHitmen}
                    onChange={(e) => handleSliderChange(e, parseInt(e.target.value), "hitmen")}
                    inputProps={{ min: 0, max: hitmen }}
                    style={{ width: "100px" }}
                  />
                </Box>
                <Slider
                  style={{ color: "#f2b24e" }}
                  value={selectedHitmen}
                  min={0}
                  max={hitmen}
                  onChange={(e, val) => handleSliderChange(e, val, "hitmen")}
                />
              </Box>

              <Box mt={2}>
                <Typography>Your total strength: {calculateTotalStrength()}</Typography>
                <Typography>Your max carrying capacity: {calculateCarryingCapacity()}</Typography>
                {renderHeistAlerts()}
              </Box>

              {hasThief ? (
                <Button
                  variant="contained"
                  sx={{ mt: 2, width: "100%", backgroundColor: "#f2b24e", color: "#000" }}
                  onClick={hasThief ? startHeist : undefined}
                  disabled={isSubmittingStart || !hasThief}
                >
                  {isSubmittingStart ? <CircularProgress size={24} /> : "Start Heist"}
                </Button>
              ) : (
                <p style={{ color: "red" }}>Recruit Albert to plan the heist</p>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default HeistsModal;
