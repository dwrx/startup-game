import React, { useEffect, useState, useRef } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { Button, Box, Tooltip } from "@mui/material";
import useProgram from "../hooks/useProgram";
import { allRooms } from "../rooms";
import MissionsModal from "./MissionsModal";
import "../styles.css";

const Navbar: React.FC = () => {
  const wallet = useWallet();
  const program = useProgram();
  const [balances, setBalances] = useState({
    cleanCash: 0,
    dirtyCash: 0,
    enforcers: 0,
    hitmen: 0,
  });
  const [estimatedDirtyCash, setEstimatedDirtyCash] = useState(0);
  const [estimatedCleanCash, setEstimatedCleanCash] = useState(0);
  const [missionsModalOpen, setMissionsModalOpen] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { connection } = useConnection();

  const fetchBalances = async () => {
    if (!wallet.connected || !wallet.publicKey || !program) return;

    const [playerPda] = await PublicKey.findProgramAddress(
      [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      // @ts-ignore
      const playerAccount = await program.account.player.fetch(playerPda);
      setBalances({
        cleanCash: playerAccount.cleanCash.toNumber(),
        dirtyCash: playerAccount.dirtyCash.toNumber(),
        enforcers: playerAccount.enforcers.toNumber(),
        hitmen: playerAccount.hitmen.toNumber(),
      });

      return playerAccount;
    } catch (err) {
      console.error("Failed to fetch balances", err);
    }
  };

  const estimatePendingRewards = async (playerAccount: any) => {
    try {
      const slot = await connection.getSlot();
      const currentTime = await connection.getBlockTime(slot);

      let totalDirtyCash = 0;
      let totalCleanCash = 0;
      const availableDirtyCash = playerAccount.dirtyCash.toNumber();

      playerAccount.rooms.forEach((room: any) => {
        const elapsedTime = Number(currentTime) - Number(room.lastCollected);

        const roomInfo = allRooms.find((r) => Object.keys(r.roomType)[0] === Object.keys(room.roomType)[0]);
        if (!roomInfo) return;

        const yieldPerSecond = roomInfo.yield / 60;
        const potentialReward = Math.min(elapsedTime * yieldPerSecond, room.storageCapacity.toNumber());

        if (["unlicensedBar", "cannabisFarm", "stripClub", "casino"].includes(Object.keys(room.roomType)[0])) {
          totalDirtyCash += potentialReward;
        }

        if (["laundry", "fastFoodRestaurant", "fitnessCenter"].includes(Object.keys(room.roomType)[0])) {
          totalCleanCash += potentialReward;
        }
      });

      totalCleanCash = Math.min(totalCleanCash, availableDirtyCash * 0.7);

      setEstimatedDirtyCash(Math.round(totalDirtyCash > 0 ? totalDirtyCash : 0));
      setEstimatedCleanCash(Math.round(totalCleanCash > 0 ? totalCleanCash : 0));
    } catch (err) {
      console.error("Failed to estimate rewards", err);
    }
  };

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      setMissionsModalOpen(true);
    }
    const fetchAndEstimate = async () => {
      const playerAccount = await fetchBalances();
      if (playerAccount) {
        estimatePendingRewards(playerAccount);
      }
    };

    fetchAndEstimate();
    const interval = setInterval(fetchAndEstimate, 2000);

    return () => clearInterval(interval);
  }, [wallet.connected, wallet.publicKey, program]);

  const handleCollectDirtyCash = async () => {
    if (!wallet.connected || !wallet.publicKey || !program) return;

    const [playerPda] = await PublicKey.findProgramAddress(
      [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .collectDirtyCash()
        .accounts({
          player: playerPda,
          owner: wallet.publicKey,
        })
        .rpc();

      fetchBalances();
    } catch (err) {
      console.error("Failed to collect dirty cash", err);
    }
  };

  const handleCollectCleanCash = async () => {
    if (!wallet.connected || !wallet.publicKey || !program) return;

    const [playerPda] = await PublicKey.findProgramAddress(
      [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .collectCleanCash()
        .accounts({
          player: playerPda,
          owner: wallet.publicKey,
        })
        .rpc();

      fetchBalances();
    } catch (err) {
      console.error("Failed to collect clean cash", err);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2;
    }
  }, []);

  return (
    <div className="navbar">
      <div className="navbar-left">
        <div className="text-center">Clean Cash: ${balances.cleanCash}</div>
        <div className="text-center">Dirty Cash: ${balances.dirtyCash}</div>
        <div className="text-center">Enforcers: {balances.enforcers}</div>
        <div className="text-center">Hitmen: {balances.hitmen}</div>
      </div>
      <div className="navbar-right">
        <Button
          variant="outlined"
          onClick={() => setMissionsModalOpen(true)}
          style={{
            marginRight: "10px",
            height: "100%",
            color: "gold",
            borderColor: "gold",
          }}
        >
          ⭐ Missions
        </Button>
        <Box display="flex" alignItems="center" height="100%">
          <Tooltip title="Collect dirty money generated from illegal activities.">
            <Button
              variant="outlined"
              onClick={handleCollectDirtyCash}
              style={{
                marginRight: "10px",
                height: "100%",
                color: "white",
                borderColor: "white",
              }}
            >
              Collect (${estimatedDirtyCash})
            </Button>
          </Tooltip>
          <Tooltip title="Launder available dirty money to convert it into clean cash, losing 30% in the process.">
            <Button
              variant="outlined"
              onClick={handleCollectCleanCash}
              style={{
                marginRight: "10px",
                height: "100%",
                color: "white",
                borderColor: "white",
              }}
            >
              Launder, -30% (${estimatedCleanCash})
            </Button>
          </Tooltip>
          <Button
            variant="outlined"
            onClick={toggleAudio}
            style={{
              marginRight: "10px",
              height: "100%",
              color: isPlaying ? "red" : "limegreen",
              borderColor: isPlaying ? "red" : "limegreen",
            }}
          >
            {isPlaying ? "🔇" : "🔊"}
          </Button>
          <WalletMultiButton />
        </Box>
      </div>
      <MissionsModal open={missionsModalOpen} onClose={() => setMissionsModalOpen(false)} />
      <audio ref={audioRef} src="/background-music.mp3" loop />
    </div>
  );
};

export default Navbar;
