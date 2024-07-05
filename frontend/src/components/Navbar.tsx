import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import useProgram from "../hooks/useProgram";
import "../styles.css";
import { Button, Box } from "@mui/material";

const Navbar: React.FC = () => {
  const wallet = useWallet();
  const program = useProgram();
  const [balances, setBalances] = useState({
    cleanCash: 0,
    dirtyCash: 0,
    enforcers: 0,
    hitmen: 0,
  });

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
    } catch (err) {
      console.error("Failed to fetch balances", err);
    }
  };

  useEffect(() => {
    fetchBalances();
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

  return (
    <div className="navbar">
      <div className="navbar-left">
        <div>Clean Cash: ${balances.cleanCash}</div>
        <div>Dirty Cash: ${balances.dirtyCash}</div>
        <div>Enforcers: {balances.enforcers}</div>
        <div>Hitmen: {balances.hitmen}</div>
      </div>
      <div className="navbar-right">
        <Box display="flex" alignItems="center" height="100%">
          <Button
            variant="outlined"
            onClick={handleCollectDirtyCash}
            style={{ marginRight: "10px", height: "100%", color: "white", borderColor: "white" }}
          >
            Collect Dirty Money
          </Button>
          <Button
            variant="outlined"
            onClick={handleCollectCleanCash}
            style={{ height: "100%", color: "white", borderColor: "white" }}
          >
            Launder Money (-30%)
          </Button>
          <WalletMultiButton />
        </Box>
      </div>
    </div>
  );
};

export default Navbar;
