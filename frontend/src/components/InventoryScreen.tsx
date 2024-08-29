import React, { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Button, Grid, Typography, Box } from "@mui/material";
import SiteNavigation from "./SiteNavigation";
import useProgram from "../hooks/useProgram";
import "./InventoryScreen.css";

const InventoryScreen: React.FC = () => {
  const wallet = useWallet();
  const connection = useConnection();
  const program = useProgram();

  const [playerAccount, setPlayerAccount] = useState<any>(null);
  const [inventoryAccount, setInventoryAccount] = useState<any>(null);
  const [rings, setRings] = useState<number>(0);
  const [isOKApp, setIsOKApp] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfoWindow, setShowInfoWindow] = useState<boolean>(false);

  const fetchAccounts = async () => {
    if (!wallet.publicKey || !program) {
      setLoading(false);
      setError("Wallet is not connected");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [playerPda] = await PublicKey.findProgramAddress(
        [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
        program.programId
      );

      const [inventoryPda] = await PublicKey.findProgramAddress(
        [Buffer.from("INVENTORY"), wallet.publicKey.toBuffer()],
        program.programId
      );

      // @ts-ignore
      const player = await program.account.player.fetch(playerPda);
      setPlayerAccount(player);

      try {
        // @ts-ignore
        const inventory = await program.account.inventory.fetch(inventoryPda);
        setInventoryAccount(inventory);
      } catch (err) {
        console.log("Inventory account not initialized");
        setInventoryAccount(null);
      }
    } catch (err) {
      setError("Failed to fetch accounts");
      setInventoryAccount(null);
      setPlayerAccount(null);
      console.error(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsOKApp(/OKApp/i.test(ua));

    fetchAccounts();
  }, [wallet.publicKey, program]);

  const initializeInventory = async () => {
    if (!wallet.publicKey || !program) return;

    setLoading(true);
    setError(null);

    const [inventoryPda] = await PublicKey.findProgramAddress(
      [Buffer.from("INVENTORY"), wallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.rpc.initializeInventory({
        accounts: {
          inventory: inventoryPda,
          owner: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      setInventoryAccount({ items: [] });
    } catch (err) {
      setError("Failed to initialize inventory");
      console.error(err);
    }

    setLoading(false);
  };

  const renderInventoryItems = () => {
    const items: any = [];

    // Add hardcoded "PRE-SEASON BADGE"
    items.push({ name: "PRE-SEASON BADGE", image: "/early-bird.png" });

    if (inventoryAccount) {
      // Add items from inventory account
      inventoryAccount.items.forEach((item: any) => {
        if (item.thief) {
          items.push({ name: "Albert - LVL1", image: "/albert.png" });
        } else if (item.okxLootbox) {
          items.push({ name: "OKX LOOTBOX", image: "/okx-promo.png", opened: false });
        } else if (item.openedOkxLootbox) {
          items.push({ name: "OKX LOOTBOX", image: "/okx-promo.png", opened: true });
        }
      });

      // Add Lootbox if claimed in player account
      if (playerAccount && playerAccount.lootboxLevel > 0) {
        const lootboxImage = `/lootbox-${playerAccount.lootboxLevel}.png`;
        items.push({ name: `LOOTBOX LVL${playerAccount.lootboxLevel}`, image: lootboxImage });
      }
    }

    // Ensure at least 9 grid items
    while (items.length < 9) {
      items.push({ name: "", image: "" });
    }

    return items.map((item: { name: string; image: string; opened: boolean | undefined }, index: number) => (
      <Grid item xs={4} key={index} className="inventory-grid-item">
        {item.image ? (
          <div className={`inventory-item ${item.opened ? "grayscale" : ""}`}>
            <div className="shining-container">
              <div className="shining-effect"></div>
            </div>
            <img src={item.image} alt={item.name} />
            {item.opened && <span className="opened-label">OPENED</span>}
            <Typography className="item-label">
              {item.opened ? (
                item.name
              ) : item.name === "OKX LOOTBOX" ? (
                <Button
                  variant="contained"
                  style={{ backgroundColor: "#f2b24e", color: "#000", marginTop: "10px" }}
                  onClick={() => openLootbox()}
                >
                  Open
                </Button>
              ) : (
                item.name
              )}
            </Typography>
          </div>
        ) : (
          <div className="inventory-item empty"></div>
        )}
      </Grid>
    ));
  };

  const claimLootbox = async () => {
    if (!wallet.publicKey || !program) return;

    setLoading(true);
    setError(null);

    try {
      const [inventoryPda] = await PublicKey.findProgramAddress(
        [Buffer.from("INVENTORY"), wallet.publicKey.toBuffer()],
        program.programId
      );
      await program.rpc.claimOkxLootbox({
        accounts: {
          inventory: inventoryPda,
          owner: wallet.publicKey,
        },
      });
      // Re-fetch accounts after claiming
      fetchAccounts();
    } catch (err) {
      setError("Failed to claim OKX Lootbox");
      console.error(err);
    }

    setLoading(false);
  };

  const openLootbox = async () => {
    if (!wallet.publicKey || !program) return;

    setLoading(true);
    setError(null);

    try {
      const [playerPda] = await PublicKey.findProgramAddress(
        [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
        program.programId
      );

      const [inventoryPda] = await PublicKey.findProgramAddress(
        [Buffer.from("INVENTORY"), wallet.publicKey.toBuffer()],
        program.programId
      );
      await program.rpc.openOkxLootbox({
        accounts: {
          player: playerPda,
          inventory: inventoryPda,
          owner: wallet.publicKey,
        },
      });
      // Re-fetch accounts after opening
      fetchAccounts();
      setShowInfoWindow(true);
    } catch (err) {
      setError("Failed to open OKX Lootbox");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="inventory-page">
      <SiteNavigation />
      {isOKApp &&
        !loading &&
        playerAccount &&
        inventoryAccount &&
        !inventoryAccount.items.some((item: any) => item.okxLootbox || item.openedOkxLootbox) && (
          <Box className="okx-banner">
            <Box className="banner-text">
              <Typography variant="h6" className="banner-title">
                You are eligible to claim exclusive loot box for OKX Wallet users.
              </Typography>
              <Button
                variant="contained"
                onClick={() => claimLootbox()}
                style={{ backgroundColor: "#f2b24e", color: "#000", marginTop: "10px" }}
              >
                Claim
              </Button>
            </Box>
            <Box className="banner-image">
              <img src="/okx-promo.png" alt="OKX loot box" />
            </Box>
          </Box>
        )}
      <Box p={2} className="inventory-page-container">
        {loading && <p className="loading">Loading...</p>}
        {error && <p className="error">{error}</p>}
        {showInfoWindow && (
          <div className="info-window">
            <Box className="info-content">
              <Typography variant="body1" className="opening-result">
                You received 1000{" "}
                <img src="/dirty-money.png" width="24" alt="dirty cash" style={{ verticalAlign: "middle" }} />, 250{" "}
                <img src="/silver.png" width="24" style={{ verticalAlign: "middle" }} alt="silver" /> and 1{" "}
                <img src="/rings.png" width="24" style={{ verticalAlign: "middle" }} alt="rings" />
              </Typography>
            </Box>
          </div>
        )}
        {!loading && playerAccount && (
          <>
            <div className="balances">
              <Typography variant="h6">Silver: {playerAccount.silver.toNumber()}</Typography>
              {/* <Typography variant="h6">Rings: 0 <img src="/rings.png" width="24" alt="ring" /></Typography> */}
            </div>
            {!inventoryAccount ? (
              <>
                <hr />
                <Button
                  variant="contained"
                  style={{ background: "#f2b24e", color: "#000", width: "100%" }}
                  color="primary"
                  onClick={initializeInventory}
                >
                  Initialize Inventory
                </Button>
              </>
            ) : (
              <Grid container spacing={2} className="inventory-grid">
                {renderInventoryItems()}
              </Grid>
            )}
          </>
        )}
      </Box>
    </div>
  );
};

export default InventoryScreen;
