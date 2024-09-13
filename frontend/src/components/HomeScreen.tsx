import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useNavigate, useLocation } from "react-router-dom";

import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Button, CircularProgress, Box, Alert, Link, LinearProgress } from "@mui/material";
import SiteNavigation from "./SiteNavigation";
import HowToModal from "./HowToModal";
import ClaimLootboxModal from "./ClaimLootboxModal";
import useProgram from "../hooks/useProgram";
import "./HomeScreen.css";
import "./SiteNavigation.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const NETWORK = process.env.REACT_APP_NETWORK || "origin";
const { NETWORK_NAME } = require("../config.json")[NETWORK];

const HomeScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const wallet = useWallet();
  const program = useProgram();

  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [claimModalOpen, setClaimModalOpen] = useState<boolean>(false);
  const [howToModalOpen, setHowToModalOpen] = useState<boolean>(false);
  const [xp, setXp] = useState<number>(0);
  const [silver, setSilver] = useState<number>(0);
  const [lootboxClaimed, setLootboxClaimed] = useState<boolean>(false);
  const [lootboxLevel, setLootboxLevel] = useState<number>(0);
  const [twitterLinked, setTwitterLinked] = useState<boolean>(false);
  const [followedOnTwitter, setFollowedOnTwitter] = useState<boolean>(false);
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState("");
  const [showMobileWalletButton, setShowMobileWalletButton] = useState<boolean>(false);

  const checkJWT = () => {
    localStorage.removeItem("JWT");
    setSignedIn(false);
  };

  const handleSignInSuccess = () => {
    setSignedIn(true);
  };

  const checkPlayerAccount = async () => {
    if (!wallet.connected || !wallet.publicKey || !program) return;

    const [playerPda] = await PublicKey.findProgramAddress(
      [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      // @ts-ignore - TODO: Fix this
      const playerAccount = await program.account.player.fetch(playerPda);
      setIsInitialized(playerAccount.isInitialized);
      setLootboxClaimed(playerAccount.lootboxLevel > 0);
      setLootboxLevel(Number(playerAccount.lootboxLevel));
      setXp(Number(playerAccount.experience));
      setSilver(Number(playerAccount.silver));
    } catch (err) {
      setIsInitialized(false);
      setLootboxClaimed(false);
    }
    setLoading(false);
  };

  const saveAddress = async () => {
    if (wallet.publicKey) {
      const address = wallet.publicKey.toBase58();

      try {
        const ua = navigator.userAgent;
        const isOKApp = /OKApp/i.test(ua);
        const response = await fetch(`${API_BASE_URL}/api/v1/save-address`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address, okx: isOKApp, network: NETWORK }),
        });

        if (!response.ok) {
          throw new Error("Failed to save address");
        }
      } catch (error) {
        console.error("Error saving address:", error);
      }
    }
  };

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iphone|ipad|ipod|ios/i.test(ua);
    const isAndroid = /android|XiaoMi|MiuiBrowser/i.test(ua);
    const isMobile = isIOS || isAndroid;
    const isOKApp = /OKApp/i.test(ua);

    if (isMobile && !isOKApp) {
      setShowMobileWalletButton(true);
    }
  }, []);

  const handleMobileWalletConnect = () => {
    const dappUrl = window.location.href;
    const encodedDappUrl = encodeURIComponent(dappUrl);
    const deepLink = `okx://wallet/dapp/url?dappUrl=${encodedDappUrl}`;
    const encodedUrl = `https://www.okx.com/download?deeplink=${encodeURIComponent(deepLink)}`;
    window.location.href = encodedUrl;
  };

  useEffect(() => {
    if (wallet.connected && program) {
      checkJWT();
      saveAddress();
      setTwitterLinked(false);
      setFollowedOnTwitter(false);
      checkPlayerAccount();
    }
  }, [wallet.connected, wallet.publicKey, program]);

  useEffect(() => {
    if (wallet.publicKey) {
      checkJWT();
    } else {
      setSignedIn(false);
      localStorage.removeItem("JWT");
    }
  }, [wallet.publicKey]);

  const initializePlayer = async () => {
    if (!wallet.publicKey || !program) return;

    const [playerPda] = await PublicKey.findProgramAddress(
      [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
      program.programId
    );

    const [inventoryPda] = await PublicKey.findProgramAddress(
      [Buffer.from("INVENTORY"), wallet.publicKey.toBuffer()],
      program.programId
    );

    await program.rpc.initializePlayer({
      accounts: {
        player: playerPda,
        inventory: inventoryPda,
        owner: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });

    setIsInitialized(true);
  };

  const claimLootbox = async () => {
    if (!lootboxClaimed) {
      setClaimModalOpen(true);
    }
  };

  const handleClaimLootbox = async () => {
    if (!wallet.publicKey || !program) return;

    const [playerPda] = await PublicKey.findProgramAddress(
      [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
      program.programId
    );

    await program.rpc.claimLootbox({
      accounts: {
        player: playerPda,
        owner: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });
    checkPlayerAccount();
    setClaimModalOpen(false);
  };

  const linkTwitter = () => {
    setTwitterLinked(true);
  };

  const followOnTwitter = () => {
    setFollowedOnTwitter(true);
  };

  const upgradeLootbox = async () => {
    if (!wallet.publicKey || !program) return;

    const [playerPda] = await PublicKey.findProgramAddress(
      [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .upgradeLootbox()
        .accounts({
          player: playerPda,
          owner: wallet.publicKey,
        })
        .rpc();

      checkPlayerAccount();
    } catch (err) {
      console.error("Failed to upgrade lootbox", err);
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const error = queryParams.get("error");
    const success = queryParams.get("success");

    if (error) {
      switch (error) {
        case "already_linked":
          setMessage("This Twitter account is already linked to another wallet address.");
          break;
        case "db_error":
          setMessage("An error occurred while processing your request. Please try again later.");
          break;
        case "invalid_state":
          setMessage("Invalid state. Please try the process again.");
          break;
        default:
          setMessage("An unknown error occurred.");
      }
    } else if (success) {
      if (success === "linked") {
        setMessageType("success");
        setMessage("Successfully linked your Twitter account!");
      }
    }

    navigate(location.pathname, { replace: true });
  }, [location.search, navigate]);

  return (
    <div className="home-screen">
      <SiteNavigation />

      {message && <div className={`message-box ${messageType}`}>{message}</div>}
      <div className="content-wrapper">
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSc4mAB7GBgYlGgB0KIEWhzTaBd_5HAg4Q8LfRSfTRmZC0IF5w/viewform" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none'}}>
        <p
          className="block-title"
          style={{
            textAlign: "center",
            background: "#00000087",
            width: "100%",
            maxWidth: "720px",
            margin: "0 auto",
            marginBottom: "25px",
            borderRadius: "5px",
            color: "#fff",
            padding: "10px 0",
            textTransform: "uppercase",
            fontFamily: "'Chakra Petch', 'Roboto', 'sans-serif'",
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          <img
            src="/sonic-logo.png"
            alt="Sonic Node WL"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              verticalAlign: "middle",
              marginRight: "8px",
            }}
          />
          Sonic Node WL
        </p>
        </a>
        <div className="content-wrappper-details">
          <div className={`left-block ${!wallet.connected ? "centered" : ""}`}>
            {showMobileWalletButton ? (
              <Box>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleMobileWalletConnect}
                  style={{ backgroundColor: "#ffcc00", color: "#000", width: "100%" }}
                >
                  Connect Mobile Wallet
                </Button>
              </Box>
            ) : (
              <WalletMultiButton />
            )}
            {wallet.connected && (
              <>
                <Box mt={4}>
                  <Alert severity="warning">
                    Switch wallet to <b>{NETWORK_NAME}</b> network (<Link href="/guide#connect-wallet">How?</Link>) and
                    request SOL from{" "}
                    <a href="https://faucet.sonic.game/" target="_blank" rel="noreferrer noopener">
                      faucet
                    </a>{" "}
                    to play.
                  </Alert>
                </Box>
                <Box mt={4}>
                  {loading ? (
                    <CircularProgress />
                  ) : isInitialized ? (
                    <Button
                      variant="contained"
                      color="primary"
                      className="play-button"
                      onClick={() => navigate("/game")}
                    >
                      Continue Playing
                    </Button>
                  ) : (
                    <Button variant="contained" color="primary" className="play-button" onClick={initializePlayer}>
                      New Game
                    </Button>
                  )}
                </Box>
              </>
            )}
          </div>
          <div className="right-block">
            <div className="top-right-block">
              <div className="shining-container">
                <div className="shining-effect"></div>
              </div>
              <div className="image-container">
                <img src={`/lootbox-${lootboxLevel || 1}.png`} alt="Lootbox" className="lootbox-image" />
              </div>
            </div>
            <div className="bottom-right-block" onClick={claimLootbox}>
              <div className="shining-container">
                <div className="shining-effect"></div>
              </div>
              {!lootboxClaimed ? (
                <p className="upgrade-lootbox">Claim lootbox</p>
              ) : (
                <>
                  <p className="progression-text">Lootbox Progression</p>
                  <div className="progress-wrapper">
                    <LinearProgress
                      variant="determinate"
                      value={(silver / (lootboxLevel === 1 ? 1000 : lootboxLevel === 2 ? 2400 : 3800)) * 100}
                      className="progress-bar"
                    />
                    <span className="xp-text">
                      {silver} / {lootboxLevel === 1 ? 1000 : lootboxLevel === 2 ? 2400 : 3800} silver
                    </span>
                  </div>
                  {silver >= (lootboxLevel === 1 ? 1000 : lootboxLevel === 2 ? 2400 : 3800) && lootboxLevel < 4 && (
                    <Button
                      variant="contained"
                      color="primary"
                      style={{ background: "gold", marginTop: "10px", color: "#333" }}
                      className="upgrade-button"
                      onClick={upgradeLootbox}
                    >
                      Upgrade
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <ClaimLootboxModal
        open={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        signedIn={signedIn}
        twitterLinked={twitterLinked}
        followedOnTwitter={followedOnTwitter}
        xp={xp}
        linkTwitter={linkTwitter}
        followOnTwitter={followOnTwitter}
        onSignInSuccess={handleSignInSuccess}
        onClaim={handleClaimLootbox}
      />
      <HowToModal open={howToModalOpen} onClose={() => setHowToModalOpen(false)} />
    </div>
  );
};

export default HomeScreen;
