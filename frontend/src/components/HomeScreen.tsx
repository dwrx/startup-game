import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useNavigate } from "react-router-dom";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Button, CircularProgress, Container, Box, Alert, Link } from "@mui/material";
import useProgram from "../hooks/useProgram";
import "../styles.css";

const HomeScreen: React.FC = () => {
  const wallet = useWallet();
  const navigate = useNavigate();
  const program = useProgram();
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const checkPlayerAccount = async () => {
    if (!wallet.connected || !wallet.publicKey || !program) return;

    const [playerPda] = await PublicKey.findProgramAddress(
      [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      // @ts-ignore
      const playerAccount = await program.account.player.fetch(playerPda);
      setIsInitialized(playerAccount.isInitialized);
    } catch (err) {
      setIsInitialized(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (wallet.connected && program) {
      checkPlayerAccount();
    }
  }, [wallet.connected, program]);

  const initializePlayer = async () => {
    if (!wallet.publicKey || !program) return;

    const [playerPda] = await PublicKey.findProgramAddress(
      [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
      program.programId
    );

    await program.rpc.initializePlayer({
      accounts: {
        player: playerPda,
        owner: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });

    setIsInitialized(true);
  };

  return (
    <Container maxWidth="sm" style={{ textAlign: "center", marginTop: "10%" }}>
      <div className="home-screen">
        <div className="logo-container">
          <img src="/logo.png" width="128" alt="Startup: the game" className="logo" />
        </div>
        <Box mt={4}>
          <WalletMultiButton />
        </Box>
        {wallet.connected && (
          <>
            <Box mt={4}>
              <Alert severity="warning">
                Switch wallet to Solana Devnet (
                <Link href="https://faucet.solana.com/" target="_blank" rel="noopener">
                  faucet
                </Link>
                ) or Sonic L2 Devnet (
                <Link href="https://faucet.sonic.game/" target="_blank" rel="noopener">
                  faucet
                </Link>
                ) to play
              </Alert>
            </Box>
            <Box mt={4}>
              {loading ? (
                <CircularProgress />
              ) : isInitialized ? (
                <Button variant="contained" color="primary" onClick={() => navigate("/game")}>
                  Continue Playing
                </Button>
              ) : (
                <Button variant="contained" color="primary" onClick={initializePlayer}>
                  New Game
                </Button>
              )}
            </Box>
          </>
        )}
        <footer className="footer">
          <a href="https://github.com/dwrx/startup-game" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>{" "}
          |&nbsp;
          <a href="https://x.com/dxrxdy/" target="_blank" rel="noopener noreferrer">
            Twitter
          </a>
        </footer>
      </div>
    </Container>
  );
};

export default HomeScreen;
